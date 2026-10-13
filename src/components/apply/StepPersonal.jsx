import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalDetailsSchema, COUNTRY_OPTIONS } from '../../utils/schemas.js';
import { Input, Select } from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { IconHome, IconUser } from '../ui/Icons.jsx';

const EMPLOYMENT_OPTIONS = [
  { value: '', label: 'Select employment type' },
  { value: 'salaried', label: 'Salaried' },
  { value: 'self-employed', label: 'Self-employed professional' },
  { value: 'business', label: 'Business owner' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
];

const ADDRESS_TEXT_FIELDS = [
  { key: 'line1', label: 'Address line 1', placeholder: 'House / street / locality', required: true, span: true },
  { key: 'line2', label: 'Address line 2 (optional)', placeholder: 'Landmark, area', span: true },
  { key: 'city', label: 'City', required: true },
  { key: 'state', label: 'State', required: true },
  { key: 'postalCode', label: 'Postal code', placeholder: 'e.g. 411001', required: true },
];

const ADDRESS_KEYS = ['line1', 'line2', 'city', 'state', 'postalCode', 'country'];

function AddressFields({ prefix, register, errors, disabled = false }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {ADDRESS_TEXT_FIELDS.map(({ key, label, placeholder, required, span }) => (
        <Input
          key={`${prefix}.${key}`}
          label={label}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className={span ? 'sm:col-span-2' : ''}
          error={errors?.[key]?.message}
          {...register(`${prefix}.${key}`)}
        />
      ))}
      <Select
        label="Country"
        required
        disabled={disabled}
        error={errors?.country?.message}
        {...register(`${prefix}.country`)}
      >
        {COUNTRY_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
    </div>
  );
}

/** Step 1 — personal details + KYC addresses (permanent & current). */
export default function StepPersonal({ defaultValues, onNext }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const sameAsPermanent = watch('sameAsPermanent');
  const permanentAddress = watch('permanentAddress');

  // "Same as permanent address" → mirror every permanent field into current,
  // live, while the box stays checked.
  useEffect(() => {
    if (sameAsPermanent && permanentAddress) {
      ADDRESS_KEYS.forEach((k) => {
        setValue(`currentAddress.${k}`, permanentAddress[k] ?? '', { shouldValidate: false });
      });
    }
  }, [sameAsPermanent, JSON.stringify(permanentAddress), setValue]);

  return (
    <form noValidate onSubmit={handleSubmit(async (data) => onNext(data))} className="space-y-8">
      {/* --- personal --- */}
      <section aria-labelledby="personal-heading">
        <h3 id="personal-heading" className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500">
          <IconUser size={16} /> Personal details
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Full name (as per Aadhaar)"
            required
            autoComplete="name"
            placeholder="e.g. Aarav Sharma"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Date of birth"
            required
            type="date"
            error={errors.dob?.message}
            hint="You must be 18–65 years old"
            {...register('dob')}
          />
          <Select
            label="Employment type"
            required
            error={errors.employmentType?.message}
            {...register('employmentType')}
          >
            {EMPLOYMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Input
            label="Monthly income (₹)"
            required
            type="number"
            min="0"
            step="500"
            placeholder="e.g. 45000"
            error={errors.monthlyIncome?.message}
            {...register('monthlyIncome')}
          />
        </div>
      </section>

      {/* --- permanent address --- */}
      <section aria-labelledby="perm-addr-heading" className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
        <h3 id="perm-addr-heading" className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500">
          <IconHome size={16} /> Permanent address
        </h3>
        <AddressFields prefix="permanentAddress" register={register} errors={errors.permanentAddress} />
      </section>

      {/* --- current / destination address --- */}
      <section aria-labelledby="cur-addr-heading" className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 id="cur-addr-heading" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500">
            <IconHome size={16} /> Current / destination address
          </h3>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-navy-200 bg-white px-3.5 py-2 text-sm font-semibold text-navy-800 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/70">
            <input
              type="checkbox"
              className="h-4 w-4 accent-emerald-600"
              {...register('sameAsPermanent')}
            />
            Same as permanent address
          </label>
        </div>
        <AddressFields
          prefix="currentAddress"
          register={register}
          errors={errors.currentAddress}
          disabled={sameAsPermanent}
        />
        {sameAsPermanent && (
          <p className="mt-3 text-xs text-navy-500">
            Auto-filled from your permanent address. Uncheck to edit.
          </p>
        )}
      </section>

      <div className="flex justify-end pt-2">
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Save & continue
        </Button>
      </div>
    </form>
  );
}
