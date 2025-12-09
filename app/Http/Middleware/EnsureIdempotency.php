<?php

namespace App\Http\Middleware;

use App\Models\IdempotencyKey;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnsureIdempotency
{
    public function handle(Request $request, Closure $next)
    {
        $key = $request->input('idempotency_key');

        if (! $key) {
            return $next($request);
        }

        $existing = IdempotencyKey::where('key', $key)->first();

        if ($existing && $existing->response) {
            $stored = json_decode($existing->response, true);
            return response()->json($stored['body'], $stored['status']);
        }

        if (! $existing) {
            try {
                IdempotencyKey::create([
                    'key' => $key,
                    'request_hash' => json_encode($request->only(['wallet_id', 'type', 'amount', 'reference'])),
                ]);
            } catch (\Exception $e) {
                // ignore unique creation race
            }
        }

        return $next($request);
    }
}
