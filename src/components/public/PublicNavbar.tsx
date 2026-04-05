import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Articles', href: '/articles' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: 'https://unipilot.app/privacy', external: true },
];

export function PublicNavbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-18 items-center justify-between gap-3 py-3 md:h-16 md:py-0">
          {/* Logo */}
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src="/favicon.png" alt="UniPilot logo" className="h-10 w-10 shrink-0 object-contain md:h-9 md:w-9" />
            <div className="min-w-0">
              <span className="block truncate text-base font-semibold leading-tight sm:hidden">UniPilot</span>
              <span className="block truncate text-[11px] text-muted-foreground sm:hidden">
                Study Abroad Made Simple
              </span>
              <span className="hidden text-xl font-semibold sm:block">UniPilot — Study Abroad Made Simple</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const className = cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive ? 'text-primary' : 'text-muted-foreground'
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

          {/* Subtle Admin Link */}
          <div className="hidden md:block">
            <Link
              to="/login"
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Log In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-2xl border border-border/70 bg-white/80 p-2.5 shadow-sm transition-colors hover:bg-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <nav className="flex flex-col gap-2 rounded-3xl border border-border/70 bg-white/80 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                const className = cn(
                  'rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                );
                return item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={className}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={className}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 border-t border-border px-4 pt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors hover:text-muted-foreground"
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
