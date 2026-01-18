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
            ->when($request->filled('status'), function ($query) use ($request) {
                if ($request->status === 'active') {
                    $query->where('is_active', true);
                } elseif ($request->status === 'inactive') {
                    $query->where('is_active', false);
                }
            })
            ->latest()
            ->paginate(10);

        return response()->json($partners);
    }

    public function store(Request $request)
    {
        if ($request->has('availability') && is_string($request->availability)) {
            $decodedAvailability = json_decode($request->availability, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $request->merge(['availability' => $decodedAvailability]);
            }
        }
        if ($request->has('unavailable_dates') && is_string($request->unavailable_dates)) {
            $decodedUnavailableDates = json_decode($request->unavailable_dates, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $request->merge(['unavailable_dates' => $decodedUnavailableDates]);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'availability' => 'nullable|array',
            'unavailable_dates' => 'nullable|array',
            'location_image' => 'nullable|image|max:2048',
            'can_login' => 'nullable|boolean',
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
            'unavailable_dates' => $validated['unavailable_dates'] ?? null,
            'location_image' => $validated['location_image'] ?? null,
            'is_active' => true,
            'can_login' => $validated['can_login'] ?? true,
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

        if ($request->has('availability') && is_string($request->availability)) {
            $decodedAvailability = json_decode($request->availability, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $request->merge(['availability' => $decodedAvailability]);
            }
        }
        if ($request->has('unavailable_dates') && is_string($request->unavailable_dates)) {
            $decodedUnavailableDates = json_decode($request->unavailable_dates, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $request->merge(['unavailable_dates' => $decodedUnavailableDates]);
            }
        }

        $validated = $request->validate([
            'is_active' => 'boolean',
            'name' => 'string|max:255',
            'business_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'sometimes|nullable|string|min:8|confirmed',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'availability' => 'nullable|array',
            'unavailable_dates' => 'nullable|array',
            'location_image' => 'nullable|image|max:2048',
            'can_login' => 'sometimes|boolean',
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
