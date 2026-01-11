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
        Schema::create('hives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('location_name');
            $table->string('address');
            $table->string('city');
            $table->string('state')->nullable();
            $table->string('country');
            $table->string('postal_code', 20)->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->integer('total_cells')->default(0);
            $table->integer('available_cells')->default(0);
            $table->json('operating_hours')->nullable();
            $table->enum('status', ['active', 'maintenance', 'offline'])->default('active');
            $table->json('photos')->nullable();
            $table->timestamps();

            $table->index(['partner_id', 'status']);
            $table->index(['latitude', 'longitude']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hives');
    }
};
