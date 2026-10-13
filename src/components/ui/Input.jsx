import { forwardRef, useId } from 'react';

const baseField =
  'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 ' +
  'transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500 ' +
  'disabled:cursor-not-allowed disabled:bg-navy-50';

function fieldClasses(hasError) {
  return `${baseField} ${hasError ? 'border-red-400' : 'border-navy-200 hover:border-navy-300'}`;
}

function ErrorText({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
      {children}
    </p>
  );
}

function Hint({ children }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-navy-500">{children}</p>;
}

/**
 * Labelled text input wired for React Hook Form register():
 * <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
 * `rightElement` renders inside the input row (e.g. a show-password button),
 * vertically centred on the field itself.
 */
export const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, rightElement, className = '', ...props },
  ref
) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={props.id ?? id} className="mb-1.5 block text-sm font-medium text-navy-800">
          {label}
          {props.required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400">
            <Icon size={18} />
          </span>
        )}
        <input
          ref={ref}
          id={props.id ?? id}
          className={`${fieldClasses(!!error)} ${Icon ? 'pl-11' : ''} ${rightElement ? 'pr-11' : ''}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center">
            {rightElement}
          </span>
        )}
      </div>
      <ErrorText id={errorId}>{error}</ErrorText>
      <Hint>{hint}</Hint>
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className = '', rows = 3, ...props },
  ref
) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={props.id ?? id} className="mb-1.5 block text-sm font-medium text-navy-800">
          {label}
          {props.required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={props.id ?? id}
        rows={rows}
        className={fieldClasses(!!error)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      <ErrorText id={errorId}>{error}</ErrorText>
      <Hint>{hint}</Hint>
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, error, hint, children, className = '', ...props },
  ref
) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={props.id ?? id} className="mb-1.5 block text-sm font-medium text-navy-800">
          {label}
          {props.required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={props.id ?? id}
        className={`${fieldClasses(!!error)} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%3E%3Cpath%20d%3D%22M1%201l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-no-repeat pr-10`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {children}
      </select>
      <ErrorText id={errorId}>{error}</ErrorText>
      <Hint>{hint}</Hint>
    </div>
  );
});

/**
 * Consent checkbox with rich label content (links etc).
 * <Checkbox error={errors.acceptTerms?.message} {...register('acceptTerms')} label={<>I agree…</>} />
 */
export const Checkbox = forwardRef(function Checkbox(
  { label, error, hint, className = '', ...props },
  ref
) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={props.id ?? id}
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-navy-300 text-emerald-600 accent-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {label && (
          <label htmlFor={props.id ?? id} className="cursor-pointer text-sm text-navy-700">
            {label}
          </label>
        )}
      </div>
      <ErrorText id={errorId}>{error}</ErrorText>
      <Hint>{hint}</Hint>
    </div>
  );
});
