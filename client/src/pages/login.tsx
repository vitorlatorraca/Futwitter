import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('login.error.fillFields'),
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        title: t('login.success'),
        description: t('login.welcome'),
      });
      setLocation('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('login.error.invalid'),
        description: error.message || t('login.error.checkCredentials'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)] px-4 py-12">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Card */}
        <div className="relative bg-[var(--theme-background-alt)] rounded-xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--theme-primary)] mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <LogIn className="h-8 w-8 text-[var(--theme-text)]" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--theme-text)] mb-2">
              {t('login.title')}
            </h1>
            <p className="text-[var(--theme-text-muted)]">
              {t('login.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[var(--theme-text-muted)]">
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                data-testid="input-email"
                className="w-full px-4 py-3 bg-[var(--theme-background)] rounded-lg text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[var(--theme-text-muted)]">
                {t('login.password')}
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                data-testid="input-password"
                className="w-full px-4 py-3 bg-[var(--theme-background)] rounded-lg text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none transition-all"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[var(--theme-primary)] text-[var(--theme-text)] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              data-testid="button-login"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('login.submitting')}
                </span>
              ) : (
                t('login.submit')
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-[var(--theme-text-muted)] mt-6">
            {t('login.noAccount')}{' '}
            <Link href="/cadastro" data-testid="link-signup">
              <span className="text-[var(--theme-primary)] font-semibold hover:underline cursor-pointer">
                {t('login.createAccount')}
              </span>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
