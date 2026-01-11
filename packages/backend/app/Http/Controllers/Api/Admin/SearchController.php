<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Hive;
use App\Models\NfcFob;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('q');

        if (!$query) {
            return response()->json([]);
        }

        $results = [];

        // Search Users (Hosts and Partners)
        $users = User::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%");
        })
            ->whereIn('role', ['host', 'partner'])
            ->limit(5)
            ->get(['id', 'name', 'email', 'role']);

        foreach ($users as $user) {
            $results[] = [
                'id' => $user->id,
                'title' => $user->name,
                'subtitle' => $user->email,
                'type' => $user->role,
                'url' => $user->role === 'host' ? "/admin/hosts/{$user->id}" : "/admin/partners/{$user->id}"
            ];
        }

        // Search Hives
        $hives = Hive::where('hive_id', 'like', "%{$query}%")
            ->orWhere('location_name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'hive_id', 'location_name']);

        foreach ($hives as $hive) {
            $results[] = [
                'id' => $hive->id,
                'title' => $hive->hive_id,
                'subtitle' => $hive->location_name,
                'type' => 'box', // Keeping type as box for UI consistency if needed
                'url' => "/admin/boxes"
            ];
        }

        // Search NFC Fobs
        $fobs = NfcFob::where('fob_id', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'fob_id', 'status']);

        foreach ($fobs as $fob) {
            $results[] = [
                'id' => $fob->id,
                'title' => $fob->fob_id,
                'subtitle' => ucfirst($fob->status),
                'type' => 'fob',
                'url' => "/admin/nfc-fobs"
            ];
        }

        return response()->json($results);
    }
}
