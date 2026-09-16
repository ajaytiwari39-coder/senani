<?php

namespace App\Console\Commands;

use App\Models\BanquetInquiry;
use Illuminate\Console\Command;

class ResetBanquetVoucherNumbers extends Command
{
    protected $signature = 'banquet:reset-vouchers';
    protected $description = 'Safely re-sequence all banquet inquiry voucher numbers starting from 1';

    public function handle(): int
    {
        $this->info('Starting banquet inquiries voucher sequence reset to 1...');

        $inquiries = BanquetInquiry::where('guest_name', 'not like', '%Rajesh Sharma%')
            ->orderBy('id', 'asc')
            ->get();

        if ($inquiries->isEmpty()) {
            $this->info('No inquiries found to re-sequence.');
            return Command::SUCCESS;
        }

        // Temporary unique prefix to avoid collision during renumbering
        $tempPrefix = 'TEMP_' . time() . '_';
        foreach ($inquiries as $idx => $inquiry) {
            $inquiry->voucher_no = $tempPrefix . ($idx + 1);
            $inquiry->saveQuietly();
        }

        // Final assignment starting from 1
        $seq = 1;
        foreach ($inquiries as $inquiry) {
            $data = is_array($inquiry->data) ? $inquiry->data : (json_decode($inquiry->data ?? '[]', true) ?: []);
            $data['voucherNo'] = (string) $seq;
            $data['voucher_no'] = (string) $seq;

            $inquiry->voucher_no = (string) $seq;
            $inquiry->data = $data;
            $inquiry->saveQuietly();

            $this->line("Inquiry ID {$inquiry->id} ({$inquiry->guest_name}) -> Voucher #{$seq}");
            $seq++;
        }

        $this->info('Successfully re-sequenced ' . count($inquiries) . ' inquiries starting from 1.');
        return Command::SUCCESS;
    }
}
