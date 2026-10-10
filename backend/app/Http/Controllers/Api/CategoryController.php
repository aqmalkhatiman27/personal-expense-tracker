<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = $request->user()->categories()->orderBy('name')->get();

        return response()->json(['data' => $categories], 200);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $request->user()->categories()->create($request->validated());

        return response()->json(['data' => $category], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse|Response
    {
        $category = $request->user()->categories()->findOrFail($id);

        if ($category->expenses()->exists()) {
            return response()->json([
                'message' => 'This category is in use and cannot be deleted.',
            ], 409);
        }

        $category->delete();

        return response()->noContent();
    }
}
