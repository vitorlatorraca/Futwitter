import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ThumbsUp, ThumbsDown, Eye, MessageCircle, Share2, Send, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { resolveApiUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
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

export function NewsCard({ news, canInteract, onInteract }: NewsCardProps) {
  const { user } = useAuth();
  const [viewsCount, setViewsCount] = useState(news.viewsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(news.commentsCount || 0);

  // Safety check
  if (!news || !news.team) {
    console.error('[NewsCard] Invalid news data:', news);
    return null;
  }

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
              // Ignore JSON parse errors
            }
          }
        }
      } catch (error) {
        // Silently fail - views feature may not be available yet
      }
    };
    incrementView();
  }, [news.id]);

  // Load comments when expanded
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
            setComments(Array.isArray(data) ? data : []);
          } catch {
            setComments([]);
          }
        } else {
          setComments([]);
        }
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
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
  const [commentError, setCommentError] = useState<string | null>(null);
  
  const handleSendComment = async () => {
    if (!newComment.trim() || isSendingComment) return;
    
    // Client-side validation
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
        } catch {
          // Not JSON response
        }
      }
      
      if (response.ok && data) {
        // Add new comment to the TOP of the list (most recent first)
        setComments(prev => [data, ...prev]);
        setCommentsCount(prev => prev + 1);
        setNewComment('');
        setCommentError(null);
      } else {
        setCommentError(data?.message || 'Comments feature not available yet');
      }
    } catch (error) {
      console.error('Error sending comment:', error);
      setCommentError('Error sending comment');
    } finally {
      setIsSendingComment(false);
    }
  };

  // Share via WhatsApp
  const handleShare = () => {
    const text = `Check out this news: ${news.title}`;
    const url = `${window.location.origin}/news/${news.id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const categoryLabel = CATEGORY_LABELS[news.category] || news.category;
  const canComment = user?.teamId === news.team?.id;

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
              <p className="text-xs">You can only interact with news from your team</p>
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
        <div className="flex items-center justify-between gap-2 sm:gap-2.5">
          {/* Left side: Author + Team */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            {/* Avatar */}
            {(() => {
              const authorName = news.author?.name || news.journalist?.user?.name || 'Unknown author';
              const authorAvatarUrl = news.author?.avatarUrl || news.journalist?.user?.avatarUrl;
              return (
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                  {authorAvatarUrl ? (
                    <img 
                      src={authorAvatarUrl}
                      alt={authorName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-white/70 text-[9px] sm:text-[10px] md:text-xs font-light">
                      {authorName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              );
            })()}
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs md:text-sm text-white/85 truncate font-light">
                {news.author?.name || news.journalist?.user?.name || 'Unknown author'}
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-white/35 truncate font-light">{news.team.name}</p>
            </div>
          </div>
          
          {/* Right side: Category + DateTime */}
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-[9px] sm:text-[10px] text-white/40 font-light">{categoryLabel}</span>
            <span className="text-[8px] sm:text-[9px] text-white/25 font-light">
              {format(new Date(news.publishedAt), "dd/MM HH:mm", { locale: ptBR })}
            </span>
          </div>
        </div>
      </CardHeader>

      {/* Content FIRST (inverted order) */}
      <CardContent className="p-3 sm:p-4 md:p-5 pt-0 space-y-2 sm:space-y-3 relative z-10">
        <div>
          <h3 className="font-light text-sm sm:text-base md:text-lg text-white/90 mb-1.5 sm:mb-2 leading-tight tracking-tight">
            {news.title}
          </h3>
          <p className="text-xs sm:text-sm text-white/55 leading-relaxed line-clamp-3 font-light">
            {news.content}
          </p>
        </div>
      </CardContent>

      {/* Image SECOND (inverted order) */}
      {news.imageUrl && (
        <div className="relative aspect-video overflow-hidden mx-3 sm:mx-4 md:mx-5 rounded-lg">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>
      )}

      <CardFooter className="p-3 sm:p-4 md:p-5 pt-3 flex flex-wrap gap-1.5 sm:gap-2 relative z-10">
        {/* Like/Dislike buttons */}
        <InteractionButton type="LIKE" count={news.likesCount} icon={ThumbsUp} />
        <InteractionButton type="DISLIKE" count={news.dislikesCount} icon={ThumbsDown} />
        
        {/* Views counter */}
        <div className="flex items-center gap-1 px-2 sm:px-3 h-7 sm:h-8 bg-white/3 border border-white/5 rounded-md text-white/50">
          <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="text-[10px] sm:text-xs font-light">{viewsCount}</span>
        </div>
        
        {/* Comments button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleComments}
          className="gap-1 sm:gap-1.5 font-light text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 bg-white/3 border-white/5 text-white/50 hover:bg-white/8 hover:text-white/70 hover:border-white/8"
        >
          <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="font-light text-[10px] sm:text-xs">{commentsCount}</span>
        </Button>
        
        {/* Share button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-1 sm:gap-1.5 font-light text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 bg-white/3 border-white/5 text-white/50 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30"
        >
          <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
      </CardFooter>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-white/5 p-3 sm:p-4 md:p-5 space-y-3">
          {/* Comment input - only for same team fans */}
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
                    placeholder="Write a comment... (max 49 chars)"
                    maxLength={49}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs sm:text-sm h-8 sm:h-9 pr-12"
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
                  className="h-8 sm:h-9 px-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              {commentError && (
                <p className="text-[10px] text-red-400">{commentError}</p>
              )}
            </div>
          ) : (
            <p className="text-[10px] sm:text-xs text-white/40 text-center py-2">
              Only fans of {news.team.name} can comment
            </p>
          )}

          {/* Comments list */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {isLoadingComments ? (
              <p className="text-xs text-white/40 text-center py-4">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-4">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 p-2 bg-white/3 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {comment.userAvatar ? (
                      <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] text-white/70">{comment.userName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-white/70 font-medium truncate">{comment.userName}</span>
                      <span className="text-[8px] sm:text-[9px] text-white/30 flex-shrink-0 ml-2">
                        {format(new Date(comment.createdAt), "HH:mm")}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-white/60 break-words">{comment.content}</p>
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
