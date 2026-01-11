<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            return;
        }

        $actions = [
            'login' => 'User logged in',
            'logout' => 'User logged out',
            'create_key' => 'Created a new key: Melbourne001',
            'assign_key' => 'Assigned key to guest: John Doe',
            'update_profile' => 'Updated business profile',
            'register_host' => 'Registered a new host: Sarah Smith',
            'create_hive' => 'Created a new BumbleHive: London Central',
            'delete_key' => 'Deleted key: OldKey123',
        ];

        for ($i = 0; $i < 50; $i++) {
            $user = $users->random();
            $actionKey = array_rand($actions);

            AuditLog::create([
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'action' => $actions[$actionKey],
                'performed_by' => $user->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'metadata' => ['action_key' => $actionKey],
                'created_at' => now()->subMinutes(rand(1, 10000)),
            ]);
        }
    }
}
