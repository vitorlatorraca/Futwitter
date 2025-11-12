import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { TEAMS_DATA } from '@/lib/team-data';
import { Loader2 } from 'lucide-react';

export default function TeamSelectionPage() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTeamClick = (teamId: string) => {
    setSelectedTeam(teamId);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!selectedTeam) return;

    const signupDataStr = sessionStorage.getItem('signupData');
    if (!signupDataStr) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Dados de cadastro não encontrados. Por favor, refaça o cadastro.',
      });
      setLocation('/cadastro');
      return;
    }

    const signupData = JSON.parse(signupDataStr);
    setIsLoading(true);

    try {
      await register(signupData.name, signupData.email, signupData.password, selectedTeam);
      sessionStorage.removeItem('signupData');
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Bem-vindo à plataforma Brasileirão',
      });
      setLocation('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar conta',
        description: error.message || 'Tente novamente mais tarde',
      });
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const team = TEAMS_DATA.find(t => t.id === selectedTeam);

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Escolha seu time do coração
          </h1>
          <p className="text-muted-foreground text-lg">
            Atenção: Você não poderá mudar depois! Escolha com carinho ⚽
          </p>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4 md:gap-6">
          {TEAMS_DATA.map((team) => (
            <button
              key={team.id}
              onClick={() => handleTeamClick(team.id)}
              className="group flex flex-col items-center gap-2 hover-elevate active-elevate-2 rounded-lg p-3 transition-all"
              data-testid={`button-team-${team.id}`}
            >
              <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
                <img
                  src={team.logoUrl}
                  alt={`Escudo do ${team.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-medium text-center leading-tight hidden md:block">
                {team.shortName}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Confirmar escolha</DialogTitle>
            <DialogDescription className="text-center pt-4">
              {team && (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2" style={{ borderColor: team.primaryColor }}>
                    <img
                      src={team.logoUrl}
                      alt={`Escudo do ${team.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-display font-bold text-xl mb-2">{team.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Tem certeza? Esta escolha é <span className="font-semibold text-foreground">permanente</span> e não poderá ser alterada depois!
                    </p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              data-testid="button-confirm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
