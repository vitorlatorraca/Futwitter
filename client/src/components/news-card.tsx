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
    journalist?: { user: { name: string; avatarUrl?: string | null } } | null;
    author?: { name: string; avatarUrl?: string | null } | null;
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
        className={`gap-1 sm:gap-1.5 font-light transition-all duration-200 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 ${
          isActive
            ? 'bg-white/10 border-white/15 text-white'
            : 'bg-white/3 border-white/5 text-white/50 hover:bg-white/8 hover:text-white/70 hover:border-white/8'
        }`}
        data-testid={`button-${type.toLowerCase()}-${news.id}`}
      >
        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
        <span className="font-light text-[10px] sm:text-xs">{count}</span>
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
    <Card className="overflow-hidden bg-white/2 backdrop-blur-md border border-white/5 rounded-lg sm:rounded-xl hover:border-white/10 hover:bg-white/3 transition-all duration-300" data-testid={`news-card-${news.id}`}>
      <CardHeader className="p-3 sm:p-4 md:p-5 pb-2 sm:pb-3 relative z-10">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Avatar do autor - ultra minimalista mobile */}
          {(() => {
            const authorName = news.author?.name || news.journalist?.user?.name || 'Autor desconhecido';
            const authorAvatarUrl = news.author?.avatarUrl || news.journalist?.user?.avatarUrl;
            return (
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0" key={`avatar-${authorAvatarUrl ? authorAvatarUrl.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '') : 'none'}`}>
                {authorAvatarUrl ? (
                  <img 
                    src={authorAvatarUrl}
                    alt={authorName}
                    className="w-full h-full object-cover"
                    onLoad={() => {
                      console.log('✅ NewsCard - Avatar carregado:', authorName);
                    }}
                    onError={(e) => {
                      console.error('❌ NewsCard - Erro ao carregar avatar:', authorAvatarUrl?.substring(0, 50));
                      e.currentTarget.style.display = 'none';
                    }}
                    key={`img-${authorAvatarUrl?.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '') || 'none'}`}
                  />
                ) : (
                  <span className="text-white/70 text-[9px] sm:text-[10px] md:text-xs font-light">
                    {authorName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            );
          })()}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] sm:text-xs md:text-sm text-white/85 truncate font-light">
              {news.author?.name || news.journalist?.user?.name || 'Autor desconhecido'}
            </p>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-white/35 truncate font-light">{news.team.name}</p>
          </div>
          <span className="text-[9px] sm:text-[10px] text-white/25 font-light hidden md:inline">{categoryLabel}</span>
        </div>
      </CardHeader>

      {news.imageUrl && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>
      )}

      <CardContent className="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3 relative z-10">
        <div>
          <h3 className="font-light text-sm sm:text-base md:text-lg text-white/90 mb-1.5 sm:mb-2 leading-tight tracking-tight">
            {news.title}
          </h3>
          <p className="text-xs sm:text-sm text-white/55 leading-relaxed line-clamp-3 font-light">
            {news.content}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] md:text-xs text-white/25 font-light">
          <span className="hidden md:inline">{format(new Date(news.publishedAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
          <span className="md:hidden">{format(new Date(news.publishedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 md:p-5 pt-0 flex gap-1.5 sm:gap-2 relative z-10">
        <InteractionButton type="LIKE" count={news.likesCount} icon={ThumbsUp} />
        <InteractionButton type="DISLIKE" count={news.dislikesCount} icon={ThumbsDown} />
      </CardFooter>
    </Card>
  );
}
