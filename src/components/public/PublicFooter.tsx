import { Link } from 'react-router-dom';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-black/6 bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold tracking-[-0.03em] text-slate-950">UniPilot</p>
            <p className="mt-1 text-sm text-slate-500">Your international journey tracker</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <Link to="/articles" className="transition-colors hover:text-slate-950">
              Articles
            </Link>
            <Link to="/faqs" className="transition-colors hover:text-slate-950">
              FAQs
            </Link>
            <Link to="/terms" className="transition-colors hover:text-slate-950">
              Terms
            </Link>
            <a href="https://unipilot.app/privacy" className="transition-colors hover:text-slate-950">
              Privacy
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-black/6 pt-6 text-sm text-slate-500">
          &copy; {currentYear} UniPilot. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
