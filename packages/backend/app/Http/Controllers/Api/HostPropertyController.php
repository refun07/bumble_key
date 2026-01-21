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
        $properties = $request->user()->properties()->where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'data' => $properties,
        ]);
    }


    public function propertyList(Request $request)
    {
        $query = $request->user()
            ->properties()
            ->with([
                'host:id,name,email',
                'keys',
            ])
            ->select('properties.*');

        /**
         * Search
         */
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('state', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%")
                    ->orWhere('postal_code', 'like', "%{$search}%");
            });
        }

        /**
         * Active status filter
         */
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        /**
         * Sorting
         */
        $allowedSorts = [
            'title',
            'city',
            'created_at',
            'is_active',
        ];

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if (! in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }

        $query->orderBy($sortBy, $sortOrder);

        /**
         * Pagination
         */
        $perPage = $request->get('per_page', 10);

        return response()->json(
            $query->paginate($perPage)
        );
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
