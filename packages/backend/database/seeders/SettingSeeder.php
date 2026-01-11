<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $pricingSettings = [
            ['key' => 'pay_as_you_go_price', 'value' => '5', 'type' => 'float', 'group' => 'pricing'],
            ['key' => 'monthly_price', 'value' => '29', 'type' => 'float', 'group' => 'pricing'],
            ['key' => 'yearly_price', 'value' => '290', 'type' => 'float', 'group' => 'pricing'],
            ['key' => 'monthly_discount', 'value' => '0', 'type' => 'float', 'group' => 'pricing'],
            ['key' => 'yearly_discount', 'value' => '17', 'type' => 'float', 'group' => 'pricing'], // ~2 months free
            ['key' => 'trial_days', 'value' => '14', 'type' => 'integer', 'group' => 'pricing'],
            ['key' => 'currency', 'value' => 'AUD', 'type' => 'string', 'group' => 'pricing'],
        ];

        foreach ($pricingSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('Default pricing settings seeded!');
    }
}
