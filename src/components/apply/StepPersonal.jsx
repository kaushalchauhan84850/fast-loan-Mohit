import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalDetailsSchema } from '../../utils/schemas.js';
import { Input, Select, Textarea } from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

const EMPLOYMENT_OPTIONS = [
  { value: '', label: 'Select employment type' },
  { value: 'salaried', label: 'Salaried' },
  { value: 'self-employed', label: 'Self-employed professional' },
  { value: 'business', label: 'Business owner' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
];

/** Step 1 — personal & financial details. */
export default function StepPersonal({ defaultValues, onNext }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues,
    mode: 'onTouched',
  });

  return (
    <form noValidate onSubmit={handleSubmit(async (data) => onNext(data))} className="space-y-5">
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
      <Textarea
        label="Residential address"
        required
        placeholder="House / street / locality"
        error={errors.address?.message}
        {...register('address')}
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <Input label="City" required error={errors.city?.message} {...register('city')} />
        <Input label="State" required error={errors.state?.message} {...register('state')} />
        <Input
          label="PIN code"
          required
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit PIN"
          error={errors.pincode?.message}
          {...register('pincode')}
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Save & continue
        </Button>
      </div>
    </form>
  );
}
