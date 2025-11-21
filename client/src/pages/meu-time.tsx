import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TEAMS_DATA } from '@/lib/team-data';
import { resolveApiUrl } from '@/lib/api';
import { 
  Trophy, 
  Calendar, 
  MessageSquare, 
  Newspaper, 
  Clock, 
  MapPin,
  ChevronRight,
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Users,
  TrendingUp,
  Star
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Team, Match, News } from '@shared/schema';

export default function MeuTimePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Poll states
  const [escalacaoVote, setEscalacaoVote] = useState<string | null>(null);
  const [contratacaoVote, setContratacaoVote] = useState<string | null>(null);

  // Mock poll data
  const escalacaoPoll = {
    question: "Qual deve ser a escalação do próximo jogo?",
    options: [
      { id: '1', text: 'Manter o time titular', votes: 45, percentage: 45 },
      { id: '2', text: 'Rodar o elenco', votes: 30, percentage: 30 },
      { id: '3', text: 'Testar novos jogadores', votes: 25, percentage: 25 },
    ],
    totalVotes: 100
  };

  const contratacaoPoll = {
    question: "Qual área precisa de reforço?",
    options: [
      { id: '1', text: 'Atacante', votes: 52, percentage: 52 },
      { id: '2', text: 'Meio-campo', votes: 28, percentage: 28 },
      { id: '3', text: 'Defesa', votes: 20, percentage: 20 },
    ],
    totalVotes: 100
  };

  // Get team data
  const { data: teamData, isLoading: isLoadingTeam } = useQuery<Team & { players: any[] }>({
    queryKey: ['/api/teams', user?.teamId],
    queryFn: async () => {
      if (!user?.teamId) return null;
      const response = await fetch(resolveApiUrl(`/api/teams/${user.teamId}`), {
        credentials: 'include',
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.teamId,
  });

  const teamFromData = teamData ? TEAMS_DATA.find(t => t.name === teamData.name) : null;

  // Get team news (latest 5)
  const { data: teamNews, isLoading: isLoadingNews } = useQuery<News[]>({
    queryKey: ['/api/news', user?.teamId, 'team-news'],
    queryFn: async () => {
      if (!user?.teamId) return [];
      const response = await fetch(resolveApiUrl(`/api/news?teamId=${user.teamId}&limit=5`), {
        credentials: 'include',
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data || [];
    },
    enabled: !!user?.teamId,
  });

  // Get upcoming matches
  const { data: upcomingMatches, isLoading: isLoadingUpcoming } = useQuery<Match[]>({
    queryKey: ['/api/teams', user?.teamId, 'upcoming'],
    queryFn: async () => {
      if (!user?.teamId) return [];
      const response = await fetch(resolveApiUrl(`/api/teams/${user.teamId}/upcoming?limit=10`), {
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
      const response = await fetch(resolveApiUrl('/api/standings'), {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Get recent matches for fixture schedule
  const { data: recentMatches, isLoading: isLoadingRecent } = useQuery<Match[]>({
    queryKey: ['/api/matches', user?.teamId, 'recent'],
    queryFn: async () => {
      if (!user?.teamId) return [];
      const response = await fetch(resolveApiUrl(`/api/matches/${user.teamId}/recent?limit=10`), {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.teamId,
  });

  const teamPosition = standings?.findIndex(t => t.id === user?.teamId) ?? -1;
  const nextMatch = upcomingMatches && upcomingMatches.length > 0 ? upcomingMatches[0] : null;

  // Mock messages/updates (can be replaced with real API later)
  const messages = [
    {
      id: '1',
      type: 'info',
      sender: 'Diretoria',
      subject: 'Atualização de Contratações',
      time: '2 horas atrás',
      icon: Info,
      color: 'text-blue-400',
    },
    {
      id: '2',
      type: 'success',
      sender: 'Comissão Técnica',
      subject: 'Relatório de Treinamento Semanal',
      time: '5 horas atrás',
      icon: CheckCircle2,
      color: 'text-green-400',
    },
    {
      id: '3',
      type: 'alert',
      sender: 'Médico',
      subject: 'Atualização de Lesões',
      time: '1 dia atrás',
      icon: AlertCircle,
      color: 'text-yellow-400',
    },
  ];

  // Calendar data
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Combine recent and upcoming matches for calendar
  const allMatches = [
    ...(recentMatches || []).map(m => ({ ...m, isPast: true })),
    ...(upcomingMatches || []).map(m => ({ ...m, isPast: false })),
  ].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

  if (!user?.teamId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
        <Navbar />
        <div className="container px-6 py-20 text-center">
          <p className="text-gray-400 font-light">Selecione um time para ver esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
      <Navbar />

      <div className="container px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-[1600px]">
        {/* Header with Team Info */}
        {isLoadingTeam ? (
          <Skeleton className="h-20 sm:h-24 rounded-xl bg-white/5 mb-4 sm:mb-6" />
        ) : teamData && teamFromData ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/10">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <img
                src={teamFromData.logoUrl}
                alt={teamData.name}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full object-contain flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-light text-white tracking-tight truncate">
                  {teamData.name}
                </h1>
                {teamPosition >= 0 && standings && (
                  <p className="text-xs sm:text-sm text-gray-400 font-light">
                    {teamPosition + 1}º lugar na Série A • {standings[teamPosition]?.points || 0} pontos
                  </p>
                )}
              </div>
            </div>
            <Badge className="bg-white/10 border-white/10 text-white/90 font-light text-xs sm:text-sm self-start sm:self-center">
              {format(today, "dd 'de' MMMM", { locale: ptBR })}
            </Badge>
          </div>
        ) : null}

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* LEFT COLUMN - Messages */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-light text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#8b5cf6]" />
                    Mensagens
                  </h2>
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 text-xs font-light">
                    {messages.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {messages.map((msg) => {
                    const Icon = msg.icon;
                    return (
                      <div
                        key={msg.id}
                        className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`h-4 w-4 ${msg.color} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 font-light mb-1">{msg.sender}</p>
                            <p className="text-sm text-white font-light truncate group-hover:text-white/90">
                              {msg.subject}
                            </p>
                            <p className="text-xs text-gray-500 font-light mt-1">{msg.time}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-3 text-white/60 hover:text-white hover:bg-white/5 border-0 font-light text-sm"
                >
                  Ver todas as mensagens
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* CENTER COLUMN - News & Next Match */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4 order-1 lg:order-2">
            {/* Most Important News of the Day */}
            {isLoadingNews ? (
              <Skeleton className="h-48 rounded-xl bg-white/5" />
            ) : teamNews && teamNews.length > 0 ? (
              <Card className="bg-gradient-to-br from-[#8b5cf6]/20 via-[#6366f1]/10 to-transparent backdrop-blur-xl border border-[#8b5cf6]/30 rounded-xl shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#8b5cf6]" />
                    <h2 className="text-lg font-light text-white">
                      Notícia Mais Importante do Dia
                    </h2>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {(() => {
                    const mostImportantNews = teamNews[0];
                    return (
                      <div className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                        <div className="flex items-start gap-3">
                          {mostImportantNews.imageUrl && (
                            <img
                              src={mostImportantNews.imageUrl}
                              alt={mostImportantNews.title}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white mb-1 line-clamp-2 group-hover:text-white/90">
                              {mostImportantNews.title}
                            </h3>
                            <p className="text-xs text-gray-400 font-light line-clamp-2">
                              {mostImportantNews.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-xs text-gray-500 font-light">
                                {mostImportantNews.journalist?.user?.name || (mostImportantNews as any).author?.name || 'Autor'}
                              </p>
                              <span className="text-gray-600">•</span>
                              <p className="text-xs text-gray-500 font-light">
                                {format(new Date(mostImportantNews.publishedAt), "dd 'de' MMM", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            ) : null}

            {/* Escalation Poll */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#8b5cf6]" />
                  <h2 className="text-lg font-light text-white">Enquete</h2>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-white font-light mb-4">{escalacaoPoll.question}</p>
                <RadioGroup
                  value={escalacaoVote || undefined}
                  onValueChange={(value) => {
                    setEscalacaoVote(value);
                    toast({
                      title: "Voto registrado!",
                      description: "Sua opinião foi registrada.",
                    });
                  }}
                  className="space-y-3"
                >
                  {escalacaoPoll.options.map((option) => {
                    return (
                      <div key={option.id} className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value={option.id}
                            id={`escalacao-${option.id}`}
                            className="border-white/20 data-[state=checked]:border-[#8b5cf6]"
                          />
                          <Label
                            htmlFor={`escalacao-${option.id}`}
                            className="text-sm text-white font-light cursor-pointer flex-1"
                          >
                            {option.text}
                          </Label>
                          {escalacaoVote && (
                            <span className="text-xs text-gray-400 font-light">
                              {option.percentage}%
                            </span>
                          )}
                        </div>
                        {escalacaoVote && (
                          <div className="relative">
                            <Progress
                              value={option.percentage}
                              className="h-2 bg-white/5 [&>div]:bg-[#8b5cf6]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
                {escalacaoVote && (
                  <p className="text-xs text-gray-500 font-light mt-3">
                    {escalacaoPoll.totalVotes} votos no total
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contract Poll */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#8b5cf6]" />
                  <h2 className="text-lg font-light text-white">Enquete</h2>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-white font-light mb-4">{contratacaoPoll.question}</p>
                <RadioGroup
                  value={contratacaoVote || undefined}
                  onValueChange={(value) => {
                    setContratacaoVote(value);
                    toast({
                      title: "Voto registrado!",
                      description: "Sua opinião foi registrada.",
                    });
                  }}
                  className="space-y-3"
                >
                  {contratacaoPoll.options.map((option) => {
                    return (
                      <div key={option.id} className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value={option.id}
                            id={`contratacao-${option.id}`}
                            className="border-white/20 data-[state=checked]:border-[#8b5cf6]"
                          />
                          <Label
                            htmlFor={`contratacao-${option.id}`}
                            className="text-sm text-white font-light cursor-pointer flex-1"
                          >
                            {option.text}
                          </Label>
                          {contratacaoVote && (
                            <span className="text-xs text-gray-400 font-light">
                              {option.percentage}%
                            </span>
                          )}
                        </div>
                        {contratacaoVote && (
                          <div className="relative">
                            <Progress
                              value={option.percentage}
                              className="h-2 bg-white/5 [&>div]:bg-[#8b5cf6]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
                {contratacaoVote && (
                  <p className="text-xs text-gray-500 font-light mt-3">
                    {contratacaoPoll.totalVotes} votos no total
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Next Match Highlight */}
            {isLoadingUpcoming ? (
              <Skeleton className="h-40 sm:h-48 rounded-xl bg-white/5" />
            ) : nextMatch ? (
              <Card className="bg-gradient-to-br from-[#8b5cf6]/20 via-[#6366f1]/10 to-transparent backdrop-blur-xl border border-[#8b5cf6]/30 rounded-xl shadow-xl">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-light mb-1">Próximo Jogo</p>
                      <h3 className="text-lg sm:text-xl font-light text-white mb-2 break-words">
                        {nextMatch.isHomeMatch ? teamData?.name : nextMatch.opponent} x{' '}
                        {nextMatch.isHomeMatch ? nextMatch.opponent : teamData?.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 font-light">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">{format(new Date(nextMatch.matchDate), "dd 'de' MMMM", { locale: ptBR })}</span>
                          <span className="sm:hidden">{format(new Date(nextMatch.matchDate), "dd/MM", { locale: ptBR })}</span>
                        </div>
                        {nextMatch.stadium && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate max-w-[120px] sm:max-w-none">{nextMatch.stadium}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          {format(new Date(nextMatch.matchDate), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                    {nextMatch.isHomeMatch && teamFromData ? (
                      <img
                        src={teamFromData.logoUrl}
                        alt={teamData?.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-contain flex-shrink-0"
                      />
                    ) : null}
                  </div>
                  <Badge className="bg-white/10 border-white/20 text-white/90 font-light text-xs sm:text-sm">
                    {nextMatch.isHomeMatch ? 'Em Casa' : 'Fora'}
                  </Badge>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* RIGHT COLUMN - Fixture Schedule & Standings */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-4 order-3">
            {/* Fixture Schedule */}
            {isLoadingRecent || isLoadingUpcoming ? (
              <Skeleton className="h-64 rounded-xl bg-white/5" />
            ) : allMatches && allMatches.length > 0 ? (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl">
                <CardHeader className="pb-3">
                  <h2 className="text-lg font-light text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#8b5cf6]" />
                    Calendário de Jogos
                  </h2>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allMatches.slice(0, 8).map((match) => {
                      const matchDate = new Date(match.matchDate);
                      const isHome = match.isHomeMatch;
                      const hasScore = match.teamScore !== null && match.opponentScore !== null;
                      
                      return (
                        <div
                          key={match.id}
                          className={`p-3 rounded-lg border transition-all ${
                            isToday(matchDate)
                              ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-[#6366f1]/20 border-[#8b5cf6]/30'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-gray-400 font-light">
                              {format(matchDate, "EEE dd/MM", { locale: ptBR })}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs font-light ${
                                isHome
                                  ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                  : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                              }`}
                            >
                              {isHome ? 'C' : 'F'}
                            </Badge>
                          </div>
                          <p className="text-sm text-white font-light truncate mb-1">
                            {isHome ? teamData?.name : match.opponent} x{' '}
                            {isHome ? match.opponent : teamData?.name}
                          </p>
                          {hasScore ? (
                            <p className="text-xs text-gray-400 font-light">
                              {isHome ? match.teamScore : match.opponentScore} x{' '}
                              {isHome ? match.opponentScore : match.teamScore}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 font-light">
                              {format(matchDate, 'HH:mm')}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Standings */}
            {isLoadingStandings ? (
              <Skeleton className="h-64 rounded-xl bg-white/5" />
            ) : standings && standings.length > 0 ? (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl">
                <CardHeader className="pb-3">
                  <h2 className="text-lg font-light text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-[#8b5cf6]" />
                    Classificação
                  </h2>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {standings.slice(0, 13).map((team, index) => {
                      const isUserTeam = team.id === user?.teamId;
                      return (
                        <div
                          key={team.id}
                          className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                            isUserTeam
                              ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-[#6366f1]/20 border border-[#8b5cf6]/30'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <span className="text-xs font-light text-gray-400 w-6">
                            {index + 1}º
                          </span>
                          <img
                            src={team.logoUrl}
                            alt={team.name}
                            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                          />
                          <span
                            className={`text-xs font-light flex-1 truncate ${
                              isUserTeam ? 'text-white' : 'text-gray-300'
                            }`}
                          >
                            {team.shortName}
                          </span>
                          <span
                            className={`text-xs font-light ${
                              isUserTeam ? 'text-white' : 'text-gray-400'
                            }`}
                          >
                            {team.points}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>

        {/* Calendar Section (Bottom) */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <h2 className="text-base sm:text-lg font-light text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#8b5cf6]" />
              <span className="hidden sm:inline">Calendário {format(today, 'MMMM yyyy', { locale: ptBR })}</span>
              <span className="sm:hidden">Calendário {format(today, 'MMM yyyy', { locale: ptBR })}</span>
            </h2>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-[10px] sm:text-xs text-gray-400 font-light py-1 sm:py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {daysInMonth.map((day) => {
                const dayMatches = allMatches.filter((match) => {
                  const matchDate = new Date(match.matchDate);
                  return (
                    matchDate.getDate() === day.getDate() &&
                    matchDate.getMonth() === day.getMonth() &&
                    matchDate.getFullYear() === day.getFullYear()
                  );
                });

                const isCurrentDay = isToday(day);
                const isPastDay = isPast(day) && !isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={`aspect-square p-1 rounded-lg border transition-all ${
                      isCurrentDay
                        ? 'bg-gradient-to-br from-[#8b5cf6]/30 to-[#6366f1]/30 border-[#8b5cf6]/50'
                        : isPastDay
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <span
                        className={`text-xs font-light mb-1 ${
                          isCurrentDay ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      {dayMatches.length > 0 && (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#8b5cf6]"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
