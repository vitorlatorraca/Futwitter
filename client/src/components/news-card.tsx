import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { News } from '@shared/schema';

interface NewsCardProps {
  news: News & {
    team: { name: string; logoUrl: string; primaryColor: string };
    journalist: { user: { name: string } };
    userInteraction?: 'LIKE' | 'DISLIKE' | null;
  };
  canInteract: boolean;
  onInteract: (newsId: string, type: 'LIKE' | 'DISLIKE') => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  NEWS: 'Notícia',
  ANALYSIS: 'Análise',
  BACKSTAGE: 'Bastidores',
  MARKET: 'Mercado',
};

export function NewsCard({ news, canInteract, onInteract }: NewsCardProps) {
  const categoryLabel = CATEGORY_LABELS[news.category] || news.category;

  const InteractionButton = ({ type, count, icon: Icon }: { type: 'LIKE' | 'DISLIKE', count: number, icon: any }) => {
    const isActive = news.userInteraction === type;
    
    const button = (
      <Button
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        onClick={() => canInteract && onInteract(news.id, type)}
        disabled={!canInteract}
        className="gap-2"
        data-testid={`button-${type.toLowerCase()}-${news.id}`}
      >
        <Icon className="h-4 w-4" />
        <span className="font-semibold">{count}</span>
      </Button>
    );

    if (!canInteract) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Você só pode interagir com notícias do seu time</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`news-card-${news.id}`}>
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <img
            src={news.team.logoUrl}
            alt={`Escudo ${news.team.name}`}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{news.journalist.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{news.team.name}</p>
          </div>
          <Badge variant="secondary" className="text-xs">{categoryLabel}</Badge>
        </div>
      </CardHeader>

      {news.imageUrl && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="font-display font-semibold text-xl mb-2 leading-tight">
            {news.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {news.content}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{format(new Date(news.publishedAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <InteractionButton type="LIKE" count={news.likesCount} icon={ThumbsUp} />
        <InteractionButton type="DISLIKE" count={news.dislikesCount} icon={ThumbsDown} />
      </CardFooter>
    </Card>
  );
}
