import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../ui/Button.jsx';
import { IconMenu, IconX, IconLogout, IconUser } from '../ui/Icons.jsx';

const NAV_LINKS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/loans', key: 'nav.loans' },
  { to: '/emi-calculator', key: 'nav.calculator' },
  { to: '/how-it-works', key: 'nav.how' },
  { to: '/faq', key: 'nav.faq' },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="TrustLend home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-950 shadow-soft">
        <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M10 11h12M16 11v11" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-navy-950">
        Trust<span className="text-emerald-600">Lend</span>
      </span>
    </Link>
  );
}

/** Sticky navigation with mobile hamburger and auth-aware actions. */
export default function Navbar() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on Escape and on route-pop gestures
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    toast.success({ title: 'Logged out', message: 'See you soon!' });
    navigate('/');
  };

  const linkCls = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive ? 'bg-navy-50 text-navy-950' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Brand />

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkCls}>
              {t(link.key)}
            </NavLink>
          ))}
        </div>

        {/* Desktop auth actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Button to="/dashboard" variant="outline" size="sm">
                <IconUser size={16} /> {t('nav.dashboard')}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <IconLogout size={16} /> {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                {t('nav.login')}
              </Button>
              <Button to="/signup" size="sm">
                {t('nav.signup')}
              </Button>
            </>
          )}
        </div>

        {/* Hamburger (mobile) */}
        <button
          type="button"
          className="rounded-lg p-2 text-navy-700 transition-colors hover:bg-navy-50 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <IconX size={22} /> : <IconMenu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden border-t border-navy-100 bg-white lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive ? 'bg-navy-50 text-navy-950' : 'text-navy-600 hover:bg-navy-50'
                    }`
                  }
                >
                  {t(link.key)}
                </NavLink>
              ))}
              <div className="flex flex-col gap-2 border-t border-navy-100 pt-3">
                {user ? (
                  <>
                    <Button to="/dashboard" variant="outline" fullWidth onClick={() => setOpen(false)}>
                      {t('nav.dashboard')}
                    </Button>
                    <Button variant="ghost" fullWidth onClick={handleLogout}>
                      <IconLogout size={16} /> {t('nav.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button to="/login" variant="outline" fullWidth onClick={() => setOpen(false)}>
                      {t('nav.login')}
                    </Button>
                    <Button to="/signup" fullWidth onClick={() => setOpen(false)}>
                      {t('nav.signup')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
