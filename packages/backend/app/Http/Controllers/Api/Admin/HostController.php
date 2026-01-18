<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Services\AuditLogger;

class HostController extends Controller
{
    public function index(Request $request)
    {
        $hosts = User::where('role', 'host')
            ->withCount('keys')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                if ($status === 'active') {
                    $query->where('is_active', true);
                } elseif ($status === 'inactive') {
                    $query->where('is_active', false);
                }
            })
            ->with([
                'keys' => function ($query) {
                    $query->select('host_id', 'package_type');
                }
            ])
            ->latest()
            ->paginate(2);

        $hosts->getCollection()->transform(function ($host) {
            $host->package_types = $host->keys->pluck('package_type')->unique()->values()->all();
            unset($host->keys);
            return $host;
        });

        return response()->json($hosts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
        ]);

        $host = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'role' => 'host',
            'is_active' => true,
        ]);

        AuditLogger::log("Registered a new host: {$host->name}", $host);

        return response()->json([
            'message' => 'Host created successfully',
            'data' => $host,
        ], 201);
    }

    public function show($id)
    {
        $host = User::where('role', 'host')
            ->with([
                'keys.property',
                'keys.currentAssignment.cell.hive',
                'keys.currentAssignment.nfcFob',
                'keys.assignments.transactions',
                'transactions' => function ($query) {
                    $query->latest()->limit(10);
                }
            ])
            ->withCount('keys')
            ->findOrFail($id);

        return response()->json([
            'data' => $host,
        ]);
    }

    public function update(Request $request, $id)
    {
        $host = User::where('role', 'host')->findOrFail($id);

        $validated = $request->validate([
            'is_active' => 'boolean',
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $host->update($validated);

        AuditLogger::log("Updated host profile: {$host->name}", $host);

        return response()->json([
            'message' => 'Host updated successfully',
            'data' => $host,
        ]);
    }
}
