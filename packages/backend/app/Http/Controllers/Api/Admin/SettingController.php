<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Get all settings or by group
     */
    public function index(Request $request)
    {
        if ($request->group) {
            return response()->json(Setting::getByGroup($request->group));
        }

        $settings = Setting::all()->groupBy('group')->map(function ($group) {
            $result = [];
            foreach ($group as $setting) {
                $result[$setting->key] = [
                    'value' => Setting::getValue($setting->key),
                    'type' => $setting->type
                ];
            }
            return $result;
        });

        return response()->json($settings);
    }

    /**
     * Get pricing settings (public)
     */
    public function pricing()
    {
        $pricing = Setting::getByGroup('pricing');

        // Add calculated discounted prices
        $pricing['monthly_discounted_price'] = $pricing['monthly_price'] ?? 29;
        $pricing['yearly_discounted_price'] = $pricing['yearly_price'] ?? 290;

        if (isset($pricing['monthly_discount']) && $pricing['monthly_discount'] > 0) {
            $pricing['monthly_discounted_price'] = $pricing['monthly_price'] * (1 - $pricing['monthly_discount'] / 100);
        }

        if (isset($pricing['yearly_discount']) && $pricing['yearly_discount'] > 0) {
            $pricing['yearly_discounted_price'] = $pricing['yearly_price'] * (1 - $pricing['yearly_discount'] / 100);
        }

        return response()->json($pricing);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $settings = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
            'settings.*.type' => 'string',
            'settings.*.group' => 'string',
        ]);

        foreach ($request->settings as $setting) {
            Setting::setValue(
                $setting['key'],
                $setting['value'],
                $setting['type'] ?? 'string',
                $setting['group'] ?? 'general'
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    /**
     * Update pricing settings specifically
     */
    public function updatePricing(Request $request)
    {
        $validated = $request->validate([
            'pay_as_you_go_price' => 'required|numeric|min:0',
            'monthly_price' => 'required|numeric|min:0',
            'yearly_price' => 'required|numeric|min:0',
            'monthly_discount' => 'nullable|numeric|min:0|max:100',
            'yearly_discount' => 'nullable|numeric|min:0|max:100',
            'trial_days' => 'nullable|integer|min:0',
            'currency' => 'nullable|string|max:3',
        ]);

        foreach ($validated as $key => $value) {
            $type = in_array($key, ['pay_as_you_go_price', 'monthly_price', 'yearly_price', 'monthly_discount', 'yearly_discount'])
                ? 'float'
                : (in_array($key, ['trial_days']) ? 'integer' : 'string');

            Setting::setValue($key, $value, $type, 'pricing');
        }

        return response()->json(['message' => 'Pricing updated successfully']);
    }
}
