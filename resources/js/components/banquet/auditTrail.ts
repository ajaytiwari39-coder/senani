import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export interface BanquetAuditEntry {
    id: string;
    timestamp: string;
    action: 'created' | 'locked' | 'unlocked' | 'updated';
    actor: string;
    details: string;
    changes?: string[];
    digitalSignature?: string;
    previousSignature?: string;
}

/**
 * Generates an authentic cryptographically-styled verification token.
 * Format: SN-SIG-[Voucher]-[RandomHex]-[TimestampHex]
 */
export function generateDigitalSignature(voucherNo: string, version: number = 1): string {
    const chars = 'ABCDEF0123456789';
    let hex = '';
    for (let i = 0; i < 6; i++) {
        hex += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const tsHex = Date.now().toString(16).toUpperCase().slice(-4);
    const verSuffix = version > 1 ? `-V${version}` : '';
    return `SN-SIG-${voucherNo}-${hex}${tsHex}${verSuffix}`;
}

/**
 * Renders an ultra-slim, high-density Code 128 barcode onto an SVG element.
 */
export function renderSlimBarcode(element: SVGSVGElement | null, value: string, height: number = 24): void {
    if (!element || !value) return;
    try {
        JsBarcode(element, value, {
            format: 'CODE128',
            height,
            displayValue: false,
            margin: 0,
            lineColor: '#0f172a',
            background: 'transparent',
            width: 1.2,
        });
    } catch (e) {
        console.warn('Failed to render barcode:', e);
    }
}

/**
 * Generates a scannable Base64 PNG Data URL for a given verification URL or payload.
 */
export async function generateQrCodeDataUrl(text: string, width: number = 180): Promise<string> {
    try {
        return await QRCode.toDataURL(text, {
            width,
            margin: 1,
            color: {
                dark: '#0f172a',
                light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
        });
    } catch (e) {
        console.warn('Failed to generate QR Code:', e);
        return '';
    }
}

/**
 * Compares before and after inquiry states to identify exact changes for the audit trail.
 */
export function diffInquiryChanges(before: Record<string, any>, after: Record<string, any>): string[] {
    const diffs: string[] = [];

    // Pax
    if (before.paxGuaranteed !== undefined && after.paxGuaranteed !== undefined && before.paxGuaranteed !== after.paxGuaranteed) {
        diffs.push(`Guaranteed Pax: ${before.paxGuaranteed} ➔ ${after.paxGuaranteed} Persons`);
    }

    // Venues
    const bVenues = (before.selectedVenues || []).slice().sort().join(', ');
    const aVenues = (after.selectedVenues || []).slice().sort().join(', ');
    if (bVenues !== aVenues) {
        diffs.push(`Venues modified: [${bVenues || 'None'}] ➔ [${aVenues || 'None'}]`);
    }

    // Catering Menu Tier
    if (before.menuRateTier && after.menuRateTier && before.menuRateTier !== after.menuRateTier) {
        diffs.push(`Catering Menu Tier: ₹${before.menuRateTier}/plate ➔ ₹${after.menuRateTier}/plate`);
    }

    // Selected Dishes
    const bItems: string[] = before.selectedMenuCatalogItems || [];
    const aItems: string[] = after.selectedMenuCatalogItems || [];
    const added = aItems.filter(i => !bItems.includes(i));
    const removed = bItems.filter(i => !aItems.includes(i));
    if (added.length > 0 || removed.length > 0) {
        const parts: string[] = [];
        if (added.length > 0) parts.push(`+Added: ${added.join(', ')}`);
        if (removed.length > 0) parts.push(`-Removed: ${removed.join(', ')}`);
        diffs.push(`Catering Dishes (${aItems.length} picked): ${parts.join('; ')}`);
    }

    // Extra Servings
    if (before.engagementBreakfastPax !== after.engagementBreakfastPax) {
        diffs.push(`Engagement Breakfast: ${before.engagementBreakfastPax || 0} ➔ ${after.engagementBreakfastPax || 0} Pax`);
    }
    if (before.regularBreakfastPax !== after.regularBreakfastPax) {
        diffs.push(`Regular Breakfast: ${before.regularBreakfastPax || 0} ➔ ${after.regularBreakfastPax || 0} Pax`);
    }
    if (before.bainaBoxes !== after.bainaBoxes) {
        diffs.push(`Baina Boxes: ${before.bainaBoxes || 0} ➔ ${after.bainaBoxes || 0} Boxes`);
    }
    if (before.mandapServingsPax !== after.mandapServingsPax) {
        diffs.push(`Mandap Servings: ${before.mandapServingsPax || 0} ➔ ${after.mandapServingsPax || 0} Pax`);
    }

    // Rooms
    if (before.roomsNeeded !== after.roomsNeeded) {
        diffs.push(`Executive Rooms: ${before.roomsNeeded || 0} ➔ ${after.roomsNeeded || 0} Rooms`);
    }

    // Decor & AV
    if (before.decorPackageType !== after.decorPackageType) {
        diffs.push(`Decor Package: ${before.decorPackageType || 'none'} ➔ ${after.decorPackageType || 'none'}`);
    }
    if (before.soundMicSetup !== after.soundMicSetup) {
        diffs.push(`Sound & Mic: ${after.soundMicSetup ? 'Enabled (+₹7,000)' : 'Disabled'}`);
    }
    if (before.projectorSetup !== after.projectorSetup) {
        diffs.push(`Projector & Screen: ${after.projectorSetup ? 'Enabled (+₹5,000)' : 'Disabled'}`);
    }
    if (before.ledWallSetup !== after.ledWallSetup) {
        diffs.push(`LED Video Wall: ${after.ledWallSetup ? 'Enabled (+₹12,000)' : 'Disabled'}`);
    }

    // Discount
    if (before.discountRupees !== after.discountRupees) {
        diffs.push(`Concession/Discount: ₹${(before.discountRupees || 0).toLocaleString('en-IN')} ➔ ₹${(after.discountRupees || 0).toLocaleString('en-IN')}`);
    }

    return diffs;
}
