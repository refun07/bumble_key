<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\NfcFob;
use Illuminate\Http\Request;

class NfcFobController extends Controller
{
    public function index(Request $request)
    {
        $query = NfcFob::with('hive');

        if ($request->search) {
            $query->where('fob_name', 'like', "%{$request->search}%")
                ->orWhere('fob_uid', 'like', "%{$request->search}%");
        }

        if ($request->hive_status) {
            if ($request->hive_status === 'assigned') {
                $query->whereNotNull('assigned_hive_id');
            } else {
                $query->whereNull('assigned_hive_id');
            }
        }

        if ($request->slot_status) {
            if ($request->slot_status === 'assigned') {
                $query->whereNotNull('assigned_slot');
            } else {
                $query->whereNull('assigned_slot');
            }
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fob_name' => 'required|string|max:255',
            'fob_uid' => 'required|string|unique:nfc_fobs,fob_uid',
            'assigned_hive_id' => 'nullable|exists:hives,id',
            'assigned_slot' => 'nullable|string',
            'status' => 'nullable|string|in:available,assigned,damaged',
            'fob_serial' => 'nullable|string|unique:nfc_fobs,fob_serial',
        ]);

        if (empty($validated['fob_serial'])) {
            $validated['fob_serial'] = 'SN-' . strtoupper(uniqid());
        }

        if (empty($validated['status'])) {
            $validated['status'] = !empty($validated['assigned_hive_id']) ? 'assigned' : 'available';
        }

        $fob = NfcFob::create($validated);

        return response()->json([
            'message' => 'NFC Fob created successfully',
            'data' => $fob->load('hive'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $fob = NfcFob::findOrFail($id);

        $validated = $request->validate([
            'fob_name' => 'sometimes|required|string|max:255',
            'fob_uid' => 'sometimes|required|string|unique:nfc_fobs,fob_uid,' . $id,
            'assigned_hive_id' => 'nullable|exists:hives,id',
            'assigned_slot' => 'nullable|string',
            'status' => 'sometimes|required|string|in:available,assigned,damaged',
            'fob_serial' => 'sometimes|required|string|unique:nfc_fobs,fob_serial,' . $id,
        ]);

        if (isset($validated['assigned_hive_id']) && !isset($validated['status'])) {
            $validated['status'] = !empty($validated['assigned_hive_id']) ? 'assigned' : 'available';
        }

        $fob->update($validated);

        return response()->json([
            'message' => 'NFC Fob updated successfully',
            'data' => $fob->load('hive'),
        ]);
    }

    public function destroy($id)
    {
        $fob = NfcFob::findOrFail($id);
        $fob->delete();

        return response()->json([
            'message' => 'NFC Fob deleted successfully',
        ]);
    }
}
