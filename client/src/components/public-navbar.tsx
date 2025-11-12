import { Link, useLocation } from 'wouter';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/language-selector';

export function PublicNavbar() {
  const { t } = useI18n();
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" data-testid="link-logo">
          <div className="flex items-center gap-2 text-xl font-light tracking-tight hover:opacity-80 transition-opacity cursor-pointer text-white">
            <span className="text-2xl">⚽</span>
            <span className="hidden sm:inline">Brasileirão</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <LanguageSelector />
          <Link href="/login" data-testid="link-login">
            <Button
              variant={location === '/login' ? 'secondary' : 'ghost'}
              className="font-medium text-white/80 hover:text-white hover:bg-white/5 border-0"
            >
              {t('landing.cta.login')}
            </Button>
          </Link>
          <Link href="/cadastro" data-testid="link-signup">
            <Button
              variant="default"
              className="font-medium bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white rounded-lg border-0"
            >
              {t('landing.cta.signup')}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/5 border-0">
              {t('landing.cta.login')}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}


