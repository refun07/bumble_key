<?php

namespace Database\Seeders;

use App\Models\Hive;
use App\Models\NfcFob;
use Illuminate\Database\Seeder;

class NfcFobSeeder extends Seeder
{
    public function run(): void
    {
        $hives = Hive::all();

        $fobs = [
            [
                'fob_name' => 'BumbleTag001',
                'fob_uid' => 'ABC001',
                'fob_serial' => 'SN001',
                'status' => 'available',
                'assigned_hive_id' => null,
                'assigned_slot' => null,
            ],
            [
                'fob_name' => 'BumbleTag002',
                'fob_uid' => 'ABC002',
                'fob_serial' => 'SN002',
                'status' => 'assigned',
                'assigned_hive_id' => $hives->where('name', 'BumbleHive001')->first()?->id,
                'assigned_slot' => 'Slot 02',
            ],
            [
                'fob_name' => 'BumbleTag003',
                'fob_uid' => 'ABC003',
                'fob_serial' => 'SN003',
                'status' => 'assigned',
                'assigned_hive_id' => $hives->where('name', 'BumbleHive001')->first()?->id,
                'assigned_slot' => 'Slot 01',
            ],
            [
                'fob_name' => 'BumbleTag004',
                'fob_uid' => 'ABC004',
                'fob_serial' => 'SN004',
                'status' => 'assigned',
                'assigned_hive_id' => $hives->where('name', 'BumbleHive002')->first()?->id,
                'assigned_slot' => 'Slot 03',
            ],
            [
                'fob_name' => 'BumbleTag005',
                'fob_uid' => 'ABC005',
                'fob_serial' => 'SN005',
                'status' => 'assigned',
                'assigned_hive_id' => $hives->where('name', 'BumbleHive003')->first()?->id,
                'assigned_slot' => 'Slot 05',
            ],
        ];

        foreach ($fobs as $fobData) {
            NfcFob::create($fobData);
        }
    }
}
