import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { PlayerCard } from '@/components/player-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Shield, Trophy, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import type { Team, Player, Match } from '@shared/schema';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MeuTimePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [ratings, setRatings] = useState<Record<string, { rating: number; comment: string }>>({});

  const { data: teamData, isLoading: isLoadingTeam } = useQuery<Team & { players: Player[] }>({
    queryKey: ['/api/teams', user?.teamId],
    enabled: !!user?.teamId,
  });

  const { data: matches, isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ['/api/matches', user?.teamId],
    queryFn: async () => {
      if (!user?.teamId) return [];
      const response = await fetch(`/api/matches/${user.teamId}/recent?limit=5`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json();
    },
    enabled: !!user?.teamId && !!selectedPlayer,
  });

  const groupedPlayers = teamData?.players.reduce((acc, player) => {
    if (!acc[player.position]) acc[player.position] = [];
    acc[player.position].push(player);
    return acc;
  }, {} as Record<string, Player[]>) || {};

  const positionLabels: Record<string, string> = {
    GOALKEEPER: 'Goleiros',
    DEFENDER: 'Defensores',
    MIDFIELDER: 'Meio-campistas',
    FORWARD: 'Atacantes',
  };

  const handleRatePlayer = (playerId: string) => {
    const player = teamData?.players.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayer(player);
    }
  };

  const ratingMutation = useMutation({
    mutationFn: async ({ playerId, matchId, rating, comment }: { playerId: string; matchId: string; rating: number; comment?: string }) => {
      return await apiRequest('POST', `/api/players/${playerId}/ratings`, { matchId, rating, comment });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a avaliação',
      });
    },
  });

  const handleRatingChange = (matchId: string, value: number[]) => {
    setRatings(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], rating: value[0], comment: prev[matchId]?.comment || '' },
    }));
  };

  const handleCommentChange = (matchId: string, comment: string) => {
    setRatings(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], comment, rating: prev[matchId]?.rating || 5 },
    }));
  };

  const handleSaveRatings = async () => {
    if (!selectedPlayer) return;

    const ratingEntries = Object.entries(ratings);
    if (ratingEntries.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Avalie pelo menos uma partida',
      });
      return;
    }

    try {
      for (const [matchId, { rating, comment }] of ratingEntries) {
        await ratingMutation.mutateAsync({
          playerId: selectedPlayer.id,
          matchId,
          rating,
          comment: comment || undefined,
        });
      }

      // Single success toast after all ratings saved
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: 'Avaliações salvas!',
        description: `${ratingEntries.length} ${ratingEntries.length === 1 ? 'avaliação foi registrada' : 'avaliações foram registradas'} com sucesso`,
      });

      setSelectedPlayer(null);
      setRatings({});
    } catch (error) {
      // Error toast already shown by mutation
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 py-8 max-w-6xl">
        {isLoadingTeam ? (
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-96 rounded-lg" />
          </div>
        ) : teamData ? (
          <>
            {/* Team Header */}
            <div 
              className="rounded-lg p-8 mb-8 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${teamData.primaryColor}15 0%, ${teamData.secondaryColor}15 100%)`,
              }}
            >
              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                <img
                  src={teamData.logoUrl}
                  alt={`Escudo ${teamData.name}`}
                  className="w-32 h-32 object-contain"
                />
                <div className="flex-1 text-center md:text-left">
                  <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
                    {teamData.name}
                  </h1>
                  {teamData.currentPosition && (
                    <Badge variant="secondary" className="mb-4">
                      {teamData.currentPosition}º Lugar
                    </Badge>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{teamData.points}</p>
                        <p className="text-sm text-muted-foreground">Pontos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold">{teamData.wins}</p>
                        <p className="text-sm text-muted-foreground">Vitórias</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Shield className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                        <p className="text-2xl font-bold">{teamData.draws}</p>
                        <p className="text-sm text-muted-foreground">Empates</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
                        <p className="text-2xl font-bold">{teamData.losses}</p>
                        <p className="text-sm text-muted-foreground">Derrotas</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>

            {/* Players by Position */}
            <div className="space-y-8">
              {Object.entries(groupedPlayers).map(([position, players]) => (
                <div key={position}>
                  <h2 className="font-display font-semibold text-2xl mb-4 uppercase tracking-wide flex items-center gap-2">
                    {positionLabels[position] || position}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {players.map((player) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        onRate={handleRatePlayer}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Selecione um time para ver os jogadores</p>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">
              Avaliar {selectedPlayer?.name}
            </DialogTitle>
            <DialogDescription>
              Dê suas notas para as últimas partidas do jogador
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {isLoadingMatches ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            ) : matches && matches.length > 0 ? (
              matches.map((match) => (
              <Card key={match.id}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{match.opponent}</p>
                      <p className="text-sm text-muted-foreground">
                        {match.teamScore !== null && match.opponentScore !== null ? (
                          <>Placar: {match.teamScore}x{match.opponentScore} • </>
                        ) : null}
                        {format(new Date(match.matchDate), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nota (0-10)</Label>
                    <Slider
                      min={0}
                      max={10}
                      step={0.5}
                      value={[ratings[match.id]?.rating || 5]}
                      onValueChange={(value) => handleRatingChange(match.id, value)}
                      className="py-4"
                      data-testid={`slider-rating-${match.id}`}
                    />
                    <div className="text-center font-bold text-2xl">
                      {(ratings[match.id]?.rating || 5).toFixed(1)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Comentário (opcional)</Label>
                    <Textarea
                      placeholder="Digite seu comentário sobre a atuação..."
                      maxLength={200}
                      value={ratings[match.id]?.comment || ''}
                      onChange={(e) => handleCommentChange(match.id, e.target.value)}
                      data-testid={`textarea-comment-${match.id}`}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {ratings[match.id]?.comment?.length || 0}/200 caracteres
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Não há partidas recentes para avaliar</p>
                </CardContent>
              </Card>
            )}

            {matches && matches.length > 0 && (
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleSaveRatings}
                disabled={ratingMutation.isPending}
                data-testid="button-save-ratings"
              >
                {ratingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Avaliações'
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
