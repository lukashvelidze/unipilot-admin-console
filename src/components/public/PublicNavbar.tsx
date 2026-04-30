import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Articles', href: '/articles' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Privacy', href: 'https://unipilot.app/privacy', external: true },
];

const appStoreUrl = 'https://apps.apple.com/us/app/unipilot-journey-tracker/id6748587544';

export function PublicNavbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/6 bg-white/92 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex min-h-[72px] items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src="/favicon.png" alt="UniPilot logo" className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10" />
            <div className="min-w-0">
              <span className="block truncate text-base font-semibold tracking-[-0.03em] text-slate-950 sm:text-lg">
                UniPilot
              </span>
              <span className="hidden truncate text-xs text-slate-500 sm:block">
                Your international journey tracker
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const isActive = !item.external && location.pathname === item.href;
              const className = cn(
                'text-sm font-medium transition-colors hover:text-slate-950',
                isActive ? 'text-slate-950' : 'text-slate-600'
              );

              return item.external ? (
                <a key={item.href} href={item.href} className={className}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} to={item.href} className={className}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link to="/login" className="text-sm text-slate-500 transition-colors hover:text-slate-950">
              Log in
            </Link>
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Download
            </a>
          </div>

          <button
            className="rounded-2xl border border-black/10 bg-white p-2.5 transition-colors hover:bg-slate-50 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-black/6 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) =>
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    {item.label}
                  </Link>
                )
              )}

              <div className="mt-2 flex flex-col gap-3 border-t border-black/6 pt-4">
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-slate-950 px-4 py-3 text-center text-sm font-medium text-white"
                >
                  Download
                </a>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-1 text-xs uppercase tracking-[0.18em] text-slate-500"
                >
                  Admin
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
