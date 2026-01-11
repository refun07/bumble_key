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
        Schema::create('nfc_fobs', function (Blueprint $table) {
            $table->id();
            $table->string('fob_uid')->unique();
            $table->string('fob_serial')->unique();
            $table->enum('status', ['available', 'assigned', 'damaged'])->default('available');
            $table->foreignId('assigned_hive_id')->nullable()->constrained('hives')->onDelete('set null');
            $table->string('assigned_slot')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('assigned_hive_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nfc_fobs');
    }
};
