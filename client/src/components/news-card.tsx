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
    team: { id?: string; name: string; logoUrl: string; primaryColor: string };
    journalist?: { user: { name: string } } | null;
    author?: { name: string } | null;
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
  // Safety check
  if (!news || !news.team) {
    console.error('[NewsCard] Invalid news data:', news);
    return null;
  }

  const categoryLabel = CATEGORY_LABELS[news.category] || news.category;

  const InteractionButton = ({ type, count, icon: Icon }: { type: 'LIKE' | 'DISLIKE', count: number, icon: any }) => {
    const isActive = news.userInteraction === type;
    
    const button = (
      <Button
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        onClick={() => canInteract && onInteract(news.id, type)}
        disabled={!canInteract}
        className={`gap-2 font-light transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white border-0 shadow-lg shadow-purple-500/20'
            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20'
        }`}
        data-testid={`button-${type.toLowerCase()}-${news.id}`}
      >
        <Icon className="h-4 w-4" />
        <span className="font-medium">{count}</span>
      </Button>
    );

    if (!canInteract) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent className="bg-[#16181c] border-white/10 text-white">
              <p className="text-xs">Você só pode interagir com notícias do seu time</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  return (
    <Card className="overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 shadow-2xl" data-testid={`news-card-${news.id}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-transparent to-[#6366f1]/5 rounded-2xl pointer-events-none"></div>
      
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 relative z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={news.team.logoUrl}
            alt={`Escudo ${news.team.name}`}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white/10 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs sm:text-sm text-white truncate">
              {news.journalist?.user?.name || (news as any).author?.name || 'Autor desconhecido'}
            </p>
            <p className="text-xs text-gray-400 truncate font-light">{news.team.name}</p>
          </div>
          <Badge className="bg-white/10 border-white/10 text-white/90 font-light text-xs flex-shrink-0">{categoryLabel}</Badge>
        </div>
      </CardHeader>

      {news.imageUrl && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      )}

      <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4 relative z-10">
        <div>
          <h3 className="font-light text-lg sm:text-2xl text-white mb-2 sm:mb-3 leading-tight tracking-tight">
            {news.title}
          </h3>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed line-clamp-3 font-light">
            {news.content}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 font-light">
          <span>{format(new Date(news.publishedAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 sm:p-6 pt-0 flex gap-2 relative z-10">
        <InteractionButton type="LIKE" count={news.likesCount} icon={ThumbsUp} />
        <InteractionButton type="DISLIKE" count={news.dislikesCount} icon={ThumbsDown} />
      </CardFooter>
    </Card>
  );
}
