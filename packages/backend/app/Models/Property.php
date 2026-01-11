<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'host_id',
        'title',
        'description',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'latitude',
        'longitude',
        'photos',
        'instructions',
        'is_active',
    ];

    protected $casts = [
        'photos' => 'array',
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function host()
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function keys()
    {
        return $this->hasMany(Key::class);
    }
}
