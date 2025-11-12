import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] px-4 py-12">
      <div className="w-full max-w-md relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#8b5cf6]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#6366f1]/20 rounded-full blur-3xl"></div>
        
        {/* Glassmorphism Card */}
        <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-[#6366f1]/10 rounded-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] mb-4">
                <LogIn className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-tight">
                {t('login.title')}
              </h1>
              <p className="text-gray-400 font-light">
                {t('login.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 font-light">{t('login.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  data-testid="input-email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80 font-light">{t('login.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  data-testid="input-password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
                />
              </div>

              <Button
                type="submit"
                className="w-full font-medium bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-300 h-12"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('login.submitting')}
                  </>
                ) : (
                  t('login.submit')
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6 font-light">
              {t('login.noAccount')}{' '}
              <Link href="/cadastro" data-testid="link-signup">
                <span className="text-[#8b5cf6] font-medium hover:text-[#7c3aed] cursor-pointer transition-colors">
                  {t('login.createAccount')}
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
