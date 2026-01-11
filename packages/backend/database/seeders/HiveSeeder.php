<?php

namespace Database\Seeders;

use App\Models\Hive;
use App\Models\User;
use Illuminate\Database\Seeder;

class HiveSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create a partner user
        $partner = User::where('role', 'partner')->first();

        if (!$partner) {
            $partner = User::create([
                'name' => 'Demo Partner',
                'email' => 'partner@bumblekey.com',
                'password' => bcrypt('password'),
                'role' => 'partner',
            ]);
        }

        $hives = [
            [
                'name' => 'IGA Xpress St Kilda Road',
                'location_name' => 'IGA Xpress',
                'address' => '123 St Kilda Road',
                'city' => 'Melbourne',
                'state' => 'VIC',
                'country' => 'Australia',
                'postal_code' => '3004',
                'latitude' => -37.8404,
                'longitude' => 144.9784,
                'total_cells' => 20,
                'available_cells' => 15,
                'operating_hours' => ['open' => '06:00', 'close' => '23:00'],
                'status' => 'active',
            ],
            [
                'name' => 'Ezymart Bourke Street',
                'location_name' => 'Ezymart',
                'address' => '456 Bourke Street',
                'city' => 'Melbourne',
                'state' => 'VIC',
                'country' => 'Australia',
                'postal_code' => '3000',
                'latitude' => -37.8136,
                'longitude' => 144.9631,
                'total_cells' => 15,
                'available_cells' => 8,
                'operating_hours' => ['open' => '07:00', 'close' => '22:00'],
                'status' => 'active',
            ],
            [
                'name' => 'Flinders Gifts',
                'location_name' => 'Flinders Street Station',
                'address' => '1 Flinders Street',
                'city' => 'Melbourne',
                'state' => 'VIC',
                'country' => 'Australia',
                'postal_code' => '3000',
                'latitude' => -37.8183,
                'longitude' => 144.9671,
                'total_cells' => 25,
                'available_cells' => 20,
                'operating_hours' => ['open' => '05:00', 'close' => '00:00'],
                'status' => 'active',
            ],
            [
                'name' => 'Ezymart 180 Russell',
                'location_name' => 'Ezymart Russell Street',
                'address' => '180 Russell Street',
                'city' => 'Melbourne',
                'state' => 'VIC',
                'country' => 'Australia',
                'postal_code' => '3000',
                'latitude' => -37.8109,
                'longitude' => 144.9690,
                'total_cells' => 12,
                'available_cells' => 10,
                'operating_hours' => ['open' => '00:00', 'close' => '23:59'],
                'status' => 'active',
            ],
            [
                'name' => 'Woolworths Metro Sydney CBD',
                'location_name' => 'Woolworths Metro',
                'address' => '25 George Street',
                'city' => 'Sydney',
                'state' => 'NSW',
                'country' => 'Australia',
                'postal_code' => '2000',
                'latitude' => -33.8688,
                'longitude' => 151.2093,
                'total_cells' => 30,
                'available_cells' => 22,
                'operating_hours' => ['open' => '06:00', 'close' => '22:00'],
                'status' => 'active',
            ],
            [
                'name' => 'Coles Express Bondi',
                'location_name' => 'Coles Express',
                'address' => '88 Bondi Road',
                'city' => 'Sydney',
                'state' => 'NSW',
                'country' => 'Australia',
                'postal_code' => '2026',
                'latitude' => -33.8915,
                'longitude' => 151.2767,
                'total_cells' => 18,
                'available_cells' => 14,
                'operating_hours' => ['open' => '05:30', 'close' => '21:00'],
                'status' => 'active',
            ],
            [
                'name' => 'Circle K Darling Harbour',
                'location_name' => 'Circle K',
                'address' => '15 Harbour Street',
                'city' => 'Sydney',
                'state' => 'NSW',
                'country' => 'Australia',
                'postal_code' => '2000',
                'latitude' => -33.8750,
                'longitude' => 151.2000,
                'total_cells' => 20,
                'available_cells' => 16,
                'operating_hours' => ['open' => '00:00', 'close' => '23:59'],
                'status' => 'active',
            ],
            [
                'name' => 'BP Connect Brisbane CBD',
                'location_name' => 'BP Connect',
                'address' => '200 Adelaide Street',
                'city' => 'Brisbane',
                'state' => 'QLD',
                'country' => 'Australia',
                'postal_code' => '4000',
                'latitude' => -27.4698,
                'longitude' => 153.0251,
                'total_cells' => 15,
                'available_cells' => 12,
                'operating_hours' => ['open' => '06:00', 'close' => '22:00'],
                'status' => 'active',
            ],
            [
                'name' => 'Night Owl Gold Coast',
                'location_name' => 'Night Owl Cavill Avenue',
                'address' => '42 Cavill Avenue',
                'city' => 'Surfers Paradise',
                'state' => 'QLD',
                'country' => 'Australia',
                'postal_code' => '4217',
                'latitude' => -28.0027,
                'longitude' => 153.4300,
                'total_cells' => 25,
                'available_cells' => 18,
                'operating_hours' => ['open' => '00:00', 'close' => '23:59'],
                'status' => 'active',
            ],
            [
                'name' => 'IGA Perth City',
                'location_name' => 'IGA Express',
                'address' => '55 Murray Street',
                'city' => 'Perth',
                'state' => 'WA',
                'country' => 'Australia',
                'postal_code' => '6000',
                'latitude' => -31.9505,
                'longitude' => 115.8605,
                'total_cells' => 20,
                'available_cells' => 17,
                'operating_hours' => ['open' => '07:00', 'close' => '21:00'],
                'status' => 'active',
            ],
        ];

        foreach ($hives as $hiveData) {
            Hive::updateOrCreate(
                ['name' => $hiveData['name']],
                array_merge($hiveData, ['partner_id' => $partner->id])
            );
        }

        $this->command->info('Created ' . count($hives) . ' sample BumbleHive locations!');
    }
}
