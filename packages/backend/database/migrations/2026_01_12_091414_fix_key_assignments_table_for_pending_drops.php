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
        Schema::table('key_assignments', function (Blueprint $table) {
            $table->foreignId('hive_id')->nullable()->after('cell_id')->constrained('hives')->onDelete('set null');
            $table->foreignId('partner_id')->nullable()->change();
            $table->string('pickup_code')->nullable()->change();
            $table->string('drop_off_code')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('key_assignments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('hive_id');
            $table->foreignId('partner_id')->nullable(false)->change();
            $table->string('pickup_code')->nullable(false)->change();
            $table->string('drop_off_code')->nullable(false)->change();
        });
    }
};
