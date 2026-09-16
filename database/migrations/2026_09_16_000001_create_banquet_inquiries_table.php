<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('banquet_inquiries')) {
            Schema::create('banquet_inquiries', function (Blueprint $table) {
                $table->id();
                $table->string('voucher_no')->unique()->index();
                $table->string('inquiry_date')->nullable();
                $table->string('guest_name')->nullable()->index();
                $table->string('phone_primary')->nullable()->index();
                $table->string('phone_secondary')->nullable();
                $table->string('event_type')->nullable();
                $table->string('status')->default('draft_reception')->index();
                $table->integer('pax_guaranteed')->default(0);
                $table->string('function_date_from')->nullable();
                $table->string('function_date_to')->nullable();
                $table->decimal('total_amount', 12, 2)->default(0);
                $table->decimal('discount_rupees', 12, 2)->default(0);
                $table->decimal('advance_paid', 12, 2)->default(0);
                $table->decimal('balance_due', 12, 2)->default(0);
                $table->boolean('is_locked')->default(false)->index();
                $table->longText('data')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banquet_inquiries');
    }
};
