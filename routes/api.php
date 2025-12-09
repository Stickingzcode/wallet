<?php

use Illuminate\Support\Facades\Route;

use App\Http\Middleware\EnsureIdempotency;

Route::get('transactions', [\App\Http\Controllers\Api\TransactionController::class, 'index']);
Route::post('transactions', [\App\Http\Controllers\Api\TransactionController::class, 'store'])
	->middleware(EnsureIdempotency::class);
