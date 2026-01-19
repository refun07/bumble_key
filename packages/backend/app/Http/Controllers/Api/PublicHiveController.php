<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hive;
use Illuminate\Http\Request;

class PublicHiveController extends Controller
{
    public function index(Request $request)
    {
        $hives = Hive::select([
                'id',
                'name',
                'location_name',
                'address',
                'city',
                'state',
                'country',
                'postal_code',
                'latitude',
                'longitude',
                'total_cells',
                'available_cells',
                'operating_hours',
                'photos',
            ])
            ->when($request->city, function ($query, $city) {
                $query->where('city', 'like', "%{$city}%");
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('location_name', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%");
                });
            })
            ->get();

        return response()->json($hives);
    }
}