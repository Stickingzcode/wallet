<?php

namespace Tests\Feature;

use App\Models\IdempotencyKey;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_creates_credit_and_updates_balance(): void
    {
        $wallet = Wallet::first();

        $payload = [
            'wallet_id' => $wallet->id,
            'type' => 'credit',
            'amount' => 2500.50,
            'reference' => 'CREDIT-001',
            'idempotency_key' => 'idem-credit-1',
        ];

        $res = $this->postJson('/api/transactions', $payload);
        $res->assertStatus(201);
        $res->assertJsonPath('transaction.reference', 'CREDIT-001');

        $wallet->refresh();
        $this->assertEquals(102500.50, (float) $wallet->balance);
    }

    public function test_prevents_overdraft_on_debit(): void
    {
        $wallet = Wallet::first();

        $payload = [
            'wallet_id' => $wallet->id,
            'type' => 'debit',
            'amount' => 1000000.00,
            'reference' => 'DEBIT-OVER-001',
            'idempotency_key' => 'idem-debit-1',
        ];

        $res = $this->postJson('/api/transactions', $payload);
        $res->assertStatus(422);
    }

    public function test_repeating_same_idempotency_key_returns_same_result(): void
    {
        $wallet = Wallet::first();

        $payload = [
            'wallet_id' => $wallet->id,
            'type' => 'debit',
            'amount' => 1000.00,
            'reference' => 'DEBIT-001',
            'idempotency_key' => 'idem-debit-repeat',
        ];

        $first = $this->postJson('/api/transactions', $payload);
        $first->assertStatus(201);

        $second = $this->postJson('/api/transactions', $payload);
        $second->assertStatus(201);
        $this->assertEquals($first->json(), $second->json());

        $this->assertCount(1, Transaction::where('reference', 'DEBIT-001')->get());
    }

    public function test_get_transactions_filters_and_summary(): void
    {
        $wallet = Wallet::first();

        // create a mix of transactions
        $this->postJson('/api/transactions', [
            'wallet_id' => $wallet->id,
            'type' => 'credit',
            'amount' => 100,
            'reference' => 'SEARCH-ONE',
            'idempotency_key' => 's1',
        ])->assertStatus(201);

        $this->postJson('/api/transactions', [
            'wallet_id' => $wallet->id,
            'type' => 'debit',
            'amount' => 40,
            'reference' => 'SEARCH-TWO',
            'idempotency_key' => 's2',
        ])->assertStatus(201);

        $res = $this->getJson('/api/transactions?per_page=10&q=SEARCH&type=credit');
        $res->assertStatus(200);
        $json = $res->json();
        $this->assertArrayHasKey('summary', $json);
        $this->assertEquals(100.00, $json['summary']['total_in']);
    }
}
