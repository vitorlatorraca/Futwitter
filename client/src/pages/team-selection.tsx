import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { TEAMS_DATA } from '@/lib/team-data';
import { Loader2, Shield, Heart } from 'lucide-react';

export default function TeamSelectionPage() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTeamClick = (teamId: string) => {
    setSelectedTeam(teamId);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!selectedTeam) return;

    const signupDataStr = sessionStorage.getItem('signupData');
    if (!signupDataStr) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Registration data not found. Please register again.',
      });
      setLocation('/cadastro');
      return;
    }

    const signupData = JSON.parse(signupDataStr);
    setIsLoading(true);

    try {
      await register(signupData.name, signupData.email, signupData.password, selectedTeam);
      sessionStorage.removeItem('signupData');
      toast({
        title: 'Account created successfully!',
        description: 'Welcome to Futwitter',
      });
      setLocation('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating account',
        description: error.message || 'Please try again later',
      });
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const team = TEAMS_DATA.find(t => t.id === selectedTeam);

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 sm:py-12 px-3 sm:px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-light text-3xl sm:text-4xl md:text-5xl text-white mb-4 tracking-tight">
            Choose your favorite team
          </h1>
          <p className="text-gray-400 font-light text-sm sm:text-base md:text-lg max-w-lg mx-auto">
            Attention: You won't be able to change later! Choose carefully ⚽
          </p>
        </motion.div>

        {/* Teams Grid */}
        <motion.div 
          className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-3 sm:gap-4 md:gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {TEAMS_DATA.map((team, index) => (
            <motion.button
              key={team.id}
              onClick={() => handleTeamClick(team.id)}
              className="group flex flex-col items-center gap-2 rounded-xl p-2 sm:p-3 transition-all duration-300 hover:bg-white/5"
              data-testid={`button-team-${team.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-full aspect-square rounded-full overflow-hidden bg-white/5 group-hover:bg-white/10 transition-colors">
                <img
                  src={team.logoUrl}
                  alt={`${team.name} logo`}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <span className="text-[10px] sm:text-xs font-light text-gray-400 text-center leading-tight group-hover:text-white transition-colors">
                {team.shortName}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-[#111111] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-light text-white">
              Confirm your choice
            </DialogTitle>
            <DialogDescription className="text-center pt-4">
              {team && (
                <div className="flex flex-col items-center gap-4">
                  <motion.div 
                    className="w-24 h-24 rounded-full overflow-hidden bg-white/5 p-3"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={team.logoUrl}
                      alt={`${team.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <div>
                    <p className="font-light text-xl text-white mb-2">{team.name}</p>
                    <p className="text-sm text-gray-400 font-light">
                      Are you sure? This choice is <span className="font-medium text-white">permanent</span> and cannot be changed later!
                    </p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
              data-testid="button-cancel"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white font-light"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              data-testid="button-confirm"
              className="bg-white text-black hover:bg-gray-200 font-light"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
