import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { NewsCard } from '@/components/news-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { TEAMS_DATA } from '@/lib/team-data';
import type { News } from '@shared/schema';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>('my-team');

  const { data: newsData, isLoading } = useQuery<News[]>({
    queryKey: ['/api/news', activeFilter, user?.teamId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('filter', activeFilter);
      
      if (activeFilter !== 'my-team' && activeFilter !== 'all') {
        params.append('teamId', activeFilter);
      }
      
      const response = await fetch(`/api/news?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      return response.json();
    },
    enabled: !!user,
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

  const filters = [
    { id: 'my-team', label: 'Meu Time', testId: 'filter-my-team', isText: true },
    { id: 'all', label: 'Todos', testId: 'filter-all', isText: true },
    ...TEAMS_DATA.slice(0, 5).map(team => ({
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

      {/* Filter Bar */}
      <div className="sticky top-16 z-40 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="container px-6 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-center">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={`font-light transition-all duration-300 ${
                  filter.isText 
                    ? 'whitespace-nowrap px-4' 
                    : 'w-12 h-12 p-0 flex items-center justify-center'
                } ${
                  activeFilter === filter.id
                    ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white border-0 shadow-lg shadow-purple-500/20'
                    : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
                data-testid={filter.testId}
              >
                {filter.isText ? (
                  filter.label
                ) : (
                  <img 
                    src={filter.logoUrl} 
                    alt={filter.label}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="container px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-[400px] rounded-2xl bg-white/5" />
                </div>
              ))}
            </>
          ) : newsData && newsData.length > 0 ? (
            newsData.map((news: any) => (
              <NewsCard
                key={news.id}
                news={news}
                canInteract={news.team.id === user?.teamId}
                onInteract={handleInteraction}
              />
            ))
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-6">
                <span className="text-4xl">📰</span>
              </div>
              <h3 className="font-light text-2xl text-white mb-3 tracking-tight">
                Nenhuma notícia ainda
              </h3>
              <p className="text-gray-400 font-light">
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
  );
}
