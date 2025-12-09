<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TransactionRequest;
use App\Models\IdempotencyKey;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $page = (int) $request->query('page', 1);

        $q = $request->query('q');
        $type = $request->query('type');
        $from = $request->query('from');
        $to = $request->query('to');

        $query = Transaction::query()->orderBy('created_at', 'desc');

        if ($q) {
            $query->where('reference', 'like', "%{$q}%");
        }

        if ($type) {
            $query->where('type', $type);
        }

        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        $totalIn = Transaction::query()->where('type', 'credit')->sum('amount');
        $totalOut = Transaction::query()->where('type', 'debit')->sum('amount');

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'total' => $paginator->total(),
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
            ],
            'summary' => [
                'total_in' => (float) number_format((float) $totalIn, 2, '.', ''),
                'total_out' => (float) number_format((float) $totalOut, 2, '.', ''),
            ],
        ]);
    }

    public function store(TransactionRequest $request): JsonResponse
    {
        $payload = $request->only(['wallet_id', 'type', 'amount', 'reference']);
        $idemKey = $request->input('idempotency_key');

        // Check idempotency
        $existing = IdempotencyKey::where('key', $idemKey)->first();
        if ($existing && $existing->response) {
            $stored = json_decode($existing->response, true);
            return response()->json($stored['body'], $stored['status']);
        }

        // Create or reserve idempotency key
        if (! $existing) {
            $existing = IdempotencyKey::create([
                'key' => $idemKey,
                'request_hash' => json_encode($payload),
            ]);
        }

        try {
            $result = DB::transaction(function () use ($payload) {
                $wallet = Wallet::where('id', $payload['wallet_id'])->lockForUpdate()->firstOrFail();

                $amount = (float) $payload['amount'];

                if ($payload['type'] === 'debit') {
                    if (bcsub((string) $wallet->balance, (string) $amount, 2) < 0) {
                        throw new \RuntimeException('Insufficient funds', 422);
                    }
                    $wallet->balance = bcsub((string) $wallet->balance, (string) $amount, 2);
                } else {
                    $wallet->balance = bcadd((string) $wallet->balance, (string) $amount, 2);
                }

                $wallet->save();

                $transaction = Transaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => $payload['type'],
                    'amount' => $amount,
                    'reference' => $payload['reference'],
                ]);

                return ['transaction' => $transaction, 'wallet' => $wallet];
            });
        } catch (\RuntimeException $e) {
            if ($e->getCode() === 422) {
                return response()->json(['message' => 'Insufficient funds'], 422);
            }
            throw $e;
        }

        $body = [
            'transaction' => $result['transaction'],
            'wallet_balance' => (float) number_format((float) $result['wallet']->balance, 2, '.', ''),
        ];

        $responsePayload = ['status' => 201, 'body' => $body];

        $existing->response = json_encode($responsePayload);
        $existing->save();

        return response()->json($body, 201);
    }
}
