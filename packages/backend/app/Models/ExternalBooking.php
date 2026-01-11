<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalBooking extends Model
{
    protected $fillable = [
        'external_listing_id',
        'external_id',
        'key_assignment_id',
        'guest_name',
        'check_in',
        'check_out',
        'status',
        'raw_data',
    ];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'raw_data' => 'array',
    ];

    public function externalListing()
    {
        return $this->belongsTo(ExternalListing::class);
    }

    public function keyAssignment()
    {
        return $this->belongsTo(KeyAssignment::class);
    }
}
