<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KeyAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'key_id',
        'hive_id',
        'cell_id',
        'nfc_fob_id',
        'host_id',
        'partner_id',
        'guest_id',
        'drop_off_code',
        'pickup_code',
        'state', // pending_drop, dropped, available, picked_up, in_use, returned_pending, returned_confirmed, closed, dispute
        'scheduled_drop_at',
        'dropped_at',
        'available_at',
        'picked_up_at',
        'expected_return_at',
        'returned_at',
        'closed_at',
    ];

    protected $casts = [
        'scheduled_drop_at' => 'datetime',
        'dropped_at' => 'datetime',
        'available_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'expected_return_at' => 'datetime',
        'returned_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function key()
    {
        return $this->belongsTo(Key::class);
    }

    public function hive()
    {
        return $this->belongsTo(Hive::class);
    }

    public function cell()
    {
        return $this->belongsTo(Cell::class);
    }

    public function nfcFob()
    {
        return $this->belongsTo(NfcFob::class);
    }

    public function host()
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function partner()
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    public function guest()
    {
        return $this->belongsTo(User::class, 'guest_id');
    }

    public function accessTokens()
    {
        return $this->hasMany(AccessToken::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function disputes()
    {
        return $this->hasMany(Dispute::class);
    }
}
