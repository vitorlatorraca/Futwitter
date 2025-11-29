import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Check, X } from 'lucide-react';
import { validateEmail, validatePassword, validateName } from '@/utils/validation';

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Password requirements state
  const passwordRequirements = {
    minLength: formData.password.length >= 6,
    maxLength: formData.password.length <= 128,
    hasContent: formData.password.length > 0,
  };

  // Email validation state
  const emailValidation = validateEmail(formData.email);
  const nameValidation = validateName(formData.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name
    if (!nameValidation.valid) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: nameValidation.error || 'Please enter a valid name',
      });
      return;
    }

    // Validate email
    if (!emailValidation.valid) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: emailValidation.error || 'Please enter a valid email',
      });
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: passwordValidation.error || 'Please enter a valid password',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Passwords do not match',
      });
      return;
    }

    // Store signup data in sessionStorage and redirect to team selection
    sessionStorage.setItem('signupData', JSON.stringify({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    }));

    setLocation('/selecionar-time');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] px-4 py-12">
      <div className="w-full max-w-md relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#8b5cf6]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#6366f1]/20 rounded-full blur-3xl"></div>
        
        {/* Glassmorphism Card */}
        <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-white/10 shadow-2xl">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-[#6366f1]/10 rounded-2xl sm:rounded-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] mb-3 sm:mb-4">
                <UserPlus className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-2 tracking-tight">
                Create your account
              </h1>
              <p className="text-sm sm:text-base text-gray-400 font-light">
                Join thousands of passionate fans
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80 font-light">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                  data-testid="input-name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
                />
                {formData.name && !nameValidation.valid && (
                  <p className="text-xs text-red-400 mt-1">{nameValidation.error}</p>
                )}
              </div>
              
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 font-light">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  data-testid="input-email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
                />
                {formData.email && !emailValidation.valid && (
                  <p className="text-xs text-red-400 mt-1">{emailValidation.error}</p>
                )}
                <p className="text-xs text-gray-500">Format: example@mail.com</p>
              </div>
              
              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80 font-light">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  data-testid="input-password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
                />
                
                {/* Password requirements indicator */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-400 mb-1">Password requirements:</p>
                  <div className="flex items-center gap-2">
                    {passwordRequirements.minLength ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-gray-500" />
                    )}
                    <span className={`text-xs ${passwordRequirements.minLength ? 'text-green-500' : 'text-gray-500'}`}>
                      At least 6 characters
                    </span>
                  </div>               
              
                </div>
              </div>
              
              {/* Confirm password field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80 font-light">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                  data-testid="input-confirm-password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Passwords match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-medium bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-300 h-12"
                disabled={isLoading}
                data-testid="button-signup"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6 font-light">
              Already have an account?{' '}
              <Link href="/login" data-testid="link-login">
                <span className="text-[#8b5cf6] font-medium hover:text-[#7c3aed] cursor-pointer transition-colors">
                  Sign in
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
