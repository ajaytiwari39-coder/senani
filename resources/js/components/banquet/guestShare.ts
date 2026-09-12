import type { BanquetInquiry } from './InquiryWizardModal.vue';

export interface CompactGuestPayload {
    v: string;             // voucherNo
    g?: string;            // guestName
    p?: string;            // phonePrimary
    d?: string;            // functionDateFrom
    t1?: string;           // timeFrom
    t2?: string;           // timeTo
    e?: string;            // eventType
    pax?: number;          // paxGuaranteed
    tier?: number;         // menuRateTier
    rate?: number;         // effectiveMenuRate
    title?: string;        // menuTitle
    items?: string[];      // selectedMenuCatalogItems
    eb?: number;           // engagementBreakfastPax
    rb?: number;           // regularBreakfastPax
    bb?: number;           // bainaBoxes
    mb?: number;           // mandapServingsPax
    notes?: string;        // specialArrangements
    sig?: string;          // digitalSignature
}

/**
 * Encodes key inquiry particulars into a URL-safe base64 string
 */
export function encodeGuestPayload(inquiry: BanquetInquiry): string {
    try {
        const payload: CompactGuestPayload = {
            v: inquiry.voucherNo || '250',
            g: inquiry.guestName,
            p: inquiry.phonePrimary,
            d: inquiry.functionDateFrom,
            t1: inquiry.timeFrom,
            t2: inquiry.timeTo,
            e: inquiry.eventType,
            pax: inquiry.paxGuaranteed,
            tier: inquiry.menuRateTier,
            rate: inquiry.effectiveMenuRate,
            title: inquiry.menuTitle,
            items: inquiry.selectedMenuCatalogItems || [],
            eb: inquiry.engagementBreakfastPax,
            rb: inquiry.regularBreakfastPax,
            bb: inquiry.bainaBoxes,
            mb: inquiry.mandapServingsPax,
            notes: inquiry.specialArrangements,
            sig: inquiry.digitalSignature,
        };
        const jsonStr = JSON.stringify(payload);
        if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
            return encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
        } else {
            return encodeURIComponent(Buffer.from(encodeURIComponent(jsonStr)).toString('base64'));
        }
    } catch (e) {
        console.warn('Failed to encode guest payload', e);
        return '';
    }
}

/**
 * Decodes URL-safe base64 string back to inquiry particulars
 */
export function decodeGuestPayload(encoded: string): CompactGuestPayload | null {
    try {
        if (!encoded) return null;
        const decodedParam = decodeURIComponent(encoded);
        let jsonStr = '';
        if (typeof window !== 'undefined' && typeof window.atob === 'function') {
            jsonStr = decodeURIComponent(escape(atob(decodedParam)));
        } else {
            jsonStr = decodeURIComponent(Buffer.from(decodedParam, 'base64').toString('utf-8'));
        }
        return JSON.parse(jsonStr) as CompactGuestPayload;
    } catch (e) {
        console.warn('Failed to decode guest payload', e);
        return null;
    }
}

/**
 * Builds the full guest portal URL with embedded payload for cross-device support
 */
export function buildGuestPortalUrl(origin: string, inquiry: BanquetInquiry): string {
    const voucher = inquiry.voucherNo || '250';
    const payload = encodeGuestPayload(inquiry);
    if (payload) {
        return `${origin}/guest/menu-selection?v=${voucher}&d=${payload}`;
    }
    return `${origin}/guest/menu-selection?v=${voucher}`;
}
