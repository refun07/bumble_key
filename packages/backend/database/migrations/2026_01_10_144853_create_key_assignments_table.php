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
        Schema::create('key_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('key_id')->constrained('keys')->onDelete('cascade');
            $table->foreignId('cell_id')->nullable()->constrained('cells')->onDelete('set null');
            $table->foreignId('nfc_fob_id')->nullable()->constrained('nfc_fobs')->onDelete('set null');
            $table->foreignId('host_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('partner_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('guest_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('drop_off_code')->unique();
            $table->string('pickup_code')->unique();
            $table->enum('state', [
                'pending_drop',
                'dropped',
                'available',
                'picked_up',
                'in_use',
                'returned_pending',
                'returned_confirmed',
                'closed',
                'dispute'
            ])->default('pending_drop');
            $table->timestamp('scheduled_drop_at')->nullable();
            $table->timestamp('dropped_at')->nullable();
            $table->timestamp('available_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('expected_return_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index(['key_id', 'state']);
            $table->index(['host_id', 'state']);
            $table->index(['partner_id', 'state']);
            $table->index('guest_id');
            $table->index('drop_off_code');
            $table->index('pickup_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('key_assignments');
    }
};
