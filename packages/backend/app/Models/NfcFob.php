<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NfcFob extends Model
{
    use HasFactory;

    protected $fillable = [
        'fob_name',
        'fob_uid',
        'fob_serial',
        'status', // available, assigned, damaged
        'assigned_hive_id',
        'assigned_slot',
    ];

    public function hive()
    {
        return $this->belongsTo(Hive::class, 'assigned_hive_id');
    }

    public function currentAssignment()
    {
        return $this->hasOne(KeyAssignment::class)->where('state', '!=', 'closed');
    }
}
