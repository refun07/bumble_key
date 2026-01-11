<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalListing extends Model
{
    protected $fillable = [
        'integration_id',
        'external_id',
        'property_id',
        'key_id',
        'name',
        'address',
        'raw_data',
    ];

    protected $casts = [
        'raw_data' => 'array',
    ];

    public function integration()
    {
        return $this->belongsTo(Integration::class);
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function key()
    {
        return $this->belongsTo(Key::class);
    }

    public function externalBookings()
    {
        return $this->hasMany(ExternalBooking::class);
    }
}
