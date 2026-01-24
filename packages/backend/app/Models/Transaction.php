<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'key_assignment_id',
        'amount',
        'currency',
        'type', // host_fee, partner_payout, guest_fee, refund
        'status', // pending, completed, failed, refunded
        'payment_gateway',
        'payment_method',
        'payment_gateway_ref',
        'invoice_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function keyAssignment()
    {
        return $this->belongsTo(KeyAssignment::class);
    }
}
