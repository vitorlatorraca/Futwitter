import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
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

export function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [location] = useLocation();

  if (!user) return null;

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
    <nav className="sticky top-0 z-50 w-full bg-[var(--theme-background)]/95 backdrop-blur-md">
      <div className="w-full max-w-[1920px] mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <motion.div
          whileHover={{ x: [0, -2, 2, -2, 0] }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Link href="/dashboard" data-testid="link-logo">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-xl sm:text-2xl">⚽</span>
              <span className="hidden md:inline text-lg sm:text-xl font-bold tracking-tight text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors">
                Futwitter
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Navigation - Text only, no boxes */}
        <div className="flex items-center gap-4 sm:gap-6">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <motion.div
                key={link.href}
                whileHover={{ x: [0, -2, 2, -2, 0] }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <Link href={link.href} data-testid={link.testId}>
                  <span
                    className={`
                      text-sm font-semibold cursor-pointer transition-colors
                      ${active 
                        ? 'text-[var(--theme-primary)]' 
                        : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                      }
                    `}
                  >
                    {link.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>
          
          {/* User Avatar */}
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden bg-[var(--theme-background-alt)] flex items-center justify-center flex-shrink-0">
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
              <span className="text-[var(--theme-text)] text-xs font-semibold">
                {user.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* User name */}
          <motion.span 
            className="text-sm font-medium text-[var(--theme-text-muted)] hidden lg:inline cursor-pointer hover:text-[var(--theme-text)]"
            whileHover={{ x: [0, -1, 1, -1, 0] }}
            transition={{ duration: 0.3 }}
          >
            {user.name}
          </motion.span>
          
          {/* Logout - just icon */}
          <motion.button
            onClick={() => logout()}
            className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
            whileHover={{ x: [0, -1, 1, -1, 0] }}
            transition={{ duration: 0.3 }}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
