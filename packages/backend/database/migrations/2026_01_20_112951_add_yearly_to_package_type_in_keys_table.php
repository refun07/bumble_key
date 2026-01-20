<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            ALTER TABLE `keys`
            MODIFY `package_type`
            ENUM('weekly', 'monthly', 'yearly', 'pay_per_use')
            NOT NULL
            DEFAULT 'pay_per_use'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("
            ALTER TABLE `keys`
            MODIFY `package_type`
            ENUM('weekly', 'monthly', 'pay_per_use')
            NOT NULL
            DEFAULT 'pay_per_use'
        ");
    }
};
