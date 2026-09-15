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
    qm?: boolean;          // isQuotationMode
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
            qm: inquiry.isQuotationMode,
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

const VENUE_RATES: Record<string, number> = {
    swarnmahal: 35000,
    swarnim: 40000,
    swadhistam: 30000,
    lawn: 40000,
    pisces: 40000,
    mandap: 5000,
};

const DECOR_RATES: Record<string, number> = {
    none: 0,
    standard: 30000,
    wedding: 48000,
    grand: 60000,
};

const FOODING_RATES = {
    engagementBreakfast: 200,
    regularBreakfast: 300,
    bainaBox: 260,
    mandapServing: 60,
    roomPerNight: 2500,
};

export function getInquiryFinancials(inq: Partial<BanquetInquiry>) {
    let rate = Number(inq.effectiveMenuRate || inq.menuRate || inq.menuRateTier || 799);
    if (inq.isMeetingSetup) {
        if (inq.menuRateTier === 499) rate = 799;
        else if (inq.menuRateTier === 799) rate = 999;
        else if (inq.menuRateTier === 999) rate = 1199;
        else rate = 1199;
    }

    const pax = Number(inq.paxGuaranteed) || 0;
    const foodTotal = pax * rate;

    const engBf = (Number(inq.engagementBreakfastPax) || 0) * FOODING_RATES.engagementBreakfast;
    const regBf = (Number(inq.regularBreakfastPax) || 0) * FOODING_RATES.regularBreakfast;
    const baina = (Number(inq.bainaBoxes) || 0) * FOODING_RATES.bainaBox;
    const mandapServ = (Number(inq.mandapServingsPax) || 0) * FOODING_RATES.mandapServing;
    const extraFoodTotal = engBf + regBf + baina + mandapServ;

    let venueTotal = 0;
    if (inq.isEngagementPackage) {
        if (inq.engagementPackageType === 'swarnim') venueTotal = 45000;
        else if (inq.engagementPackageType === 'swarnmahal') venueTotal = 40000;
    } else {
        const venues = inq.selectedVenues || [];
        venueTotal = venues.reduce((sum, vId) => {
            return sum + (VENUE_RATES[vId] || 35000);
        }, 0);
    }

    const roomsTotal = (Number(inq.roomsNeeded) || 0) * (Number(inq.roomRate) || FOODING_RATES.roomPerNight);

    let decorAvTotal = 0;
    if (!inq.isEngagementPackage) {
        decorAvTotal += DECOR_RATES[inq.decorPackageType || 'standard'] || 0;
    }
    if (inq.soundMicSetup) decorAvTotal += 7000;
    if (inq.projectorSetup) decorAvTotal += 5000;
    if (inq.ledWallSetup) decorAvTotal += 12000;

    let meetingSurcharge = 0;
    if (inq.isMeetingSetup) {
        const venues = inq.selectedVenues || [];
        const isMandapOnly = venues.length === 1 && venues.includes('mandap');
        const minPax = isMandapOnly ? 15 : ((venues.filter(v => v !== 'mandap').length >= 2) ? 180 : 80);
        if (pax < minPax) {
            meetingSurcharge = isMandapOnly ? 5000 : 20000;
        }
    }

    const otherTotal = (Number(inq.additionalHallCharges) || 0) + (Number(inq.additionalDecorCharges) || 0) + meetingSurcharge;

    const gross = foodTotal + extraFoodTotal + venueTotal + roomsTotal + decorAvTotal + otherTotal;

    let discount = 0;
    if (inq.discountRupees && inq.discountRupees > 0) {
        discount = Math.min(gross, inq.discountRupees);
    } else if (inq.discountPercent && inq.discountPercent > 0) {
        discount = Math.round((gross * inq.discountPercent) / 100);
    }

    const net = Math.max(0, gross - discount);
    const advance = Number(inq.amountPaid) || 0;
    const balance = Math.max(0, net - advance);

    return {
        rate,
        foodTotal,
        extraFoodTotal,
        venueTotal,
        roomsTotal,
        decorAvTotal,
        meetingSurcharge,
        gross,
        discount,
        net,
        advance,
        balance,
    };
}
