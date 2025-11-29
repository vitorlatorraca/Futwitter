import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/language-selector';
import { 
  LogOut, 
  Newspaper, 
  Shield, 
  User, 
  PenSquare, 
  Settings,
  type LucideIcon 
} from 'lucide-react';
import { useEffect } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [location] = useLocation();

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

  const navLinks: { label: string; href: string; testId: string; icon: LucideIcon }[] = [
    { label: t('nav.feed'), href: '/dashboard', testId: 'link-feed', icon: Newspaper },
    { label: t('nav.myTeam'), href: '/meu-time', testId: 'link-meu-time', icon: Shield },
    { label: t('nav.profile'), href: '/perfil', testId: 'link-perfil', icon: User },
  ];

  if (user.userType === 'JOURNALIST' || user.isInfluencer) {
    navLinks.push({ label: t('nav.journalist'), href: '/jornalista', testId: 'link-jornalista', icon: PenSquare });
  }

  if (user.userType === 'ADMIN') {
    navLinks.push({ label: 'Admin', href: '/admin', testId: 'link-admin', icon: Settings });
  }

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/30 backdrop-blur-md supports-[backdrop-filter]:bg-black/10">
      <div className="w-full max-w-[1920px] mx-auto flex h-12 sm:h-14 items-center justify-between px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
        {/* Logo - Ultra minimalista mobile */}
        <Link href="/dashboard" data-testid="link-logo">
          <div className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg md:text-xl font-light tracking-tight hover:opacity-80 transition-opacity cursor-pointer text-white">
            <span className="text-lg sm:text-xl md:text-2xl">⚽</span>
            <span className="hidden md:inline">Futwitter</span>
          </div>
        </Link>

        {/* Navigation - Icons on mobile, text on desktop */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} data-testid={link.testId}>
                <Button
                  variant={isActive(link.href) ? 'default' : 'ghost'}
                  size="sm"
                  className={`font-light transition-all duration-300 ${
                    isActive(link.href)
                      ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white border-0'
                      : 'text-white/80 hover:text-white hover:bg-white/5 border-0'
                  } px-2 sm:px-3 md:px-4`}
                >
                  <Icon className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{link.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>
          
          {/* User Avatar - visible on all sizes */}
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-white/10 overflow-hidden bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center flex-shrink-0">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-white text-[10px] sm:text-xs font-medium">
                {user.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* User name - hidden on mobile */}
          <span className="text-sm font-light text-white/80 hidden lg:inline">{user.name}</span>
          
          {/* Logout button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className="text-white/60 hover:text-white hover:bg-white/5 border-0 h-8 w-8 sm:h-9 sm:w-9"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
