<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Host\StorePropertyRequest;
use App\Http\Requests\Host\UpdatePropertyRequest;
use App\Models\Property;
use Illuminate\Http\Request;

class HostPropertyController extends Controller
{
    public function index(Request $request)
    {
        $properties = $request->user()->properties()
            ->latest()
            ->get();

        return response()->json([
            'data' => $properties,
        ]);
    }

    public function store(StorePropertyRequest $request)
    {
        $property = $request->user()->properties()->create($request->validated());

        return response()->json([
            'message' => 'Property created successfully',
            'data' => $property,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $property = $request->user()->properties()->findOrFail($id);

        return response()->json([
            'data' => $property,
        ]);
    }

    public function update(UpdatePropertyRequest $request, $id)
    {
        $property = $request->user()->properties()->findOrFail($id);

        $property->update($request->validated());

        return response()->json([
            'message' => 'Property updated successfully',
            'data' => $property,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $property = $request->user()->properties()->findOrFail($id);

        $property->delete();

        return response()->json([
            'message' => 'Property deleted successfully',
        ]);
    }
}
