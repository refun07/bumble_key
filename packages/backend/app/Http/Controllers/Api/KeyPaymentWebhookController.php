<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Key;
use App\Models\Setting;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\Webhook;

class KeyPaymentWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $secret = config('services.stripe.webhook_secret');
        if (empty($secret)) {
            return response()->json(['message' => 'Stripe webhook is not configured.'], 500);
        }

        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature', '');

        try {
            $event = Webhook::constructEvent($payload, $signature, $secret);
        } catch (\Throwable $exception) {
            return response()->json(['message' => 'Invalid webhook signature.'], 400);
        }

        if ($event->type === 'payment_intent.succeeded') {
            $this->handlePaymentSucceeded($event->data->object);
        }

        if ($event->type === 'payment_intent.payment_failed') {
            $this->handlePaymentFailed($event->data->object);
        }

        return response()->json(['received' => true]);
    }

    private function handlePaymentSucceeded(PaymentIntent $intent): void
    {
        $userId = $intent->metadata->user_id ?? null;
        if (!$userId) {
            return;
        }

        $user = User::find($userId);
        if (!$user) {
            return;
        }

        $existing = Transaction::where('payment_gateway_ref', $intent->id)->first();
        if ($existing) {
            return;
        }

        $amountReceived = $intent->amount_received > 0 ? $intent->amount_received : $intent->amount;
        $amount = $amountReceived / 100;

        Transaction::create([
            'user_id' => $user->id,
            'key_assignment_id' => null,
            'amount' => $amount,
            'currency' => strtoupper($intent->currency),
            'type' => 'host_fee',
            'status' => 'completed',
            'payment_method' => $intent->payment_method_types[0] ?? null,
            'payment_gateway_ref' => $intent->id,
            'invoice_id' => $intent->latest_charge ?? null,
        ]);

        $keyId = $intent->metadata->key_id ?? null;
        $packageType = $intent->metadata->package_type ?? null;
        if (!$keyId || !$packageType) {
            return;
        }

        $key = Key::find($keyId);
        if (!$key) {
            return;
        }

        $pricing = $this->getPricing();
        $normalizedPackage = $packageType === 'pay_as_you_go' ? 'pay_per_use' : $packageType;

        $key->update([
            'package_type' => $normalizedPackage,
            'package_price' => $amount,
            'subscription_ends_at' => $this->getSubscriptionEnd($normalizedPackage, $pricing),
        ]);
    }

    private function handlePaymentFailed(PaymentIntent $intent): void
    {
        $userId = $intent->metadata->user_id ?? null;
        if (!$userId) {
            return;
        }

        $user = User::find($userId);
        if (!$user) {
            return;
        }

        $transaction = Transaction::firstOrNew([
            'payment_gateway_ref' => $intent->id,
        ]);

        $amount = ($intent->amount ?? 0) / 100;

        $transaction->fill([
            'user_id' => $user->id,
            'key_assignment_id' => null,
            'amount' => $amount,
            'currency' => strtoupper($intent->currency ?? 'USD'),
            'type' => 'host_fee',
            'status' => 'failed',
            'payment_method' => $intent->payment_method_types[0] ?? null,
            'invoice_id' => $intent->latest_charge ?? null,
        ]);

        $transaction->save();
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
