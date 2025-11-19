import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSelector } from '@/components/language-selector';
import { Menu, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;
  
  // Debug: verificar se avatarUrl está presente
  useEffect(() => {
    console.log('📊 Navbar renderizado - User completo:', user);
    if (user && user.avatarUrl) {
      console.log('✅ Navbar - User avatarUrl presente:', user.avatarUrl.substring(0, 80) + '...');
      console.log('✅ Navbar - Avatar URL length:', user.avatarUrl.length);
    } else {
      console.log('❌ Navbar - User avatarUrl ausente:', user?.avatarUrl || 'null/undefined');
    }
  }, [user, user?.avatarUrl]);

  const navLinks = [
    { label: t('nav.feed'), href: '/dashboard', testId: 'link-feed' },
    { label: t('nav.myTeam'), href: '/meu-time', testId: 'link-meu-time' },
    { label: t('nav.profile'), href: '/perfil', testId: 'link-perfil' },
  ];

  if (user.userType === 'JOURNALIST' || user.isInfluencer) {
    navLinks.push({ label: t('nav.journalist'), href: '/jornalista', testId: 'link-jornalista' });
  }

  if (user.userType === 'ADMIN') {
    navLinks.push({ label: 'Admin', href: '/admin', testId: 'link-admin' });
  }

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/30 backdrop-blur-md supports-[backdrop-filter]:bg-black/10">
      <div className="container flex h-12 sm:h-14 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Logo - Ultra minimalista mobile */}
        <Link href="/dashboard" data-testid="link-logo">
          <div className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg md:text-xl font-light tracking-tight hover:opacity-80 transition-opacity cursor-pointer text-white">
            <span className="text-lg sm:text-xl md:text-2xl">⚽</span>
            <span className="hidden md:inline">Brasileirão</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} data-testid={link.testId}>
              <Button
                variant={isActive(link.href) ? 'default' : 'ghost'}
                className={`font-light transition-all duration-300 ${
                  isActive(link.href)
                    ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white border-0'
                    : 'text-white/80 hover:text-white hover:bg-white/5 border-0'
                }`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="h-8 w-8 rounded-full border border-white/10 overflow-hidden bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center" key={`avatar-${user.avatarUrl ? user.avatarUrl.substring(0, 100).replace(/[^a-zA-Z0-9]/g, '') : 'none'}`}>
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    console.log('✅ Avatar imagem carregada com sucesso!');
                  }}
                  onError={(e) => {
                    console.error('❌ Erro ao carregar avatar:', user.avatarUrl?.substring(0, 100));
                    console.error('❌ Erro completo:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                  key={`img-${user.avatarUrl?.substring(0, 50) || 'none'}`}
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {user.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-sm font-light text-white/80 hidden lg:inline">{user.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className="hidden md:flex text-white/80 hover:text-white hover:bg-white/5 border-0"
            data-testid="button-logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>

          {/* Mobile Menu - Minimalista */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="button-menu" className="text-white/70 hover:text-white hover:bg-white/5 border-0 h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-[#0a0a0a] border-white/5">
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                  <div className="h-9 w-9 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0" key={`avatar-mobile-${user.avatarUrl ? user.avatarUrl.substring(0, 100).replace(/[^a-zA-Z0-9]/g, '') : 'none'}`}>
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onLoad={() => {
                          console.log('✅ Avatar mobile imagem carregada com sucesso!');
                        }}
                        onError={(e) => {
                          console.error('❌ Erro ao carregar avatar mobile:', user.avatarUrl?.substring(0, 100));
                          e.currentTarget.style.display = 'none';
                        }}
                        key={`img-mobile-${user.avatarUrl?.substring(0, 50) || 'none'}`}
                      />
                    ) : (
                      <span className="text-white/80 text-xs font-light">
                        {user.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-light text-sm text-white/90 truncate">{user.name}</p>
                    <p className="text-[10px] text-white/40 font-light truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} data-testid={link.testId}>
                      <Button
                        variant={isActive(link.href) ? 'default' : 'ghost'}
                        className={`w-full justify-start font-light text-sm transition-all duration-200 h-9 ${
                          isActive(link.href)
                            ? 'bg-white/10 text-white border-0'
                            : 'text-white/60 hover:text-white/90 hover:bg-white/5 border-0'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                  <div className="pt-2 border-t border-white/5 sm:hidden">
                    <LanguageSelector />
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white/50 hover:text-white/80 hover:bg-white/5 border-0 font-light text-sm h-9 mt-1"
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    data-testid="button-logout-mobile"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2" />
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
