import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import type { Player } from '@shared/schema';

interface PlayerCardProps {
  player: Player & { averageRating?: number };
  onRate: (playerId: string) => void;
}

export function PlayerCard({ player, onRate }: PlayerCardProps) {
  const renderRating = () => {
    if (!player.averageRating) {
      return <span className="text-sm text-gray-400 font-light">Sem avaliações</span>;
    }

    const stars = Math.round(player.averageRating / 2);
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < stars ? 'fill-[#8b5cf6] text-[#8b5cf6]' : 'text-gray-600'}`}
          />
        ))}
        <span className="text-sm font-light text-white ml-1">{player.averageRating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 shadow-2xl" data-testid={`player-card-${player.id}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-transparent to-[#6366f1]/5 rounded-2xl pointer-events-none"></div>
      
      <CardContent className="p-6 space-y-4 relative z-10">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              {player.photoUrl ? (
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-2xl font-light text-gray-400">
                  {player.jerseyNumber}
                </div>
              )}
            </div>
            <Badge className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-medium bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] text-white border-0">
              {player.jerseyNumber}
            </Badge>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-light text-lg text-white truncate mb-2 tracking-tight">{player.name}</h4>
            <div className="flex items-center gap-2">
              {renderRating()}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full font-light bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
          onClick={() => onRate(player.id)}
          data-testid={`button-rate-${player.id}`}
        >
          Avaliar
        </Button>
      </CardContent>
    </Card>
  );
}
