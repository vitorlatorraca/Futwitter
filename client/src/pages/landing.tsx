import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Users } from 'lucide-react';
import heroImage from '@assets/generated_images/Brazilian_stadium_hero_image_6c66814c.png';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        
        <div className="relative z-10 container px-4 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            Sua paixão pelo Brasileirão<br />em uma só plataforma
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto font-medium">
            Avalie jogadores, leia notícias exclusivas e conecte-se com milhares de torcedores apaixonados
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/cadastro" data-testid="link-signup">
              <Button 
                size="lg" 
                className="text-base font-semibold px-8 bg-primary/90 hover:bg-primary backdrop-blur-sm"
              >
                Criar Conta Grátis
              </Button>
            </Link>
            <Link href="/login" data-testid="link-login">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base font-semibold px-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/30 text-white"
              >
                Já tenho conta
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 justify-center text-white/80 text-sm font-medium">
            <span className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              20 Times
            </span>
            <span className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              500+ Jogadores
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Milhares de Torcedores
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-12">
            Tudo que você precisa em um só lugar
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">Avalie Jogadores</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dê notas e comentários sobre o desempenho dos jogadores do seu time em cada partida
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">Notícias Exclusivas</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fique por dentro das últimas notícias, análises e bastidores do seu time favorito
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">Conecte-se</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Interaja com outros torcedores, curta e comente notícias da sua torcida
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Brasileirão. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Sobre</a>
              <a href="#" className="hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
