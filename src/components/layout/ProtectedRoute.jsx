import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/** Centered spinner shown while the session is being restored. */
function BootScreen() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Checking your session">
      <svg className="h-8 w-8 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
      </svg>
    </div>
  );
}

/**
 * Guards authenticated routes. Unauthenticated visitors are sent to
 * /login with the attempted location in state, so login returns them
 * exactly where they were going (including query strings).
 */
export default function ProtectedRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <BootScreen />;
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname, search: location.search } }}
      />
    );
  }
  return <Outlet />;
}
