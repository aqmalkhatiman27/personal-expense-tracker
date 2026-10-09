<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $expenses = $request->user()->expenses()->get();

        return response()->json(['data' => $expenses], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreExpenseRequest $request)
    {
        $expense = $request->user()->expenses()->create($request->validated());

        return response()->json(['data' => $expense], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $expense = $request->user()->expenses()->findOrFail($id);

        return response()->json(['data' => $expense], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateExpenseRequest $request, string $id)
    {
        $expense = $request->user()->expenses()->findOrFail($id);
        $expense->update($request->validated());

        return response()->json(['data' => $expense], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $expense = $request->user()->expenses()->findOrFail($id);
        $expense->delete();

        return response()->noContent();
    }
}
