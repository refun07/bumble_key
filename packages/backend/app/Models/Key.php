<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Key extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'host_id',
        'label',
        'description',
        'photo',
        'serial_number',
        'key_type', // master, duplicate, spare
        'package_type', // weekly, monthly, pay_per_use,yearly
        'package_price',
        'subscription_ends_at',
        'notes',
        'status', // created, assigned, deposited, available, picked_up, returned, closed, dispute
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function host()
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function assignments()
    {
        return $this->hasMany(KeyAssignment::class);
    }

    public function currentAssignment()
    {
        return $this->hasOne(KeyAssignment::class)->latestOfMany();
    }

    protected function packageType(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value === 'pay_per_use'
                ? 'pay_as_you_go'
                : $value
        );
    }
}
