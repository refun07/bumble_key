<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('keys', function (Blueprint $table) {
            $table->enum('package_type', ['weekly', 'monthly', 'pay_per_use'])->default('pay_per_use')->after('key_type');
            $table->decimal('package_price', 10, 2)->nullable()->after('package_type');
            $table->timestamp('subscription_ends_at')->nullable()->after('package_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('keys', function (Blueprint $table) {
            $table->dropColumn(['package_type', 'package_price', 'subscription_ends_at']);
        });
    }
};
