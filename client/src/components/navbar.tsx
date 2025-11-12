import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSelector } from '@/components/language-selector';
import { Menu, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const navLinks = [
    { label: t('nav.feed'), href: '/dashboard', testId: 'link-feed' },
    { label: t('nav.myTeam'), href: '/meu-time', testId: 'link-meu-time' },
    { label: t('nav.profile'), href: '/perfil', testId: 'link-perfil' },
  ];

  if (user.userType === 'JOURNALIST') {
    navLinks.push({ label: t('nav.journalist'), href: '/jornalista', testId: 'link-jornalista' });
  }

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" data-testid="link-logo">
          <div className="flex items-center gap-2 text-xl font-display font-bold tracking-tight hover-elevate active-elevate-2 rounded-md px-3 py-2 cursor-pointer">
            <span className="text-2xl">⚽</span>
            <span className="hidden sm:inline">Brasileirão</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} data-testid={link.testId}>
              <Button
                variant={isActive(link.href) ? 'secondary' : 'ghost'}
                className="font-medium"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <div className="hidden md:flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden lg:inline">{user.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className="hidden md:flex"
            data-testid="button-logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="button-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} data-testid={link.testId}>
                      <Button
                        variant={isActive(link.href) ? 'secondary' : 'ghost'}
                        className="w-full justify-start font-medium"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                  <div className="pt-2 border-t">
                    <LanguageSelector />
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    data-testid="button-logout-mobile"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
