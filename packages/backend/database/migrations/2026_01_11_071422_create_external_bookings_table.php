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
        Schema::create('external_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('external_listing_id')->constrained()->onDelete('cascade');
            $table->string('external_id');
            $table->foreignId('key_assignment_id')->nullable()->constrained()->onDelete('set null');
            $table->string('guest_name');
            $table->dateTime('check_in');
            $table->dateTime('check_out');
            $table->string('status')->default('confirmed');
            $table->json('raw_data')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('external_bookings');
    }
};
