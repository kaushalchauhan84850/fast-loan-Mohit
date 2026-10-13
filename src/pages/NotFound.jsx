import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Button from '../components/ui/Button.jsx';
import { IconArrowRight } from '../components/ui/Icons.jsx';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-7xl font-extrabold tracking-tight text-navy-100" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-2xl font-extrabold text-navy-950">This page took a loan and left</h1>
      <p className="mt-2 max-w-md text-sm text-navy-600">
        The page you're looking for doesn't exist or may have moved. Let's get you back on track.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button to="/" size="lg">
          Back to home <IconArrowRight size={17} />
        </Button>
        <Button to="/emi-calculator" variant="outline" size="lg">
          Open loan calculator
        </Button>
      </div>
    </div>
  );
}
