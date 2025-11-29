import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ThumbsUp, ThumbsDown, Eye, MessageCircle, Share2, Send, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { resolveApiUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
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

interface Comment {
  id: string;
  newsId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  NEWS: 'News',
  ANALYSIS: 'Analysis',
  BACKSTAGE: 'Backstage',
  MARKET: 'Market',
};

export function VideoNewsCard({ news, canInteract, onInteract }: VideoNewsCardProps) {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [viewsCount, setViewsCount] = useState(news.viewsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(news.commentsCount || 0);
  const [commentError, setCommentError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for auto-pause when out of view
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

  // Increment view count on mount
  useEffect(() => {
    const incrementView = async () => {
      try {
        const response = await fetch(resolveApiUrl(`/api/news/${news.id}/view`), {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          const text = await response.text();
          if (text) {
            try {
              const data = JSON.parse(text);
              setViewsCount(data.viewsCount || 0);
            } catch {
              // Ignore
            }
          }
        }
      } catch (error) {
        // Silently fail
      }
    };
    incrementView();
  }, [news.id]);

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

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Load comments
  const loadComments = async () => {
    if (isLoadingComments) return;
    setIsLoadingComments(true);
    try {
      const response = await fetch(resolveApiUrl(`/api/news/${news.id}/comments`), {
        credentials: 'include',
      });
      if (response.ok) {
        const text = await response.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
              setComments(data);
              setCommentsCount(data.length);
            } else if (data.comments) {
              setComments(data.comments);
              setCommentsCount(data.totalCount || data.comments.length);
            }
          } catch {
            setComments([]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  // Send comment
  const handleSendComment = async () => {
    if (!newComment.trim() || isSendingComment) return;
    if (newComment.trim().length > 49) {
      setCommentError('Max 49 characters');
      return;
    }
    
    setIsSendingComment(true);
    setCommentError(null);
    
    try {
      const response = await fetch(resolveApiUrl(`/api/news/${news.id}/comments`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment.trim() }),
      });
      
      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {}
      }
      
      if (response.ok && data) {
        setComments(prev => [data, ...prev]);
        setCommentsCount(prev => prev + 1);
        setNewComment('');
      } else {
        setCommentError(data?.message || 'Error sending comment');
      }
    } catch (error) {
      setCommentError('Error sending comment');
    } finally {
      setIsSendingComment(false);
    }
  };

  // Share via WhatsApp
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Check out this video: ${news.title}`;
    const url = `${window.location.origin}/news/${news.id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!news || !news.team || !news.videoUrl) {
    return null;
  }

  const categoryLabel = CATEGORY_LABELS[news.category] || news.category;
  const authorName = news.author?.name || news.journalist?.user?.name || 'Unknown author';
  const authorAvatarUrl = news.author?.avatarUrl || news.journalist?.user?.avatarUrl;
  const canComment = user?.teamId === news.team?.id;

  return (
    <Card 
      ref={cardRef}
      className="overflow-hidden bg-white/2 backdrop-blur-md border border-white/5 rounded-lg sm:rounded-xl hover:border-white/10 hover:bg-white/3 transition-all duration-300"
      data-testid={`video-news-card-${news.id}`}
    >
      {/* Header */}
      <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3 relative z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
              {authorAvatarUrl ? (
                <img src={authorAvatarUrl} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/70 text-[9px] sm:text-[10px] font-light">
                  {authorName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-white/85 truncate font-light">{authorName}</p>
              <p className="text-[9px] sm:text-[10px] text-white/35 truncate font-light">{news.team.name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-[9px] sm:text-[10px] text-white/40 font-light">🎬 {categoryLabel}</span>
            <span className="text-[8px] sm:text-[9px] text-white/25 font-light">
              {format(new Date(news.publishedAt), "dd/MM HH:mm")}
            </span>
          </div>
        </div>
      </CardHeader>

      {/* Video Container with Overlay Icons */}
      <div className="relative w-full bg-black aspect-[9/16] overflow-hidden group">
        <video
          ref={videoRef}
          src={news.videoUrl}
          className="w-full h-full object-cover cursor-pointer"
          loop
          muted={isMuted}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
        
        {/* Play/Pause overlay (center) */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Play className="h-7 w-7 sm:h-8 sm:w-8 text-white ml-1" fill="white" />
            </div>
          </div>
        )}

        {/* Interaction Icons - Bottom overlay, horizontal layout */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 pt-8">
          <div className="flex items-center gap-4">
            {/* Like */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      canInteract && onInteract(news.id, 'LIKE');
                    }}
                    className={`flex items-center gap-1.5 transition-all ${
                      news.userInteraction === 'LIKE' ? 'text-green-400' : 'text-white/90 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span className="text-xs font-medium">{news.likesCount}</span>
                  </button>
                </TooltipTrigger>
                {!canInteract && (
                  <TooltipContent className="bg-black/80 border-white/10">
                    <p className="text-xs">Only your team</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* Dislike */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      canInteract && onInteract(news.id, 'DISLIKE');
                    }}
                    className={`flex items-center gap-1.5 transition-all ${
                      news.userInteraction === 'DISLIKE' ? 'text-red-400' : 'text-white/90 hover:text-white'
                    }`}
                  >
                    <ThumbsDown className="h-5 w-5" />
                    <span className="text-xs font-medium">{news.dislikesCount}</span>
                  </button>
                </TooltipTrigger>
                {!canInteract && (
                  <TooltipContent className="bg-black/80 border-white/10">
                    <p className="text-xs">Only your team</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* Views */}
            <div className="flex items-center gap-1.5 text-white/90">
              <Eye className="h-5 w-5" />
              <span className="text-xs font-medium">{viewsCount}</span>
            </div>

            {/* Comments */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleComments();
              }}
              className={`flex items-center gap-1.5 transition-all ${
                showComments ? 'text-purple-400' : 'text-white/90 hover:text-white'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">{commentsCount}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-white/90 hover:text-green-400 transition-all"
            >
              <Share2 className="h-5 w-5" />
            </button>

            {/* Mute button - Right side */}
            <button
              onClick={toggleMute}
              className="ml-auto flex items-center justify-center text-white/90 hover:text-white transition-all"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content below video */}
      <CardContent className="p-3 sm:p-4 space-y-2 relative z-10">
        <h3 className="font-light text-sm sm:text-base text-white/90 leading-tight tracking-tight">
          {news.title}
        </h3>
        <p className="text-xs sm:text-sm text-white/55 leading-relaxed line-clamp-2 font-light">
          {news.content}
        </p>
      </CardContent>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-white/5 p-3 sm:p-4 space-y-3">
          {canComment ? (
            <div className="space-y-1">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={newComment}
                    onChange={(e) => {
                      if (e.target.value.length <= 49) {
                        setNewComment(e.target.value);
                        setCommentError(null);
                      }
                    }}
                    placeholder="Comment... (max 49)"
                    maxLength={49}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-8 pr-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  />
                  <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] ${
                    newComment.length >= 45 ? 'text-orange-400' : 'text-white/30'
                  }`}>
                    {newComment.length}/49
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={handleSendComment}
                  disabled={!newComment.trim() || isSendingComment}
                  className="h-8 px-3 bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              {commentError && <p className="text-[10px] text-red-400">{commentError}</p>}
            </div>
          ) : (
            <p className="text-[10px] text-white/40 text-center py-2">
              Only fans of {news.team.name} can comment
            </p>
          )}

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {isLoadingComments ? (
              <p className="text-xs text-white/40 text-center py-3">Loading...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-3">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 p-2 bg-white/3 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {comment.userAvatar ? (
                      <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[8px] text-white/70">{comment.userName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/70 font-medium truncate">{comment.userName}</span>
                      <span className="text-[8px] text-white/30 ml-2">{format(new Date(comment.createdAt), "HH:mm")}</span>
                    </div>
                    <p className="text-[10px] text-white/60 break-words">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
