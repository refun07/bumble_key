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
        Schema::table('hives', function (Blueprint $table) {
            // SQLite doesn't support modifying enum columns easily, 
            // but we can change it to a string with a default.
            $table->string('status')->default('idle')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hives', function (Blueprint $table) {
            $table->enum('status', ['active', 'maintenance', 'offline'])->default('active')->change();
        });
    }
};
