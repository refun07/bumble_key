<?php

namespace Tests\Feature\Api;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HostPropertyTest extends TestCase
{
    use RefreshDatabase;

    public function test_host_can_create_property()
    {
        $user = User::factory()->create(['role' => 'host']);

        $response = $this->actingAs($user)->postJson('/api/hosts/properties', [
            'title' => 'Test Apartment',
            'address' => '123 Test St',
            'city' => 'Test City',
            'country' => 'Test Country',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Test Apartment');

        $this->assertDatabaseHas('properties', [
            'title' => 'Test Apartment',
            'host_id' => $user->id,
        ]);
    }

    public function test_host_can_list_properties()
    {
        $user = User::factory()->create(['role' => 'host']);
        Property::factory()->count(3)->create(['host_id' => $user->id]);

        $response = $this->actingAs($user)->getJson('/api/hosts/properties');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_host_can_update_property()
    {
        $user = User::factory()->create(['role' => 'host']);
        $property = Property::factory()->create(['host_id' => $user->id]);

        $response = $this->actingAs($user)->putJson("/api/hosts/properties/{$property->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Title');

        $this->assertDatabaseHas('properties', [
            'id' => $property->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_host_cannot_update_others_property()
    {
        $user = User::factory()->create(['role' => 'host']);
        $otherUser = User::factory()->create(['role' => 'host']);
        $property = Property::factory()->create(['host_id' => $otherUser->id]);

        $response = $this->actingAs($user)->putJson("/api/hosts/properties/{$property->id}", [
            'title' => 'Hacked Title',
        ]);

        $response->assertStatus(403);
    }
}
