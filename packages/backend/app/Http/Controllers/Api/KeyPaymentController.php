<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Key;
use App\Models\Setting;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class KeyPaymentController extends Controller
{
    public function createIntent(Request $request, $keyId)
    {
        $validated = $request->validate([
            'package_type' => 'required|in:pay_as_you_go,monthly,yearly',
        ]);

        $key = $request->user()->keys()->findOrFail($keyId);

        $secret = config('services.stripe.secret');
        if (empty($secret)) {
            return response()->json(['message' => 'Stripe is not configured.'], 500);
        }

        $pricing = $this->getPricing();
        $amount = $this->getPackageAmount($validated['package_type'], $pricing);

        if ($amount <= 0) {
            return response()->json(['message' => 'Invalid package amount.'], 422);
        }

        Stripe::setApiKey($secret);

        $intent = PaymentIntent::create([
            'amount' => (int) round($amount * 100),
            'currency' => strtolower($pricing['currency']),
            'automatic_payment_methods' => ['enabled' => true],
            'metadata' => [
                'user_id' => (string) $request->user()->id,
                'key_id' => (string) $key->id,
                'package_type' => $validated['package_type'],
            ],
            'description' => "BumbleKey {$validated['package_type']} package",
        ]);

        return response()->json([
            'client_secret' => $intent->client_secret,
            'amount' => $amount,
            'currency' => strtoupper($pricing['currency']),
            'package_type' => $validated['package_type'],
        ]);
    }

    public function confirmPayment(Request $request, $keyId)
    {
        $validated = $request->validate([
            'payment_intent_id' => 'required|string',
            'package_type' => 'required|in:pay_as_you_go,monthly,yearly',
        ]);

        $key = $request->user()->keys()->findOrFail($keyId);

        $secret = config('services.stripe.secret');
        if (empty($secret)) {
            return response()->json(['message' => 'Stripe is not configured.'], 500);
        }

        Stripe::setApiKey($secret);

        $intent = PaymentIntent::retrieve($validated['payment_intent_id']);
        if ($intent->status !== 'succeeded') {
            return response()->json(['message' => 'Payment not completed yet.'], 422);
        }
        if (!empty($intent->metadata->user_id) && (string) $intent->metadata->user_id !== (string) $request->user()->id) {
            return response()->json(['message' => 'Payment does not belong to this user.'], 403);
        }
        if (!empty($intent->metadata->key_id) && (string) $intent->metadata->key_id !== (string) $key->id) {
            return response()->json(['message' => 'Payment does not match this key.'], 403);
        }

        $existing = Transaction::where('payment_gateway_ref', $intent->id)->first();
        if ($existing) {
            return response()->json([
                'message' => 'Payment already recorded.',
                'data' => $existing,
            ]);
        }

        $amountReceived = $intent->amount_received > 0 ? $intent->amount_received : $intent->amount;
        $amount = $amountReceived / 100;

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'key_assignment_id' => null,
            'amount' => $amount,
            'currency' => strtoupper($intent->currency),
            'type' => 'host_fee',
            'status' => 'completed',
            'payment_method' => $intent->payment_method_types[0] ?? null,
            'payment_gateway_ref' => $intent->id,
            'invoice_id' => $intent->latest_charge ?? null,
        ]);

        $pricing = $this->getPricing();
        $packageType = $validated['package_type'] === 'pay_as_you_go'
            ? 'pay_per_use'
            : $validated['package_type'];

        $key->update([
            'package_type' => $packageType,
            'package_price' => $amount,
            'subscription_ends_at' => $this->getSubscriptionEnd($packageType, $pricing),
        ]);

        return response()->json([
            'message' => 'Payment confirmed.',
            'data' => $transaction,
        ]);
    }

    private function getPricing(): array
    {
        $pricing = Setting::getByGroup('pricing');
        $pricing['currency'] = $pricing['currency'] ?? 'USD';

        if (!isset($pricing['monthly_discounted_price'])) {
            $pricing['monthly_discounted_price'] = $pricing['monthly_price'] ?? 0;
        }
        if (!isset($pricing['yearly_discounted_price'])) {
            $pricing['yearly_discounted_price'] = $pricing['yearly_price'] ?? 0;
        }

        if (!empty($pricing['monthly_discount'])) {
            $pricing['monthly_discounted_price'] = ($pricing['monthly_price'] ?? 0) * (1 - $pricing['monthly_discount'] / 100);
        }
        if (!empty($pricing['yearly_discount'])) {
            $pricing['yearly_discounted_price'] = ($pricing['yearly_price'] ?? 0) * (1 - $pricing['yearly_discount'] / 100);
        }

        return $pricing;
    }

    private function getPackageAmount(string $packageType, array $pricing): float
    {
        if ($packageType === 'pay_as_you_go') {
            return (float) ($pricing['pay_as_you_go_price'] ?? 0);
        }
        if ($packageType === 'monthly') {
            return (float) ($pricing['monthly_discounted_price'] ?? $pricing['monthly_price'] ?? 0);
        }
        return (float) ($pricing['yearly_discounted_price'] ?? $pricing['yearly_price'] ?? 0);
    }

    private function getSubscriptionEnd(string $packageType, array $pricing): ?Carbon
    {
        if ($packageType === 'monthly') {
            return Carbon::now()->addMonth();
        }
        if ($packageType === 'yearly') {
            return Carbon::now()->addYear();
        }

        return null;
    }
}
