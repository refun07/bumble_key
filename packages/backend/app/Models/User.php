<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'business_name',
        'email',
        'phone',
        'address',
        'latitude',
        'longitude',
        'availability',
        'unavailable_dates',
        'location_image',
        'password',
        'role', // admin, host, partner, guest
        'profile_photo',
        'is_active',
        'phone_verified_at',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'can_login',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'availability' => 'json',
            'unavailable_dates' => 'json',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    // Relationships

    public function properties()
    {
        return $this->hasMany(Property::class, 'host_id');
    }

    public function keys()
    {
        return $this->hasMany(Key::class, 'host_id');
    }

    public function hives()
    {
        return $this->hasMany(Hive::class, 'partner_id');
    }

    // Assignments where user is the host
    public function hostAssignments()
    {
        return $this->hasMany(KeyAssignment::class, 'host_id');
    }

    // Assignments where user is the partner
    public function partnerAssignments()
    {
        return $this->hasMany(KeyAssignment::class, 'partner_id');
    }

    // Assignments where user is the guest
    public function guestAssignments()
    {
        return $this->hasMany(KeyAssignment::class, 'guest_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
