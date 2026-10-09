<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ExpenseController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::get('/me', [AuthController::class, 'me'])
    ->middleware('auth:sanctum');

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::get('/expenses', [ExpenseController::class, 'index'])
    ->middleware('auth:sanctum');

Route::post('/expenses', [ExpenseController::class, 'store'])
    ->middleware('auth:sanctum');

Route::get('/expenses/{expense}', [ExpenseController::class, 'show'])
    ->middleware('auth:sanctum');

Route::put('/expenses/{expense}', [ExpenseController::class, 'update'])
    ->middleware('auth:sanctum');

Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy'])
    ->middleware('auth:sanctum');
