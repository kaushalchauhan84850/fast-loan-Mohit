import { Link } from 'react-router-dom';

const VARIANTS = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-sm shadow-emerald-600/20',
  secondary: 'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950',
  outline: 'border border-navy-200 bg-white text-navy-800 hover:border-navy-400 hover:bg-navy-50',
  ghost: 'text-navy-700 hover:bg-navy-100/70',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

function Spinner() {
  return (
    <svg className="mr-1 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

/**
 * Button with variants. Renders a <Link> when `to` is given, an <a> when
 * `href` is given, otherwise a <button>. `isLoading` disables and shows a
 * spinner while keeping the label for layout stability.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  const content = (
    <>
      {isLoading && <Spinner />}
      {children}
    </>
  );

  if (to && !disabled && !isLoading) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href && !disabled && !isLoading) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} disabled={disabled || isLoading} {...props}>
      {content}
    </button>
  );
}
