<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Services\AuditLogger;

class PartnerController extends Controller
{
    public function index(Request $request)
    {
        $partners = User::where('role', 'partner')
            ->with('hives')
            ->withCount([
                'partnerAssignments as active_keys_count' => function ($query) {
                    $query->whereIn('state', ['dropped', 'available', 'picked_up']);
                }
            ])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10);

        return response()->json($partners);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'availability' => 'nullable|array',
            'location_image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('location_image')) {
            $path = $request->file('location_image')->store('partners', 'public');
            $validated['location_image'] = $path;
        }

        $partner = User::create([
            'name' => $validated['name'],
            'business_name' => $validated['business_name'] ?? null,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'partner',
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'availability' => $validated['availability'] ?? null,
            'location_image' => $validated['location_image'] ?? null,
            'is_active' => true,
        ]);

        AuditLogger::log("Registered a new partner: {$partner->name}", $partner);

        return response()->json([
            'message' => 'Partner created successfully',
            'data' => $partner,
        ], 201);
    }

    public function show($id)
    {
        $partner = User::where('role', 'partner')
            ->with('hives')
            ->findOrFail($id);

        return response()->json([
            'data' => $partner,
        ]);
    }

    public function update(Request $request, $id)
    {
        $partner = User::where('role', 'partner')->findOrFail($id);

        $validated = $request->validate([
            'is_active' => 'boolean',
            'name' => 'string|max:255',
            'business_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'availability' => 'nullable|array',
            'location_image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('location_image')) {
            $path = $request->file('location_image')->store('partners', 'public');
            $validated['location_image'] = $path;
        }

        $partner->update($validated);

        AuditLogger::log("Updated partner profile: {$partner->name}", $partner);

        return response()->json([
            'message' => 'Partner updated successfully',
            'data' => $partner,
        ]);
    }
}
