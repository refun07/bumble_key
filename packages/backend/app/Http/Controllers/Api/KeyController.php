<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Key;
use App\Models\Hive;
use Illuminate\Http\Request;
use App\Services\AuditLogger;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;


class KeyController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'status' => 'sometimes|in:created,assigned,deposited,available,picked_up,returned,closed,dispute,all',
        ]);

        $query = $request->user()->keys()
            ->with(['property', 'currentAssignment.cell.hive'])
            ->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('label', 'like', "%{$search}%")
                    ->orWhereHas('property', function ($propertyQuery) use ($search) {
                        $propertyQuery->where('address', 'like', "%{$search}%")
                            ->orWhere('title', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('hive_id')) {
            $query->whereHas('currentAssignment', function ($assignmentQuery) use ($request) {
                $assignmentQuery->where('hive_id', $request->hive_id);
            });
        }

        $pageLength = 10;

        $perPage = (int) $request->get('per_page', $pageLength);
        $perPage = $perPage > 0 ? $perPage : $pageLength;
        $keys = $query->paginate($perPage);

        return response()->json($keys);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'label' => 'required|string|max:255',
            'key_type' => 'required|in:master,duplicate,spare',
            'package_type' => 'required|in:weekly,monthly,yearly,pay_as_you_go',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
            'photo' => 'nullable|string', // Base64 or URL
            'hive_id' => 'nullable|exists:hives,id', // Optional initial drop-off
        ]);

        if ($validated['package_type'] === 'pay_as_you_go') {
            $validated['package_type'] = 'pay_per_use';
        }
        // Verify property belongs to user
        $property = $request->user()->properties()->findOrFail($validated['property_id']);


        /** -------------------------
         *  HANDLE BASE64 IMAGE
         *  -------------------------
         */
        $photoPath = null;

        if (!empty($validated['photo']) && Str::startsWith($validated['photo'], 'data:image')) {

            // Extract mime + data
            preg_match('/data:image\/(\w+);base64,/', $validated['photo'], $matches);
            $extension = $matches[1] ?? 'jpg';

            $imageData = substr($validated['photo'], strpos($validated['photo'], ',') + 1);
            $imageData = base64_decode($imageData);

            // Ensure directory exists
            Storage::disk('public')->makeDirectory('keys');

            // Generate filename
            $filename = 'keys/key_' . Str::uuid() . '.' . $extension;

            // Store file
            Storage::disk('public')->put($filename, $imageData);

            $photoPath = $filename;
        }

        $key = $request->user()->keys()->create([
            'property_id' => $property->id,
            'label' => $validated['label'],
            'key_type' => $validated['key_type'],
            'package_type' => $validated['package_type'],
            'description' => $validated['description'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'photo' =>  $photoPath  ?? null,
            'status' => 'created',
        ]);

        // If hive_id is provided, create a pending drop-off assignment
        if (!empty($validated['hive_id'])) {
            $hive = Hive::findOrFail($validated['hive_id']);

            $key->assignments()->create([
                'hive_id' => $hive->id,
                'host_id' => $request->user()->id,
                'partner_id' => $hive->partner_id,
                'state' => 'pending_drop',
                'drop_off_code' => strtoupper(Str::random(6)), // Unique 6-character code
                'pickup_code' => strtoupper(Str::random(6)),   // Unique 6-character code
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
                'currentAssignment.nfcFob',
                'assignments' => function ($query) {
                    $query->with(['cell.hive', 'guest', 'nfcFob'])->latest();
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
            'property_id' => 'sometimes|required|exists:properties,id',
            'label' => 'sometimes|required|string|max:255',
            'key_type' => 'sometimes|required|in:master,duplicate,spare',
            'package_type' => 'sometimes|required|in:weekly,monthly,yearly,pay_as_you_go',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
            'photo' => 'nullable|string',
            'hive_id' => 'nullable|exists:hives,id',
        ]);
        if ($validated['package_type'] === 'pay_as_you_go') {
            $validated['package_type'] = 'pay_per_use';
        }

        if (isset($validated['property_id'])) {
            $request->user()->properties()->findOrFail($validated['property_id']);
        }

        /** -------------------------
         *  HANDLE BASE64 IMAGE UPDATE
         *  -------------------------
         */
        if (
            array_key_exists('photo', $validated) &&
            !empty($validated['photo']) &&
            Str::startsWith($validated['photo'], 'data:image')
        ) {
            // Extract extension
            preg_match('/data:image\/(\w+);base64,/', $validated['photo'], $matches);
            $extension = $matches[1] ?? 'jpg';

            $imageData = substr($validated['photo'], strpos($validated['photo'], ',') + 1);
            $imageData = base64_decode($imageData);

            // Ensure directory exists
            Storage::disk('public')->makeDirectory('keys');

            // Delete old photo if exists
            if ($key->photo && Storage::disk('public')->exists($key->photo)) {
                Storage::disk('public')->delete($key->photo);
            }

            // Store new photo
            $filename = 'keys/key_' . Str::uuid() . '.' . $extension;
            Storage::disk('public')->put($filename, $imageData);

            $validated['photo'] = $filename;
        } else {
            // Prevent overwriting existing photo with base64 or empty string
            unset($validated['photo']);
        }


        $hiveId = $validated['hive_id'] ?? null;
        if (array_key_exists('hive_id', $validated)) {
            unset($validated['hive_id']);
        }

        $key->update($validated);

        if (!empty($hiveId)) {
            $hive = Hive::findOrFail($hiveId);
            $currentAssignment = $key->currentAssignment;

            if (!$currentAssignment || $currentAssignment->hive_id !== $hive->id) {
                $key->assignments()->create([
                    'hive_id' => $hive->id,
                    'host_id' => $request->user()->id,
                    'partner_id' => $hive->partner_id,
                    'state' => 'pending_drop',
                    'drop_off_code' => strtoupper(Str::random(6)),
                    'pickup_code' => strtoupper(Str::random(6)),
                ]);

                $key->update(['status' => 'assigned']);
            }
        }

        return response()->json([
            'message' => 'Key updated successfully',
            'data' => $key->load('currentAssignment'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $key = $request->user()->keys()
            ->with('currentAssignment')
            ->findOrFail($id);

        $blockedStates = ['picked_up', 'in_use'];
        if ($key->currentAssignment && in_array($key->currentAssignment->state, $blockedStates, true)) {
            return response()->json([
                'message' => 'Key is currently in use and cannot be deleted.',
            ], 422);
        }

        if ($key->photo && Storage::disk('public')->exists($key->photo)) {
            Storage::disk('public')->delete($key->photo);
        }

        $key->delete();

        return response()->json([
            'message' => 'Key deleted successfully',
        ]);
    }
}
