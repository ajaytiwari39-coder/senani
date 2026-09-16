<?php

namespace App\Http\Controllers;

use App\Models\BanquetInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BanquetInquiryController extends Controller
{
    /**
     * Get all inquiries
     */
    public function index(): JsonResponse
    {
        $inquiries = BanquetInquiry::where('guest_name', 'not like', '%Rajesh Sharma%')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return $item->toFrontendArray();
            });

        return response()->json([
            'success' => true,
            'data' => $inquiries,
        ]);
    }

    /**
     * Store or update an inquiry
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->all();
        $voucherNo = (string) ($data['voucherNo'] ?? $data['voucher_no'] ?? '');

        if (empty($voucherNo)) {
            $lastNumeric = BanquetInquiry::whereRaw("voucher_no REGEXP '^[0-9]+$'")
                ->where('guest_name', 'not like', '%Rajesh Sharma%')
                ->selectRaw('MAX(CAST(voucher_no AS UNSIGNED)) as max_v')
                ->value('max_v');
            $voucherNo = $lastNumeric ? (string) ($lastNumeric + 1) : '101';
            $data['voucherNo'] = $voucherNo;
        }

        $inquiry = BanquetInquiry::updateOrCreate(
            ['voucher_no' => $voucherNo],
            [
                'inquiry_date' => $data['inquiryDate'] ?? $data['inquiry_date'] ?? null,
                'guest_name' => $data['guestName'] ?? $data['guest_name'] ?? null,
                'phone_primary' => $data['phonePrimary'] ?? $data['phone_primary'] ?? null,
                'phone_secondary' => $data['phoneSecondary'] ?? $data['phone_secondary'] ?? null,
                'event_type' => $data['eventType'] ?? $data['event_type'] ?? null,
                'status' => $data['status'] ?? 'draft_reception',
                'pax_guaranteed' => (int) ($data['paxGuaranteed'] ?? $data['pax_guaranteed'] ?? 0),
                'function_date_from' => $data['functionDateFrom'] ?? $data['function_date_from'] ?? null,
                'function_date_to' => $data['functionDateTo'] ?? $data['function_date_to'] ?? null,
                'total_amount' => (float) ($data['totalAmount'] ?? $data['total_amount'] ?? 0),
                'discount_rupees' => (float) ($data['discountRupees'] ?? $data['discount_rupees'] ?? 0),
                'advance_paid' => (float) ($data['advancePaid'] ?? $data['amountPaid'] ?? 0),
                'balance_due' => (float) ($data['balanceDue'] ?? 0),
                'is_locked' => (bool) ($data['isLocked'] ?? $data['is_locked'] ?? false),
                'data' => $data,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Inquiry saved successfully',
            'data' => $inquiry->toFrontendArray(),
        ]);
    }

    /**
     * Batch sync inquiries from client devices
     */
    public function batchSync(Request $request): JsonResponse
    {
        $items = $request->input('inquiries', []);
        $synced = [];

        if (is_array($items)) {
            foreach ($items as $data) {
                $voucherNo = (string) ($data['voucherNo'] ?? $data['voucher_no'] ?? '');
                if (empty($voucherNo)) continue;

                $inquiry = BanquetInquiry::updateOrCreate(
                    ['voucher_no' => $voucherNo],
                    [
                        'inquiry_date' => $data['inquiryDate'] ?? $data['inquiry_date'] ?? null,
                        'guest_name' => $data['guestName'] ?? $data['guest_name'] ?? null,
                        'phone_primary' => $data['phonePrimary'] ?? $data['phone_primary'] ?? null,
                        'phone_secondary' => $data['phoneSecondary'] ?? $data['phone_secondary'] ?? null,
                        'event_type' => $data['eventType'] ?? $data['event_type'] ?? null,
                        'status' => $data['status'] ?? 'draft_reception',
                        'pax_guaranteed' => (int) ($data['paxGuaranteed'] ?? $data['pax_guaranteed'] ?? 0),
                        'function_date_from' => $data['functionDateFrom'] ?? $data['function_date_from'] ?? null,
                        'function_date_to' => $data['functionDateTo'] ?? $data['function_date_to'] ?? null,
                        'total_amount' => (float) ($data['totalAmount'] ?? $data['total_amount'] ?? 0),
                        'discount_rupees' => (float) ($data['discountRupees'] ?? $data['discount_rupees'] ?? 0),
                        'advance_paid' => (float) ($data['advancePaid'] ?? $data['amountPaid'] ?? 0),
                        'balance_due' => (float) ($data['balanceDue'] ?? 0),
                        'is_locked' => (bool) ($data['isLocked'] ?? $data['is_locked'] ?? false),
                        'data' => $data,
                    ]
                );
                $synced[] = $inquiry->toFrontendArray();
            }
        }

        $allInquiries = BanquetInquiry::orderBy('created_at', 'desc')->get()->map(function ($item) {
            return $item->toFrontendArray();
        });

        return response()->json([
            'success' => true,
            'count' => count($synced),
            'data' => $allInquiries,
        ]);
    }

    /**
     * Get a single inquiry by voucherNo
     */
    public function show(string $voucherNo): JsonResponse
    {
        $inquiry = BanquetInquiry::where('voucher_no', $voucherNo)->first();

        if (!$inquiry) {
            return response()->json([
                'success' => false,
                'message' => 'Inquiry not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $inquiry->toFrontendArray(),
        ]);
    }

    /**
     * Delete an inquiry (superadmin only)
     */
     public function destroy(string $voucherNo): JsonResponse
     {
         $deleted = BanquetInquiry::where('voucher_no', $voucherNo)->delete();

         return response()->json([
             'success' => true,
             'count' => $deleted,
             'message' => 'Inquiry deleted successfully',
         ]);
     }
}
