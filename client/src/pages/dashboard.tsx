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
    { id: 'my-team', label: 'Meu Time', testId: 'filter-my-team' },
    { id: 'all', label: 'Todos', testId: 'filter-all' },
    ...TEAMS_DATA.slice(0, 5).map(team => ({
      id: team.id,
      label: team.shortName,
      testId: `filter-team-${team.id}`,
    })),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Filter Bar */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className="whitespace-nowrap font-medium"
                data-testid={filter.testId}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="container px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-[400px] rounded-lg" />
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
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Nenhuma notícia ainda
              </h3>
              <p className="text-muted-foreground">
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
