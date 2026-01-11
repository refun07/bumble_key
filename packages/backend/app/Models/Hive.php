<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hive extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
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
        'status', // active, maintenance, offline
        'photos',
    ];

    protected $casts = [
        'operating_hours' => 'array',
        'photos' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function partner()
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    public function cells()
    {
        return $this->hasMany(Cell::class);
    }

    public function nfcFobs()
    {
        return $this->hasMany(NfcFob::class, 'assigned_hive_id');
    }
}
