import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { NewsCard } from '@/components/news-card';
import { VideoNewsCard } from '@/components/video-news-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { resolveApiUrl } from '@/lib/api';
import { TEAMS_DATA } from '@/lib/team-data';
import { ChevronDown, Shield, Users } from 'lucide-react';
import type { News } from '@shared/schema';

// Team Logo Component with fallback - Minimalista
function TeamLogo({ logoUrl, shortName }: { logoUrl: string; shortName: string }) {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(logoUrl);

  return (
    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
      {!imgError ? (
        <img 
          src={imgSrc} 
          alt={shortName}
          className="w-full h-full object-cover"
          onError={() => {
            setImgError(true);
            // Try alternative URL format
            const altUrl = logoUrl.replace('logodownload.org', 'escudos.club').replace('/2017/02/', '/2020/01/').replace('-logo-escudo-1.png', '.png');
            if (altUrl !== imgSrc) {
              setImgSrc(altUrl);
              setImgError(false);
            }
          }}
          loading="lazy"
        />
      ) : (
        <span className="text-[9px] sm:text-[10px] font-medium text-white/80">{shortName}</span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>('my-team');
  const [contentTypeFilter, setContentTypeFilter] = useState<'ALL' | 'TEXT' | 'VIDEO'>('ALL');

  const { data: newsData, isLoading, error, refetch } = useQuery<News[]>({
    queryKey: ['/api/news', activeFilter, contentTypeFilter, user?.teamId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append('filter', activeFilter);
        
        if (activeFilter !== 'my-team' && activeFilter !== 'all') {
          params.append('teamId', activeFilter);
        }
        
        const url = `/api/news?${params.toString()}`;
        console.log('[Dashboard] Fetching from URL:', url);
        console.log('[Dashboard] User:', user);
        console.log('[Dashboard] Active filter:', activeFilter);
        
        const response = await fetch(resolveApiUrl(url), {
          credentials: 'include',
        });
        
        console.log('[Dashboard] Response status:', response.status);
        console.log('[Dashboard] Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Dashboard] Response error:', errorText);
          throw new Error(`Failed to fetch news: ${response.status} ${errorText}`);
        }
        
        let data = await response.json();
        console.log('[Dashboard] Fetched news:', data);
        console.log('[Dashboard] News count:', data?.length);
        console.log('[Dashboard] Is array:', Array.isArray(data));
        console.log('[Dashboard] User teamId:', user?.teamId);
        console.log('[Dashboard] Active filter:', activeFilter);
        console.log('[Dashboard] Content type filter:', contentTypeFilter);
        
        // Filtrar por tipo de conteúdo no frontend
        if (contentTypeFilter !== 'ALL' && Array.isArray(data)) {
          data = data.filter((item: any) => {
            const itemContentType = item.contentType || 'TEXT'; // Fallback para TEXT se não existir
            return itemContentType === contentTypeFilter;
          });
        }
        
        if (data && data.length > 0) {
          console.log('[Dashboard] First news item structure:', {
            id: data[0].id,
            hasTeam: !!data[0].team,
            teamId: data[0].team?.id,
            teamName: data[0].team?.name,
            hasJournalist: !!data[0].journalist,
            hasAuthor: !!(data[0] as any).author,
            contentType: data[0].contentType,
          });
        }
        
        return data || [];
      } catch (err: any) {
        console.error('[Dashboard] Query error:', err);
        throw err;
      }
    },
    enabled: !!user,
    staleTime: 0, // Force refetch every time
    gcTime: 0, // Don't cache (renamed from cacheTime in v5)
  });

  const interactionMutation = useMutation({
    mutationFn: async ({ newsId, type }: { newsId: string; type: 'LIKE' | 'DISLIKE' }) => {
      return await apiRequest('POST', `/api/news/${newsId}/interaction`, { type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível registrar sua interação',
      });
    },
  });

  const handleInteraction = (newsId: string, type: 'LIKE' | 'DISLIKE') => {
    interactionMutation.mutate({ newsId, type });
  };

  // Debug: Log data when it changes
  useEffect(() => {
    if (newsData && Array.isArray(newsData)) {
      console.log('[Dashboard] newsData changed:', newsData);
      console.log('[Dashboard] newsData length:', newsData.length);
      if (newsData.length > 0) {
        console.log('[Dashboard] First news item:', newsData[0]);
        console.log('[Dashboard] First news team:', (newsData[0] as any)?.team);
      }
    }
  }, [newsData]);

  // Force refetch when filter or user changes
  useEffect(() => {
    if (user) {
      console.log('[Dashboard] Invalidating queries due to filter/user change');
      queryClient.invalidateQueries({ queryKey: ['/api/news'], exact: false });
      refetch();
    }
  }, [activeFilter, contentTypeFilter, user?.teamId, queryClient, user, refetch]);

  // Get selected team name for dropdown display
  const getSelectedTeamName = () => {
    if (activeFilter === 'my-team') return 'My Team';
    if (activeFilter === 'all') return 'All Teams';
    const team = TEAMS_DATA.find(t => t.id === activeFilter);
    return team?.shortName || 'Select Team';
  };

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      <Navbar />

      {/* Filter Bar - Text only, no boxes */}
      <div className="sticky top-14 sm:top-16 z-40 bg-[var(--theme-background)]/95 backdrop-blur-md">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Content Type Filter - Text only */}
            <div className="flex items-center gap-4 sm:gap-6">
              <motion.button
                onClick={() => setContentTypeFilter('ALL')}
                className={`text-sm font-semibold transition-colors ${
                  contentTypeFilter === 'ALL'
                    ? 'text-[var(--theme-primary)]'
                    : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                }`}
                whileHover={{ x: [0, -1, 1, -1, 0] }}
                transition={{ duration: 0.3 }}
              >
                All
              </motion.button>
              <motion.button
                onClick={() => setContentTypeFilter('TEXT')}
                className={`text-sm font-semibold transition-colors ${
                  contentTypeFilter === 'TEXT'
                    ? 'text-[var(--theme-primary)]'
                    : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                }`}
                whileHover={{ x: [0, -1, 1, -1, 0] }}
                transition={{ duration: 0.3 }}
              >
                News
              </motion.button>
              <motion.button
                onClick={() => setContentTypeFilter('VIDEO')}
                className={`text-sm font-semibold transition-colors ${
                  contentTypeFilter === 'VIDEO'
                    ? 'text-[var(--theme-primary)]'
                    : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                }`}
                whileHover={{ x: [0, -1, 1, -1, 0] }}
                transition={{ duration: 0.3 }}
              >
                Video
              </motion.button>
            </div>

            {/* Team Filter - Just the logo */}
            <div className="flex items-center gap-3">
              {/* User's Team - Just the logo, no background */}
              {(() => {
                const userTeam = TEAMS_DATA.find(t => t.id === user?.teamId);
                return (
                  <motion.button
                    onClick={() => setActiveFilter('my-team')}
                    className="flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    data-testid="filter-my-team"
                    title={userTeam ? userTeam.name : 'My Team'}
                  >
                    {userTeam ? (
                      <img 
                        src={userTeam.logoUrl} 
                        alt={userTeam.name}
                        className={`w-7 h-7 sm:w-8 sm:h-8 object-contain transition-opacity ${
                          activeFilter === 'my-team' ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                        }`}
                      />
                    ) : (
                      <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-[var(--theme-text-muted)]" />
                    )}
                  </motion.button>
                );
              })()}

              {/* Teams Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-light transition-all ${
                      activeFilter !== 'my-team'
                        ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="max-w-[60px] sm:max-w-[80px] truncate">
                      {activeFilter === 'my-team' ? 'Teams' : getSelectedTeamName()}
                    </span>
                    <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 sm:w-56 bg-[#0f0f0f] border-white/10 max-h-[300px] overflow-y-auto"
                >
                  <DropdownMenuItem
                    onClick={() => setActiveFilter('all')}
                    className={`flex items-center gap-2 cursor-pointer ${
                      activeFilter === 'all' ? 'bg-white/10 text-white' : 'text-white/70'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>All Teams</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {TEAMS_DATA.map((team) => (
                    <DropdownMenuItem
                      key={team.id}
                      onClick={() => setActiveFilter(team.id)}
                      className={`flex items-center gap-2 cursor-pointer ${
                        activeFilter === team.id ? 'bg-white/10 text-white' : 'text-white/70'
                      }`}
                      data-testid={`filter-team-${team.id}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img 
                          src={team.logoUrl} 
                          alt={team.name}
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="truncate">{team.name}</span>
                      <span className="ml-auto text-[10px] text-white/40">{team.shortName}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* News Feed - Full Width Grid - Mobile First */}
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 md:py-8">
        <div className={`mx-auto ${contentTypeFilter === 'VIDEO' ? 'max-w-[900px]' : 'max-w-[1920px]'}`}>
          {/* Grid responsivo: 
              - Video: 1 coluna até lg, 2 colunas no desktop
              - Text/All: 1 mobile, 2 tablet, 3 desktop, 4 xl 
          */}
          <div className={`grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 ${
            contentTypeFilter === 'VIDEO' 
              ? 'grid-cols-1 lg:grid-cols-2' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-[500px] rounded-xl bg-white/3" />
                ))}
              </>
            ) : error ? (
              <div className="col-span-full text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="font-light text-xl text-white/90 mb-2 tracking-tight">
                  Erro ao carregar notícias
                </h3>
                <p className="text-sm text-white/40 font-light">
                  {(error as Error).message || 'Ocorreu um erro ao buscar as notícias'}
                </p>
              </div>
            ) : newsData ? (
              (() => {
                console.log('[Dashboard] newsData exists, type:', typeof newsData, 'isArray:', Array.isArray(newsData));
                
                if (!Array.isArray(newsData)) {
                  console.error('[Dashboard] newsData is not an array:', newsData);
                  return (
                    <div className="col-span-full text-center py-20">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                        <span className="text-3xl">❌</span>
                      </div>
                      <h3 className="font-light text-xl text-white/90 mb-2 tracking-tight">
                        Erro de dados
                      </h3>
                      <p className="text-sm text-white/40 font-light">
                        Os dados retornados não são um array. Tipo: {typeof newsData}
                      </p>
                    </div>
                  );
                }
                
                if (newsData.length === 0) {
                  console.log('[Dashboard] newsData is empty array');
                  return (
                    <div className="col-span-full text-center py-20">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                        <span className="text-3xl">📰</span>
                      </div>
                      <h3 className="font-light text-xl text-white/90 mb-2 tracking-tight">
                        Nenhuma notícia ainda
                      </h3>
                      <p className="text-sm text-white/40 font-light">
                        {activeFilter === 'my-team' 
                          ? 'Não há notícias do seu time no momento'
                          : 'Não há notícias disponíveis no momento'
                        }
                      </p>
                    </div>
                  );
                }
                
                const validNews = newsData.filter((news: any) => {
                  // Filter out any null or invalid news items
                  if (!news || !news.id) {
                    console.warn('[Dashboard] News missing id:', news);
                    return false;
                  }
                  if (!news.team) {
                    console.warn('[Dashboard] News missing team:', news.id, news);
                    return false;
                  }
                  if (!news.team.id) {
                    console.warn('[Dashboard] News team missing id:', news.id, news.team);
                    return false;
                  }
                  return true;
                });
                
                console.log('[Dashboard] Valid news count:', validNews.length, 'out of', newsData.length);
                
                if (validNews.length === 0) {
                  return (
                    <div className="col-span-full text-center py-20">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4">
                        <span className="text-3xl">⚠️</span>
                      </div>
                      <h3 className="font-light text-xl text-white/90 mb-2 tracking-tight">
                        Dados inválidos
                      </h3>
                      <p className="text-sm text-white/40 font-light">
                        {newsData.length} notícias retornadas, mas nenhuma tem a estrutura válida.
                      </p>
                    </div>
                  );
                }
                
                console.log('[Dashboard] Rendering', validNews.length, 'news items');
                
                return validNews.map((news: any) => {
                  console.log('[Dashboard] Rendering news:', {
                    id: news.id,
                    title: news.title,
                    teamId: news.team?.id,
                    teamName: news.team?.name,
                    userTeamId: user?.teamId,
                    canInteract: news.team?.id === user?.teamId,
                    contentType: news.contentType,
                  });
                  
                // Renderizar VideoNewsCard se for vídeo, caso contrário NewsCard
                const contentType = news.contentType || 'TEXT'; // Fallback para TEXT
                if (contentType === 'VIDEO' && news.videoUrl) {
                  return (
                    <VideoNewsCard
                      key={news.id}
                      news={news}
                      canInteract={news.team?.id === user?.teamId}
                      onInteract={handleInteraction}
                    />
                  );
                }
                
                return (
                  <NewsCard
                    key={news.id}
                    news={news}
                    canInteract={news.team?.id === user?.teamId}
                    onInteract={handleInteraction}
                  />
                );
                });
              })()
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                  <span className="text-3xl">📰</span>
                </div>
                <h3 className="font-light text-xl text-white/90 mb-2 tracking-tight">
                  Nenhuma notícia ainda
                </h3>
                <p className="text-sm text-white/40 font-light">
                  {activeFilter === 'my-team' 
                    ? 'Não há notícias do seu time no momento'
                    : 'Não há notícias disponíveis no momento'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
