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
        Schema::create('keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('host_id')->constrained('users')->onDelete('cascade');
            $table->string('label');
            $table->text('description')->nullable();
            $table->string('serial_number')->unique()->nullable();
            $table->enum('key_type', ['master', 'duplicate', 'spare'])->default('master');
            $table->text('notes')->nullable();
            $table->enum('status', [
                'created',
                'assigned',
                'deposited',
                'available',
                'picked_up',
                'returned',
                'closed',
                'dispute'
            ])->default('created');
            $table->timestamps();

            $table->index(['host_id', 'status']);
            $table->index('property_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('keys');
    }
};
