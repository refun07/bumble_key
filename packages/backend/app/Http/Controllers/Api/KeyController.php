<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Key;
use Illuminate\Http\Request;
use App\Services\AuditLogger;

class KeyController extends Controller
{
    public function index(Request $request)
    {
        $keys = $request->user()->keys()
            ->with(['property', 'currentAssignment.cell.hive'])
            ->latest()
            ->paginate(10);

        return response()->json($keys);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'label' => 'required|string|max:255',
            'key_type' => 'required|in:master,duplicate,spare',
            'package_type' => 'required|in:weekly,monthly,yearly,pay_per_use',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
            'photo' => 'nullable|string', // Base64 or URL
            'hive_id' => 'nullable|exists:hives,id', // Optional initial drop-off
        ]);

        // Verify property belongs to user
        $property = $request->user()->properties()->findOrFail($validated['property_id']);

        $key = $request->user()->keys()->create([
            'property_id' => $property->id,
            'label' => $validated['label'],
            'key_type' => $validated['key_type'],
            'package_type' => $validated['package_type'],
            'description' => $validated['description'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'photo' => $validated['photo'] ?? null,
            'status' => 'created',
        ]);

        // If hive_id is provided, create a pending drop-off assignment
        if (!empty($validated['hive_id'])) {
            $key->assignments()->create([
                'hive_id' => $validated['hive_id'],
                'host_id' => $request->user()->id,
                'state' => 'pending_drop',
                'drop_off_code' => rand(100000, 999999), // Simple 6-digit code
            ]);

            $key->update(['status' => 'assigned']);
        }

        AuditLogger::log("Created a new key: {$key->label}", $key);

        return response()->json([
            'message' => 'Key registered successfully',
            'data' => $key->load('currentAssignment'),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $key = $request->user()->keys()
            ->with([
                'property',
                'currentAssignment.cell.hive',
                'assignments' => function ($query) {
                    $query->with(['cell.hive', 'guest'])->latest();
                }
            ])
            ->findOrFail($id);

        return response()->json([
            'data' => $key,
        ]);
    }

    public function update(Request $request, $id)
    {
        $key = $request->user()->keys()->findOrFail($id);

        $validated = $request->validate([
            'label' => 'sometimes|string|max:255',
            'package_type' => 'sometimes|in:weekly,monthly,pay_per_use',
            'notes' => 'nullable|string',
        ]);

        $key->update($validated);

        return response()->json([
            'message' => 'Key updated successfully',
            'data' => $key,
        ]);
    }
}
