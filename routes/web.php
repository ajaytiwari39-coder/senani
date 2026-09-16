<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\BanquetInquiryController;

Route::inertia('/', 'Welcome')->name('home');
Route::inertia('/guest/menu-selection', 'GuestMenuSelection')->name('guest.menu-selection');
Route::inertia('/verify/voucher', 'VerifyVoucher')->name('verify.voucher');
Route::inertia('/preview-dash', 'Dashboard')->name('preview.dash');

Route::prefix('api/banquet-inquiries')->group(function () {
    Route::get('/', [BanquetInquiryController::class, 'index'])->name('banquet-inquiries.index');
    Route::post('/', [BanquetInquiryController::class, 'store'])->name('banquet-inquiries.store');
    Route::post('/batch-sync', [BanquetInquiryController::class, 'batchSync'])->name('banquet-inquiries.batch-sync');
    Route::get('/{voucherNo}', [BanquetInquiryController::class, 'show'])->name('banquet-inquiries.show');
    Route::delete('/{voucherNo}', [BanquetInquiryController::class, 'destroy'])->name('banquet-inquiries.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'Dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
