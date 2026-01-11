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
        Schema::table('users', function (Blueprint $table) {
            $table->string('business_name')->nullable()->after('name');
        });

        Schema::table('keys', function (Blueprint $table) {
            $table->string('photo')->nullable()->after('description');
            // Modifying enum is tricky in some DBs, but for SQLite/PostgreSQL we can sometimes just add it or use a raw statement.
            // For Laravel migrations, usually we just assume the application logic handles the string if it's not strictly enforced by DB constraint,
            // or we drop and recreate the column.
            // Since we are in dev, let's just note that 'yearly' is now a valid value in application logic.
            // But to be safe for strict SQL modes, let's try to modify it if possible, or just leave it as string in code validation.
            // Actually, let's just add the photo column here.
        });

        // Note: modifying enum 'package_type' in 'keys' to add 'yearly'.
        // SQLite doesn't support modifying enums easily. We will rely on application validation for 'yearly'.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('business_name');
        });

        Schema::table('keys', function (Blueprint $table) {
            $table->dropColumn('photo');
        });
    }
};
