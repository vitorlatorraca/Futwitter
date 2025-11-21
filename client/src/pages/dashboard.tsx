import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { NewsCard } from '@/components/news-card';
import { VideoNewsCard } from '@/components/video-news-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { resolveApiUrl } from '@/lib/api';
import { TEAMS_DATA } from '@/lib/team-data';
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
    cacheTime: 0, // Don't cache
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
    if (newsData) {
      console.log('[Dashboard] newsData changed:', newsData);
      console.log('[Dashboard] newsData length:', newsData.length);
      if (newsData.length > 0) {
        console.log('[Dashboard] First news item:', newsData[0]);
        console.log('[Dashboard] First news team:', newsData[0]?.team);
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

  const filters = [
    { id: 'my-team', label: 'Meu Time', testId: 'filter-my-team', isText: true },
    { id: 'all', label: 'Todos', testId: 'filter-all', isText: true },
    ...TEAMS_DATA.map(team => ({
      id: team.id,
      label: team.shortName,
      logoUrl: team.logoUrl,
      testId: `filter-team-${team.id}`,
      isText: false,
    })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
      <Navbar />

      {/* Filter Bar - Ultra Minimalista Mobile */}
      <div className="sticky top-12 sm:top-14 z-40 bg-black/10 backdrop-blur-md border-b border-white/5">
        <div className="container px-2 sm:px-3 md:px-6 py-1.5 sm:py-2">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide -mx-2 sm:-mx-3 md:mx-0 px-2 sm:px-3 md:px-0">
            {/* Content Type Filter - Ultra minimalista mobile */}
            <div className="flex items-center gap-0.5 sm:gap-1 border-r border-white/5 pr-2 sm:pr-3 md:pr-4 flex-shrink-0">
              <button
                onClick={() => setContentTypeFilter('ALL')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-light transition-all ${
                  contentTypeFilter === 'ALL'
                    ? 'text-white'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setContentTypeFilter('TEXT')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-light transition-all ${
                  contentTypeFilter === 'TEXT'
                    ? 'text-white'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                Texto
              </button>
              <button
                onClick={() => setContentTypeFilter('VIDEO')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-light transition-all ${
                  contentTypeFilter === 'VIDEO'
                    ? 'text-white'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                Vídeo
              </button>
            </div>
            
            {/* Team Filter - Ultra minimalista mobile */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`group relative flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    filter.isText 
                      ? 'px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-light' 
                      : 'w-7 h-7 sm:w-8 sm:h-8'
                  } ${
                    activeFilter === filter.id
                      ? 'text-white'
                      : 'text-white/25 hover:text-white/50'
                  }`}
                  data-testid={filter.testId}
                  title={filter.isText ? filter.label : filter.label}
                >
                  {filter.isText ? (
                    <span className={activeFilter === filter.id ? 'font-medium' : 'font-light'}>
                      {filter.label}
                    </span>
                  ) : (
                    <>
                      {/* Mostrar apenas texto por padrão no mobile */}
                      <span className="text-[9px] sm:text-[10px] font-light group-hover:opacity-0 transition-opacity">
                        {filter.label}
                      </span>
                      {/* Logo aparece apenas no hover (desktop) */}
                      <div className="absolute inset-0 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <TeamLogo 
                          logoUrl={(filter as any).logoUrl}
                          shortName={filter.label}
                        />
                      </div>
                    </>
                  )}
                  {/* Indicador ativo sutil */}
                  {activeFilter === filter.id && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-white"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* News Feed - Full Width Grid - Mobile First */}
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 md:py-8">
        <div className="max-w-[1920px] mx-auto">
          {/* Grid responsivo: 1 coluna mobile, 2 tablet, 3 desktop, 4 xl */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
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
