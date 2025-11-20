import React from 'react';
import { Link } from 'wouter';
import { useI18n } from '@/lib/i18n';
import { PublicNavbar } from '@/components/public-navbar';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function LandingPage() {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] text-white">
      <PublicNavbar />
      
      {/* Hero Section - Minimal & Aesthetic */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 sm:mb-8">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-[#8b5cf6]" />
            <span className="text-xs sm:text-sm text-gray-400">Plataforma Social para Futebol Brasileiro</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 sm:mb-8 leading-tight tracking-tight px-2">
            {t('landing.hero.title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-light px-4">
            {t('landing.hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/cadastro" data-testid="link-signup">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-sm sm:text-base font-medium px-6 sm:px-8 py-5 sm:py-6 h-auto bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-300"
              >
                {t('landing.cta.signup')}
              </Button>
            </Link>
            <Link href="/login" data-testid="link-login">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-base font-medium px-6 sm:px-8 py-5 sm:py-6 h-auto border border-white/20 text-white hover:bg-white/5 hover:border-white/30 rounded-lg backdrop-blur-sm transition-all duration-300"
              >
                {t('landing.cta.login')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Story Section - Minimal & Aesthetic */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white mb-3 sm:mb-4 text-center tracking-tight px-2">
            A História do Projeto
          </h2>
          <div className="w-16 sm:w-20 md:w-24 h-px bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent mx-auto"></div>
        </div>
        
        <div className="relative">
          {/* Glassmorphism Card */}
          <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 border border-white/10 shadow-2xl">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-[#6366f1]/10 rounded-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-0.5 sm:w-1 h-6 sm:h-8 bg-gradient-to-b from-[#8b5cf6] to-[#6366f1] rounded-full"></div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-white">
                  O Início
                </h3>
              </div>
              
              <div className="space-y-4 sm:space-y-5 md:space-y-6 text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-light">
                <p className="text-gray-300/90">
                  O <span className="text-white font-medium">Brasileirão DataFlow</span> nasceu da paixão pelo futebol brasileiro e da vontade de criar uma plataforma 
                  que unisse torcedores, jornalistas e fãs em um só lugar. A ideia era combinar o melhor do Instagram 
                  (engajamento e feed interativo) com a autoridade do ESPN (notícias e análises profissionais).
                </p>
                <p className="text-gray-300/90">
                  Começamos com uma arquitetura full-stack moderna: <span className="text-[#8b5cf6]">React 18 + TypeScript</span> no frontend, 
                  <span className="text-[#8b5cf6]"> Express.js</span> no backend, e <span className="text-[#8b5cf6]">PostgreSQL</span> como banco de dados. 
                  A escolha do <span className="text-[#8b5cf6]">Drizzle ORM</span> garantiu type-safety em todo o 
                  stack, desde o banco até o frontend.
                </p>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#8b5cf6]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-[#6366f1]/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-32"></div>
    </div>
  );
}
