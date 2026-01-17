<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HiveController extends Controller
{

    public function hiveList()
    {
        $hiveList = Hive::query()
            ->select('id', 'name', 'location_name', 'partner_id', 'status')
            ->orderBy('name')
            ->whereIn('status', ['idle', 'active'])
            ->get();

        return response()->json($hiveList);
    }
    // public function index(Request $request)
    // {
    //     $query = Hive::query();

    //     // Search filter
    //     if ($request->search) {
    //         $query->where(function ($q) use ($request) {
    //             $q->where('name', 'like', "%{$request->search}%")
    //                 ->orWhere('location_name', 'like', "%{$request->search}%")
    //                 ->orWhere('address', 'like', "%{$request->search}%")
    //                 ->orWhere('city', 'like', "%{$request->search}%");
    //         });
    //     }

    //     // Status filter
    //     if ($request->status) {
    //         $query->where('status', $request->status);
    //     }

    //     // Availability filter
    //     if ($request->availability) {
    //         if ($request->availability === 'available') {
    //             $query->whereHas('cells', function ($q) {
    //                 $q->where('status', 'available');
    //             });
    //         } elseif ($request->availability === 'full') {
    //             $query->whereDoesntHave('cells', function ($q) {
    //                 $q->where('status', 'available');
    //             });
    //         }
    //     }

    //     $hives = $query->with(['partner'])->withCount([
    //         'cells as available_cells_count' => function ($query) {
    //             $query->where('status', 'available');
    //         }
    //     ]);

    //     // Sorting
    //     $sortBy = $request->get('sort_by', 'name');
    //     $sortOrder = $request->get('sort_order', 'asc');

    //     if ($sortBy === 'available_cells_count') {
    //         $hives->orderBy('available_cells_count', $sortOrder);
    //     } else {
    //         $hives->orderBy($sortBy, $sortOrder);
    //     }

    //     $hives = $hives->paginate(20);

    //     return response()->json($hives);
    // }

    public function index(Request $request)
    {
        $query = Hive::query();

        // Search filter
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('location_name', 'like', "%{$request->search}%")
                    ->orWhere('address', 'like', "%{$request->search}%")
                    ->orWhere('city', 'like', "%{$request->search}%");
            });
        }

        // Status filter
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $hives = $query
            ->with('partner')
            ->select('hives.*')
            ->selectRaw('available_cells as available_cells_count');

        // Sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');

        if ($sortBy === 'available_cells_count') {
            $hives->orderBy('available_cells', $sortOrder);
        } else {
            $hives->orderBy($sortBy, $sortOrder);
        }

        return response()->json($hives->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'partner_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255|unique:hives,name',
            'location_name' => 'required|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string',
            'country' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'total_cells' => 'required|integer|min:1',
            'operating_hours' => 'nullable|array',
            'image' => 'nullable|image|max:2048',
        ]);

        $validated['available_cells'] = $validated['total_cells'];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('hives', 'public');
            $validated['photos'] = [$path];
        }

        // Default status for new boxes
        $validated['status'] = 'idle';

        $hive = Hive::create($validated);

        // Create cells automatically
        for ($i = 1; $i <= $validated['total_cells']; $i++) {
            $hive->cells()->create([
                'cell_number' => $i,
                'status' => 'available',
            ]);
        }

        return response()->json([
            'message' => 'Hive created successfully',
            'data' => $hive->load('partner'),
        ], 201);
    }

    public function show($id)
    {
        $hive = Hive::with(['partner', 'cells'])->findOrFail($id);

        return response()->json([
            'data' => $hive,
        ]);
    }

    public function update(Request $request, $id)
    {
        $hive = Hive::findOrFail($id);

        $validated = $request->validate([
            'partner_id' => 'sometimes|required|exists:users,id',
            'name' => 'sometimes|required|string|max:255|unique:hives,name,' . $id,
            'location_name' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string',
            'city' => 'sometimes|required|string',
            'country' => 'sometimes|required|string',
            'latitude' => 'sometimes|required|numeric',
            'longitude' => 'sometimes|required|numeric',
            'status' => 'sometimes|required|string', // assigned, idle, maintenance, offline, disabled
            'image' => 'nullable|image|max:2048',
        ]);


        /* ----------------------------------------
       🗑️ REMOVE IMAGE (explicit)
    ---------------------------------------- */
        if ($request->boolean('remove_image')) {
            if (is_array($hive->photos)) {
                foreach ($hive->photos as $photo) {
                    Storage::disk('public')->delete($photo);
                }
            }

            $validated['photos'] = null;
        }

        /* ----------------------------------------
       📸 REPLACE IMAGE
    ---------------------------------------- */
        if ($request->hasFile('image')) {
            // delete old images first
            if (is_array($hive->photos)) {
                foreach ($hive->photos as $photo) {
                    Storage::disk('public')->delete($photo);
                }
            }

            $path = $request->file('image')->store('hives', 'public');
            $validated['photos'] = [$path];
        }
        // if ($request->hasFile('image')) {
        //     $path = $request->file('image')->store('hives', 'public');
        //     $validated['photos'] = [$path];
        // }

        $hive->update($validated);

        return response()->json([
            'message' => 'Hive updated successfully',
            'data' => $hive,
        ]);
    }

    public function destroy($id)
    {
        $hive = Hive::findOrFail($id);
        $hive->delete();

        return response()->json([
            'message' => 'Hive deleted successfully',
        ]);
    }
}
