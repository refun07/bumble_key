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
        Schema::create('cells', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hive_id')->constrained('hives')->onDelete('cascade');
            $table->string('cell_number');
            $table->string('hardware_id')->unique()->nullable();
            $table->enum('status', ['available', 'occupied', 'maintenance', 'offline'])->default('available');
            $table->timestamp('last_heartbeat')->nullable();
            $table->timestamps();

            $table->unique(['hive_id', 'cell_number']);
            $table->index(['hive_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cells');
    }
};
