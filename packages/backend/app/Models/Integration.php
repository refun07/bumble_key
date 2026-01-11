<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Integration extends Model
{
    protected $fillable = [
        'host_id',
        'platform',
        'external_id',
        'access_token',
        'refresh_token',
        'expires_at',
        'status',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function host()
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function externalListings()
    {
        return $this->hasMany(ExternalListing::class);
    }
}
