/**
 * KYC service — document verification and face-match, behind provider
 * adapters so a third-party KYC vendor (HyperVerge, Onfido, IDfy, DigiLocker)
 * can be plugged in without touching UI code.
 *
 * The document payload sent to the real backend must travel over HTTPS and
 * be encrypted at rest. This mock immediately discards the full Aadhaar and
 * returns only the last 4 digits + a provider reference — mirroring what a
 * compliant backend should respond with.
 */
import { delay, randomId } from './mockApi.js';
import { isValidPAN, isValidAadhaar } from '../utils/validators.js';

export const MAX_DOC_SIZE_MB = 5;
export const ACCEPTED_DOC_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

export function validateDocumentFile(file, label = 'Document') {
  if (!file) throw new Error(`${label} is required`);
  if (!ACCEPTED_DOC_TYPES.includes(file.type)) {
    throw new Error(`${label}: only JPG, PNG or PDF files are accepted`);
  }
  if (file.size > MAX_DOC_SIZE_MB * 1024 * 1024) {
    throw new Error(`${label}: file must be under ${MAX_DOC_SIZE_MB}MB`);
  }
  return true;
}

/**
 * Verify PAN + Aadhaar documents.
 * Returns masked identity data ONLY — the full Aadhaar never re-enters
 * application state or storage after this call.
 */
export async function verifyDocuments({ pan, aadhaar, panFile, aadhaarFile }) {
  await delay(900);
  if (!isValidPAN(pan)) throw new Error('Invalid PAN format. Expected ABCDE1234F');
  if (!aadhaarFile) throw new Error('Aadhaar document upload is required');
  if (!panFile) throw new Error('PAN document upload is required');
  validateDocumentFile(aadhaarFile, 'Aadhaar');
  validateDocumentFile(panFile, 'PAN');

  const cleanAadhaar = String(aadhaar || '').replace(/\s/g, '');
  if (!isValidAadhaar(cleanAadhaar)) throw new Error('Invalid Aadhaar number (failed checksum)');

  return {
    panMasked: pan, // PAN is returned for review; masked for display by the UI
    aadhaarLast4: cleanAadhaar.slice(-4),
    panDocRef: randomId('doc'),
    aadhaarDocRef: randomId('doc'),
    provider: 'mock-kyc',
  };
}

/**
 * Face verification provider adapter.
 *
 * Replace `verify` with a real vendor SDK call (e.g. HyperVerge faceMatch
 * between the selfie and the Aadhaar photo, plus an active-liveness check).
 * The contract: input is a JPEG data URL captured in the browser; output
 * resolves with { matched, livenessScore } or rejects with an Error.
 */
export const faceVerificationProvider = {
  name: 'mock-face',
  async verify(imageDataUrl) {
    await delay(1400);
    if (!imageDataUrl || !imageDataUrl.startsWith('data:image/jpeg')) {
      throw new Error('Invalid capture. Please retake the photo.');
    }
    return { matched: true, livenessScore: 0.97, provider: this.name };
  },
};

export async function verifyFace(imageDataUrl) {
  return faceVerificationProvider.verify(imageDataUrl);
}
