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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
      <Navbar />

      <div className="container px-6 py-8 max-w-6xl">
        {isLoadingTeam ? (
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-2xl bg-white/5" />
            <Skeleton className="h-96 rounded-2xl bg-white/5" />
          </div>
        ) : teamData ? (
          <>
            {/* Team Header */}
            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 mb-8 border border-white/10 shadow-2xl overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-[#6366f1]/10 rounded-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative">
                  <img
                    src={teamData.logoUrl}
                    alt={`Escudo ${teamData.name}`}
                    className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 to-[#6366f1]/20 rounded-full blur-2xl -z-10"></div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="font-light text-4xl md:text-5xl text-white mb-4 tracking-tight">
                    {teamData.name}
                  </h1>
                  {teamData.currentPosition && (
                    <Badge className="mb-6 bg-white/10 border-white/10 text-white/90 font-light text-sm">
                      {teamData.currentPosition}º Lugar
                    </Badge>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                      <CardContent className="p-4 text-center">
                        <Trophy className="h-6 w-6 mx-auto mb-2 text-[#8b5cf6]" />
                        <p className="text-2xl font-light text-white">{teamData.points}</p>
                        <p className="text-sm text-gray-400 font-light">Pontos</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-400" />
                        <p className="text-2xl font-light text-white">{teamData.wins}</p>
                        <p className="text-sm text-gray-400 font-light">Vitórias</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                      <CardContent className="p-4 text-center">
                        <Shield className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                        <p className="text-2xl font-light text-white">{teamData.draws}</p>
                        <p className="text-sm text-gray-400 font-light">Empates</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                      <CardContent className="p-4 text-center">
                        <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-400" />
                        <p className="text-2xl font-light text-white">{teamData.losses}</p>
                        <p className="text-sm text-gray-400 font-light">Derrotas</p>
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
                  <h2 className="font-light text-2xl md:text-3xl text-white mb-6 uppercase tracking-wide flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-[#8b5cf6] to-[#6366f1] rounded-full"></div>
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
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-6">
              <Shield className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-400 font-light">Selecione um time para ver os jogadores</p>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-light text-white tracking-tight">
              Avaliar {selectedPlayer?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400 font-light">
              Dê suas notas para as últimas partidas do jogador
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {isLoadingMatches ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : matches && matches.length > 0 ? (
              matches.map((match) => (
              <Card key={match.id} className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{match.opponent}</p>
                      <p className="text-sm text-gray-400 font-light">
                        {match.teamScore !== null && match.opponentScore !== null ? (
                          <>Placar: {match.teamScore}x{match.opponentScore} • </>
                        ) : null}
                        {format(new Date(match.matchDate), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 font-light">Nota (0-10)</Label>
                    <Slider
                      min={0}
                      max={10}
                      step={0.5}
                      value={[ratings[match.id]?.rating || 5]}
                      onValueChange={(value) => handleRatingChange(match.id, value)}
                      className="py-4"
                      data-testid={`slider-rating-${match.id}`}
                    />
                    <div className="text-center font-light text-3xl text-white">
                      {(ratings[match.id]?.rating || 5).toFixed(1)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 font-light">Comentário (opcional)</Label>
                    <Textarea
                      placeholder="Digite seu comentário sobre a atuação..."
                      maxLength={200}
                      value={ratings[match.id]?.comment || ''}
                      onChange={(e) => handleCommentChange(match.id, e.target.value)}
                      data-testid={`textarea-comment-${match.id}`}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
                    />
                    <p className="text-xs text-gray-400 text-right font-light">
                      {ratings[match.id]?.comment?.length || 0}/200 caracteres
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
            ) : (
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-400 font-light">Não há partidas recentes para avaliar</p>
                </CardContent>
              </Card>
            )}

            {matches && matches.length > 0 && (
              <Button 
                className="w-full font-medium bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-300 h-12" 
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
