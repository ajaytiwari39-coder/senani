<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BanquetInquiry extends Model
{
    use HasFactory;

    protected $table = 'banquet_inquiries';

    protected $fillable = [
        'voucher_no',
        'inquiry_date',
        'guest_name',
        'phone_primary',
        'phone_secondary',
        'event_type',
        'status',
        'pax_guaranteed',
        'function_date_from',
        'function_date_to',
        'total_amount',
        'discount_rupees',
        'advance_paid',
        'balance_due',
        'is_locked',
        'data',
    ];

    protected $casts = [
        'is_locked' => 'boolean',
        'data' => 'array',
        'total_amount' => 'float',
        'discount_rupees' => 'float',
        'advance_paid' => 'float',
        'balance_due' => 'float',
        'pax_guaranteed' => 'integer',
    ];

    /**
     * Format into frontend BanquetInquiry object structure
     */
    public function toFrontendArray(): array
    {
        $payload = is_array($this->data) ? $this->data : (json_decode($this->data, true) ?: []);

        $payload['id'] = (string) $this->id;
        $payload['voucherNo'] = (string) $this->voucher_no;
        if (!empty($this->inquiry_date)) $payload['inquiryDate'] = $this->inquiry_date;
        if (!empty($this->guest_name)) $payload['guestName'] = $this->guest_name;
        if (!empty($this->phone_primary)) $payload['phonePrimary'] = $this->phone_primary;
        if (!empty($this->phone_secondary)) $payload['phoneSecondary'] = $this->phone_secondary;
        if (!empty($this->event_type)) $payload['eventType'] = $this->event_type;
        if (!empty($this->status)) $payload['status'] = $this->status;
        if (isset($this->pax_guaranteed)) $payload['paxGuaranteed'] = (int) $this->pax_guaranteed;
        if (!empty($this->function_date_from)) $payload['functionDateFrom'] = $this->function_date_from;
        if (!empty($this->function_date_to)) $payload['functionDateTo'] = $this->function_date_to;
        $payload['isLocked'] = (bool) $this->is_locked;

        return $payload;
    }
}
