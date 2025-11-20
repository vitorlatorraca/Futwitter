import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ThumbsUp, ThumbsDown, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { News } from '@shared/schema';

interface VideoNewsCardProps {
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

export function VideoNewsCard({ news, canInteract, onInteract }: VideoNewsCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para pausar quando sair da tela
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          if (!entry.isIntersecting && videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  if (!news || !news.team || !news.videoUrl) {
    return null;
  }

  const categoryLabel = CATEGORY_LABELS[news.category] || news.category;
  const authorName = news.author?.name || news.journalist?.user?.name || 'Autor desconhecido';
  const authorAvatarUrl = news.author?.avatarUrl || news.journalist?.user?.avatarUrl;

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
    <Card 
      ref={cardRef}
      className="overflow-hidden bg-white/2 backdrop-blur-md border border-white/5 rounded-lg sm:rounded-xl hover:border-white/10 hover:bg-white/3 transition-all duration-300"
      data-testid={`video-news-card-${news.id}`}
    >
      
      <CardHeader className="p-3 sm:p-4 md:p-5 pb-2 sm:pb-3 relative z-10">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
            {authorAvatarUrl ? (
              <img 
                src={authorAvatarUrl}
                alt={authorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white/70 text-[9px] sm:text-[10px] md:text-xs font-light">
                {authorName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] sm:text-xs md:text-sm text-white/85 truncate font-light">
              {authorName}
            </p>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-white/35 truncate font-light">{news.team.name}</p>
          </div>
          <span className="text-[9px] sm:text-[10px] text-white/25 font-light hidden md:inline">{categoryLabel}</span>
        </div>
      </CardHeader>

      {/* Video Container - Tipo TikTok - Ultra responsivo mobile */}
      <div className="relative w-full bg-black aspect-[9/16] overflow-hidden group">
        <video
          ref={videoRef}
          src={news.videoUrl}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={handleVideoClick}
        />
        
        {/* Overlay com controles - minimalista mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity">
          {/* Botão Play/Pause centralizado - menor no mobile */}
          <button
            onClick={handleVideoClick}
            className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {!isPlaying && (
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/15 backdrop-blur-sm sm:backdrop-blur-md flex items-center justify-center border border-white/20 sm:border-2 sm:border-white/30">
                <Play className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white ml-0.5 sm:ml-1" fill="white" />
              </div>
            )}
          </button>

          {/* Controles no canto inferior - menores no mobile */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-sm sm:backdrop-blur-md flex items-center justify-center border border-white/15 sm:border-white/20 hover:bg-black/60 transition-colors"
              aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
            >
              {isMuted ? (
                <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Badge de categoria no canto superior esquerdo (mobile) */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 md:hidden">
          <span className="text-[9px] text-white/30 font-light bg-black/20 backdrop-blur-sm px-1 py-0.5 rounded">
            {categoryLabel}
          </span>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3 relative z-10">
        <div>
          <h3 className="font-light text-sm sm:text-base md:text-lg text-white/90 mb-1.5 sm:mb-2 leading-tight tracking-tight">
            {news.title}
          </h3>
          <p className="text-xs sm:text-sm text-white/55 leading-relaxed line-clamp-2 font-light">
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

