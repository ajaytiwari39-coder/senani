<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'Welcome')->name('home');
Route::inertia('/guest/menu-selection', 'GuestMenuSelection')->name('guest.menu-selection');
Route::inertia('/verify/voucher', 'VerifyVoucher')->name('verify.voucher');
Route::inertia('/preview-dash', 'Dashboard')->name('preview.dash');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'Dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
