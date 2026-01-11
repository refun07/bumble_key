<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cell extends Model
{
    use HasFactory;

    protected $fillable = [
        'hive_id',
        'cell_number',
        'hardware_id',
        'status', // available, occupied, maintenance, offline
        'last_heartbeat',
    ];

    protected $casts = [
        'last_heartbeat' => 'datetime',
    ];

    public function hive()
    {
        return $this->belongsTo(Hive::class);
    }

    public function currentAssignment()
    {
        return $this->hasOne(KeyAssignment::class)->where('state', '!=', 'closed');
    }
}
