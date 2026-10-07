import { useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import * as kycService from '../../services/kycService.js';
import { isValidPAN, maskAadhaar, DEMO_AADHAAR } from '../../utils/validators.js';
import { Input } from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import FileUploadCard from './FileUploadCard.jsx';
import { IconShieldCheck, IconLock, IconInfo } from '../ui/Icons.jsx';

/**
 * Step 3 — KYC: PAN + Aadhaar numbers with document uploads.
 *
 * SECURITY: the full Aadhaar number is read straight from an UNCONTROLLED
 * input via ref, used once to validate (format + Verhoeff checksum) and to
 * call the KYC service, then the input is cleared. Only the masked value
 * (last 4 digits) and provider document references are kept in wizard
 * state. Nothing sensitive ever reaches React state or localStorage.
 */
export default function StepKyc({ kyc, onVerified, onBack }) {
  const toast = useToast();
  const aadhaarInputRef = useRef(null);
  const [pan, setPan] = useState(kyc.pan ?? '');
  const [aadhaarConfirmed, setAadhaarConfirmed] = useState(!!kyc.aadhaarLast4);
  const [panFile, setPanFile] = useState(null);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [errors, setErrors] = useState({});

  const handleVerify = async () => {
    const nextErrors = {};
    if (!isValidPAN(pan)) nextErrors.pan = 'Enter a valid PAN in the format ABCDE1234F';
    if (!aadhaarConfirmed) nextErrors.aadhaar = 'Enter and confirm your Aadhaar number';
    if (!panFile) nextErrors.panFile = 'PAN document upload is required';
    if (!aadhaarFile) nextErrors.aadhaarFile = 'Aadhaar document upload is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const aadhaarRaw = aadhaarInputRef.current?.value ?? '';
    setVerifying(true);
    try {
      const result = await kycService.verifyDocuments({
        pan: pan.trim().toUpperCase(),
        aadhaar: aadhaarRaw, // transient — discarded after this call
        panFile,
        aadhaarFile,
      });
      // Immediately clear the raw Aadhaar from the DOM input.
      if (aadhaarInputRef.current) aadhaarInputRef.current.value = '';
      setAadhaarConfirmed(true);
      onVerified({
        pan: pan.trim().toUpperCase(),
        aadhaarLast4: result.aadhaarLast4,
        panDocRef: result.panDocRef,
        aadhaarDocRef: result.aadhaarDocRef,
      });
      toast.success({ title: 'KYC details verified', message: 'Documents accepted and encrypted.' });
    } catch (err) {
      toast.error({ title: 'Verification failed', message: err.message });
      if (/Aadhaar/i.test(err.message)) setAadhaarConfirmed(false);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-navy-100 bg-navy-50/70 p-4">
        <IconLock size={18} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-navy-600">
          Your documents are encrypted in transit and at rest. We store only a masked reference to
          your Aadhaar (last 4 digits) in this browser — never the full number.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PAN side */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-navy-500">PAN card</h3>
          <Input
            label="PAN number"
            required
            placeholder="ABCDE1234F"
            maxLength={10}
            autoComplete="off"
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            error={errors.pan}
            hint="Format: 5 letters, 4 digits, 1 letter"
          />
          <FileUploadCard
            id="pan-file"
            title="PAN document"
            file={panFile}
            onChange={(f) => {
              setPanFile(f);
              setErrors((prev) => ({ ...prev, panFile: null }));
            }}
          />
          {errors.panFile && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {errors.panFile}
            </p>
          )}
        </div>

        {/* Aadhaar side */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-navy-500">Aadhaar card</h3>
          {aadhaarConfirmed ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-navy-900">
                  Aadhaar {maskAadhaar(kyc.aadhaarLast4 ?? '****')}
                </p>
                <p className="text-xs text-navy-500">Verified · full number not stored</p>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-emerald-700 underline-offset-2 hover:underline"
                onClick={() => setAadhaarConfirmed(false)}
              >
                Edit
              </button>
            </div>
          ) : (
            <div>
              <label htmlFor="aadhaar-number" className="mb-1.5 block text-sm font-medium text-navy-800">
                Aadhaar number <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              {/* Uncontrolled on purpose: value never enters React state */}
              <input
                ref={aadhaarInputRef}
                id="aadhaar-number"
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                maxLength={14}
                placeholder="XXXX XXXX XXXX"
                onInput={(e) => {
                  // format in groups of 4 as the user types
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                  e.target.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                }}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm tracking-wider text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 ${
                  errors.aadhaar ? 'border-red-400' : 'border-navy-200 hover:border-navy-300'
                }`}
                aria-describedby="aadhaar-hint"
                aria-invalid={errors.aadhaar ? 'true' : undefined}
              />
              <p id="aadhaar-hint" className="mt-1.5 flex items-center gap-1 text-xs text-navy-500">
                <IconInfo size={12} aria-hidden="true" /> 12 digits with a valid checksum.
                <span className="text-navy-400">Demo: {DEMO_AADHAAR}</span>
              </p>
              {errors.aadhaar && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.aadhaar}
                </p>
              )}
            </div>
          )}
          <FileUploadCard
            id="aadhaar-file"
            title="Aadhaar document"
            file={aadhaarFile}
            onChange={(f) => {
              setAadhaarFile(f);
              setErrors((prev) => ({ ...prev, aadhaarFile: null }));
            }}
          />
          {errors.aadhaarFile && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {errors.aadhaarFile}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={verifying}>
          Back
        </Button>
        <Button size="lg" onClick={handleVerify} isLoading={verifying}>
          <IconShieldCheck size={18} /> Verify & continue
        </Button>
      </div>
    </div>
  );
}
