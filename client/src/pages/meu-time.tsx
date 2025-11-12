import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { TEAMS_DATA } from '@/lib/team-data';
import { Trophy, Calendar, TrendingUp, BarChart3, Image as ImageIcon, Loader2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Team, Player, Match } from '@shared/schema';

export default function MeuTimePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [playerRatings, setPlayerRatings] = useState<Record<string, number>>({});
  const [pollVote, setPollVote] = useState<string | null>(null);

  // Get team data using user's teamId
  const { data: teamData, isLoading: isLoadingTeam } = useQuery<Team & { players: Player[] }>({
    queryKey: ['/api/teams', user?.teamId],
    queryFn: async () => {
      if (!user?.teamId) return null;
      const response = await fetch(`/api/teams/${user.teamId}`, {
        credentials: 'include',
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.teamId,
  });

  const teamFromData = teamData ? TEAMS_DATA.find(t => t.name === teamData.name) : null;

  // Get last match with lineup
  const { data: lastMatch, isLoading: isLoadingLastMatch } = useQuery<any>({
    queryKey: ['/api/teams', user?.teamId, 'last-match'],
    queryFn: async () => {
      if (!user?.teamId) return null;
      const response = await fetch(`/api/teams/${user.teamId}/last-match`, {
        credentials: 'include',
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.teamId,
  });

  // Get recent matches (last 5)
  const { data: recentMatches, isLoading: isLoadingRecent } = useQuery<Match[]>({
    queryKey: ['/api/matches', user?.teamId, 'recent'],
    queryFn: async () => {
      if (!user?.teamId) return [];
      const response = await fetch(`/api/matches/${user.teamId}/recent?limit=5`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.teamId,
  });

  // Get upcoming matches
  const { data: upcomingMatches, isLoading: isLoadingUpcoming } = useQuery<Match[]>({
    queryKey: ['/api/teams', user?.teamId, 'upcoming'],
    queryFn: async () => {
      if (!user?.teamId) return [];
      const response = await fetch(`/api/teams/${user.teamId}/upcoming?limit=3`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.teamId,
  });

  // Get standings
  const { data: standings, isLoading: isLoadingStandings } = useQuery<Team[]>({
    queryKey: ['/api/standings'],
    queryFn: async () => {
      const response = await fetch('/api/standings', {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async ({ playerId, matchId, rating }: { playerId: string; matchId: string; rating: number }) => {
      return await apiRequest('POST', `/api/players/${playerId}/ratings`, { matchId, rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', user?.teamId, 'last-match'] });
      toast({
        title: 'Avaliação salva!',
        description: 'Sua nota foi registrada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a avaliação',
      });
    },
  });

  const handleRatingChange = (playerId: string, value: number[]) => {
    setPlayerRatings(prev => ({ ...prev, [playerId]: value[0] }));
  };

  const handleSaveRating = async (playerId: string) => {
    if (!lastMatch || !playerRatings[playerId]) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione uma nota antes de salvar',
      });
      return;
    }

    await ratingMutation.mutateAsync({
      playerId,
      matchId: lastMatch.id,
      rating: playerRatings[playerId],
    });

    setSelectedPlayer(null);
    setPlayerRatings(prev => {
      const newRatings = { ...prev };
      delete newRatings[playerId];
      return newRatings;
    });
  };

  const teamPosition = standings?.findIndex(t => t.id === user?.teamId) ?? -1;
  const teamStanding = teamPosition >= 0 ? standings![teamPosition] : null;

  // Mock data for poll and meme
  const dailyPoll = {
    question: "Qual foi o melhor jogador do Corinthians no último jogo?",
    options: [
      { id: '1', text: 'Cássio', votes: 45 },
      { id: '2', text: 'Fagner', votes: 32 },
      { id: '3', text: 'Yuri Alberto', votes: 28 },
      { id: '4', text: 'Róger Guedes', votes: 15 },
    ],
    totalVotes: 120,
  };

  const memeImage = "https://via.placeholder.com/600x400/8b5cf6/ffffff?text=Meme+do+Corinthians";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
      <Navbar />

      <div className="container px-6 py-8 max-w-7xl">
        {/* Team Header */}
        {isLoadingTeam ? (
          <Skeleton className="h-48 rounded-2xl bg-white/5 mb-8" />
        ) : teamData && teamFromData ? (
          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 mb-8 border border-white/10 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-[#6366f1]/10 rounded-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative">
                <img
                  src={teamFromData.logoUrl}
                  alt={`Escudo ${teamData.name}`}
                  className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 to-[#6366f1]/20 rounded-full blur-2xl -z-10"></div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-light text-4xl md:text-5xl text-white mb-4 tracking-tight">
                  {teamData.name}
                </h1>
                {teamStanding && (
                  <Badge className="mb-6 bg-white/10 border-white/10 text-white/90 font-light text-sm">
                    {teamPosition + 1}º Lugar - {teamStanding.points} pontos
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
                      <BarChart3 className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                      <p className="text-2xl font-light text-white">{teamData.draws}</p>
                      <p className="text-sm text-gray-400 font-light">Empates</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-red-400 rotate-180" />
                      <p className="text-2xl font-light text-white">{teamData.losses}</p>
                      <p className="text-sm text-gray-400 font-light">Derrotas</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Last Match Lineup */}
            {isLoadingLastMatch ? (
              <Skeleton className="h-96 rounded-2xl bg-white/5" />
            ) : lastMatch ? (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-transparent to-[#6366f1]/5 rounded-2xl pointer-events-none"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-light text-white mb-2 tracking-tight">Escalação do Último Jogo</h2>
                      <p className="text-gray-400 font-light">
                        {lastMatch.opponent} • {format(new Date(lastMatch.matchDate), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      {lastMatch.teamScore !== null && lastMatch.opponentScore !== null && (
                        <p className="text-xl font-light text-white mt-2">
                          Corinthians {lastMatch.teamScore} x {lastMatch.opponentScore} {lastMatch.opponent}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {lastMatch.players
                      .filter((p: any) => p.wasStarter)
                      .map((player: any) => (
                        <div
                          key={player.id}
                          className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                {player.photoUrl ? (
                                  <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  <span className="text-gray-400 font-light">{player.jerseyNumber}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-light text-lg">{player.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {player.averageRating ? (
                                    <>
                                      <Star className="h-4 w-4 fill-[#8b5cf6] text-[#8b5cf6]" />
                                      <span className="text-sm text-gray-400 font-light">
                                        Média da torcida: {player.averageRating.toFixed(1)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm text-gray-500 font-light">Sem avaliações</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {selectedPlayer === player.id ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-32">
                                    <Slider
                                      min={0}
                                      max={10}
                                      step={0.5}
                                      value={[playerRatings[player.id] || player.userRating || 5]}
                                      onValueChange={(value) => handleRatingChange(player.id, value)}
                                      className="py-2"
                                    />
                                    <div className="text-center text-white font-light mt-1">
                                      {(playerRatings[player.id] || player.userRating || 5).toFixed(1)}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveRating(player.id)}
                                    disabled={ratingMutation.isPending}
                                    className="bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white border-0 font-light"
                                  >
                                    {ratingMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      'Salvar'
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedPlayer(null);
                                      setPlayerRatings(prev => {
                                        const newRatings = { ...prev };
                                        delete newRatings[player.id];
                                        return newRatings;
                                      });
                                    }}
                                    className="text-white/80 hover:text-white hover:bg-white/5 border-0 font-light"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPlayer(player.id);
                                    if (player.userRating) {
                                      setPlayerRatings(prev => ({ ...prev, [player.id]: player.userRating }));
                                    }
                                  }}
                                  className="bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20 font-light"
                                >
                                  {player.userRating ? `Sua nota: ${player.userRating.toFixed(1)}` : 'Avaliar'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400 font-light">Nenhum jogo recente encontrado</p>
                </CardContent>
              </Card>
            )}

            {/* Recent Matches */}
            {isLoadingRecent ? (
              <Skeleton className="h-64 rounded-2xl bg-white/5" />
            ) : recentMatches && recentMatches.length > 0 ? (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-transparent to-[#6366f1]/5 rounded-2xl pointer-events-none"></div>
                <CardContent className="p-6 relative z-10">
                  <h2 className="text-2xl font-light text-white mb-6 tracking-tight flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-[#8b5cf6] to-[#6366f1] rounded-full"></div>
                    Últimos 5 Jogos
                  </h2>
                  <div className="space-y-3">
                    {recentMatches.map((match) => (
                      <div
                        key={match.id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-white font-light">
                              {match.isHomeMatch ? teamData?.name : match.opponent} x {match.isHomeMatch ? match.opponent : teamData?.name}
                            </p>
                            <p className="text-sm text-gray-400 font-light mt-1">
                              {format(new Date(match.matchDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          {match.teamScore !== null && match.opponentScore !== null ? (
                            <div className="text-2xl font-light text-white">
                              {match.isHomeMatch ? match.teamScore : match.opponentScore} x {match.isHomeMatch ? match.opponentScore : match.teamScore}
                            </div>
                          ) : (
                            <Badge className="bg-white/10 border-white/10 text-white/90 font-light">Agendado</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Standings */}
            {isLoadingStandings ? (
              <Skeleton className="h-64 rounded-2xl bg-white/5" />
            ) : standings && standings.length > 0 ? (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-transparent to-[#6366f1]/5 rounded-2xl pointer-events-none"></div>
                <CardContent className="p-6 relative z-10">
                  <h2 className="text-xl font-light text-white mb-4 tracking-tight flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-[#8b5cf6]" />
                    Classificação
                  </h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {standings.slice(0, 10).map((team, index) => (
                      <div
                        key={team.id}
                        className={`flex items-center gap-3 p-2 rounded-lg ${
                          team.id === user?.teamId
                            ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-[#6366f1]/20 border border-[#8b5cf6]/30'
                            : 'bg-white/5 hover:bg-white/10'
                        } transition-all`}
                      >
                        <span className="text-sm font-light text-gray-400 w-6">{index + 1}º</span>
                        <img src={team.logoUrl} alt={team.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-sm font-light text-white flex-1 truncate">{team.shortName}</span>
                        <span className="text-sm font-light text-white">{team.points}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Upcoming Matches */}
            {isLoadingUpcoming ? (
              <Skeleton className="h-48 rounded-2xl bg-white/5" />
            ) : upcomingMatches && upcomingMatches.length > 0 ? (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-transparent to-[#6366f1]/5 rounded-2xl pointer-events-none"></div>
                <CardContent className="p-6 relative z-10">
                  <h2 className="text-xl font-light text-white mb-4 tracking-tight flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-[#8b5cf6]" />
                    Próximos Jogos
                  </h2>
                  <div className="space-y-3">
                    {upcomingMatches.map((match) => (
                      <div
                        key={match.id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                      >
                        <p className="text-white font-light text-sm mb-1">
                          {match.isHomeMatch ? teamData?.name : match.opponent} x {match.isHomeMatch ? match.opponent : teamData?.name}
                        </p>
                        <p className="text-xs text-gray-400 font-light">
                          {format(new Date(match.matchDate), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Daily Poll */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-transparent to-[#6366f1]/5 rounded-2xl pointer-events-none"></div>
              <CardContent className="p-6 relative z-10">
                <h2 className="text-xl font-light text-white mb-4 tracking-tight flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-[#8b5cf6]" />
                  Enquete do Dia
                </h2>
                <p className="text-sm text-gray-300 font-light mb-4">
                  {teamData ? dailyPoll.question.replace('Corinthians', teamData.name) : dailyPoll.question}
                </p>
                <div className="space-y-2">
                  {dailyPoll.options.map((option) => {
                    const percentage = (option.votes / dailyPoll.totalVotes) * 100;
                    return (
                      <div key={option.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/80 font-light">{option.text}</span>
                          <span className="text-gray-400 font-light">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Meme Section */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-transparent to-[#6366f1]/5 rounded-2xl pointer-events-none"></div>
              <CardContent className="p-0 relative z-10">
                <div className="p-4 flex items-center gap-3 border-b border-white/10">
                  <ImageIcon className="h-5 w-5 text-[#8b5cf6]" />
                  <h2 className="text-xl font-light text-white tracking-tight">Meme do Dia</h2>
                </div>
                <div className="aspect-video bg-white/5 flex items-center justify-center">
                  <img
                    src={memeImage}
                    alt={`Meme do ${teamData?.name || 'Time'}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
