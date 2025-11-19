import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User, Lock, BarChart3, Award, Loader2, Star, CheckCircle, XCircle, Clock, Upload, Camera, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function PerfilPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [influencerReason, setInfluencerReason] = useState('');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [tempAvatarPreview, setTempAvatarPreview] = useState<string | null>(null); // Preview temporário antes de confirmar

  // Sync avatar preview when user changes
  useEffect(() => {
    setAvatarPreview(user?.avatarUrl || null);
    setTempAvatarPreview(null); // Limpar preview temporário quando user mudar
  }, [user?.avatarUrl]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const profileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      return await apiRequest('PUT', '/api/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: t('profile.update.successTitle'),
        description: t('profile.update.successDescription'),
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('profile.update.errorDescription'),
      });
    },
  });

  const avatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      return await apiRequest('PUT', '/api/profile/avatar', { avatarUrl });
    },
    onSuccess: async (updatedUser) => {
      console.log('✅ Avatar mutation success - updatedUser:', updatedUser);
      console.log('✅ Avatar URL recebido:', updatedUser?.avatarUrl);
      
      // Atualizar o cache diretamente com os dados atualizados
      queryClient.setQueryData(['/api/auth/me'], updatedUser);
      console.log('✅ Cache atualizado com setQueryData');
      
      // Forçar um refetch para garantir que está sincronizado
      await queryClient.refetchQueries({ 
        queryKey: ['/api/auth/me'],
        type: 'active' 
      });
      console.log('✅ Refetch concluído');
      
      setTempAvatarPreview(null); // Limpar preview temporário após salvar
      toast({
        title: 'Foto atualizada!',
        description: 'Sua foto de perfil foi atualizada com sucesso',
      });
      setIsUploadingAvatar(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a foto',
      });
      setIsUploadingAvatar(false);
    },
  });

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Por favor, selecione uma imagem válida',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'A imagem deve ter no máximo 2MB',
      });
      return;
    }

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setTempAvatarPreview(base64String); // Mostrar preview temporário
    };
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao ler a imagem',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmAvatar = () => {
    if (!tempAvatarPreview) return;
    setIsUploadingAvatar(true);
    avatarMutation.mutate(tempAvatarPreview);
  };

  const handleCancelAvatar = () => {
    setTempAvatarPreview(null);
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      const updatedUser = await apiRequest('PUT', '/api/profile/avatar', { avatarUrl: '' });
      // Atualizar o cache diretamente
      queryClient.setQueryData(['/api/auth/me'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setAvatarPreview(null);
      toast({
        title: 'Foto removida!',
        description: 'Sua foto de perfil foi removida',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível remover a foto',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const passwordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest('PUT', '/api/profile/password', data);
    },
    onSuccess: () => {
      toast({
        title: t('profile.password.successTitle'),
        description: t('profile.password.successDescription'),
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('profile.password.errorDescription'),
      });
    },
  });

  const handleSaveProfile = async () => {
    profileMutation.mutate(profileData);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('profile.password.mismatchError'),
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('profile.password.lengthError'),
      });
      return;
    }

    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const mockStats = {
    ratingsCount: 24,
    newsLiked: 15,
    daysActive: 7,
  };

  const { data: badges = [], refetch: refetchBadges } = useQuery({
    queryKey: ['/api/badges'],
  });

  // Buscar solicitação de influencer
  const { data: influencerRequest } = useQuery({
    queryKey: ['/api/influencer/request/my'],
    queryFn: async () => {
      const response = await fetch('/api/influencer/request/my', {
        credentials: 'include',
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user && !user.isInfluencer,
  });

  const influencerRequestMutation = useMutation({
    mutationFn: async (reason: string) => {
      return await apiRequest('POST', '/api/influencer/request', { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/influencer/request/my'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Solicitação enviada',
        description: 'Sua solicitação para ser influencer foi enviada com sucesso',
      });
      setIsRequestDialogOpen(false);
      setInfluencerReason('');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível enviar a solicitação',
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] relative overflow-hidden">
      {/* Decorative blur circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#8b5cf6] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-[#6366f1] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-[#8b5cf6] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <Navbar />

      <div className="container px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-4xl relative z-10">
        <h1 className="font-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-4 sm:mb-6 md:mb-8 tracking-tight">{t('profile.title')}</h1>

        <Tabs defaultValue="info" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-0.5 sm:p-1">
            <TabsTrigger 
              value="info" 
              className="gap-1 sm:gap-2 font-light text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8b5cf6] data-[state=active]:to-[#6366f1] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 text-white/80 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/5" 
              data-testid="tab-info"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('profile.tabs.info')}</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="gap-1 sm:gap-2 font-light text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8b5cf6] data-[state=active]:to-[#6366f1] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 text-white/80 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/5" 
              data-testid="tab-stats"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('profile.tabs.stats')}</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="badges" 
              className="gap-1 sm:gap-2 font-light text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8b5cf6] data-[state=active]:to-[#6366f1] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 text-white/80 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/5" 
              data-testid="tab-badges"
            >
              <Award className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('profile.tabs.badges')}</span>
              <span className="sm:hidden">Badges</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            {/* Avatar Upload Section */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-white font-light text-xl sm:text-2xl flex items-center gap-2">
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-[#8b5cf6]" />
                  Foto de Perfil
                </CardTitle>
                <CardDescription className="text-gray-400 font-light text-sm sm:text-base">
                  Adicione uma foto para personalizar seu perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                      {tempAvatarPreview || avatarPreview ? (
                        <img
                          src={tempAvatarPreview || avatarPreview || ''}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center">
                          <span className="text-xl sm:text-2xl font-medium text-white">
                            {user?.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {avatarPreview && !tempAvatarPreview && (
                      <button
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingAvatar}
                        className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center border-2 border-white/20 transition-colors"
                        title="Remover foto"
                      >
                        <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 w-full sm:w-auto space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="avatar-upload" className="text-gray-300 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          <span>Escolher foto</span>
                        </div>
                      </Label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        disabled={isUploadingAvatar}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 font-light">
                        Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 2MB
                      </p>
                    </div>
                    {tempAvatarPreview && (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleConfirmAvatar}
                          disabled={isUploadingAvatar}
                          size="sm"
                          className="font-medium bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-300"
                        >
                          {isUploadingAvatar ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            'Confirmar'
                          )}
                        </Button>
                        <Button
                          onClick={handleCancelAvatar}
                          disabled={isUploadingAvatar}
                          variant="outline"
                          size="sm"
                          className="font-light bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                    {isUploadingAvatar && !tempAvatarPreview && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Enviando...</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-white font-light text-xl sm:text-2xl">{t('profile.info.title')}</CardTitle>
                <CardDescription className="text-gray-400 font-light text-sm sm:text-base">{t('profile.info.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">{t('profile.info.name')}</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditing}
                    data-testid="input-name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">{t('profile.info.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                    data-testid="input-email"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
                  />
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={profileMutation.isPending} 
                      data-testid="button-save"
                      className="font-medium bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-300"
                    >
                      {profileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('profile.info.saving')}
                        </>
                      ) : (
                        t('profile.info.save')
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)} 
                      disabled={profileMutation.isPending} 
                      data-testid="button-cancel"
                      className="font-light bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20"
                    >
                      {t('profile.info.cancel')}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    data-testid="button-edit"
                    className="font-medium bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-300"
                  >
                    {t('profile.info.edit')}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white font-light text-2xl flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#8b5cf6]" />
                  {t('profile.password.title')}
                </CardTitle>
                <CardDescription className="text-gray-400 font-light">{t('profile.password.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-gray-300">{t('profile.password.current')}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    data-testid="input-current-password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-300">{t('profile.password.new')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    data-testid="input-new-password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">{t('profile.password.confirm')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    data-testid="input-confirm-password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
                  />
                </div>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={passwordMutation.isPending} 
                  data-testid="button-change-password"
                  className="font-medium bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-300"
                >
                  {passwordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('profile.password.changing')}
                    </>
                  ) : (
                    t('profile.password.change')
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Influencer Request Section */}
            {user && !user.isInfluencer && (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-white font-light text-2xl flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#8b5cf6]" />
                    Solicitar Status de Influencer
                  </CardTitle>
                  <CardDescription className="text-gray-400 font-light">
                    Envie uma solicitação para se tornar um influencer na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {influencerRequest ? (
                    <div className="space-y-3">
                      <div className={`p-4 rounded-lg border ${
                        influencerRequest.status === 'PENDING'
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : influencerRequest.status === 'APPROVED'
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {influencerRequest.status === 'PENDING' && (
                            <>
                              <Clock className="h-5 w-5 text-yellow-400" />
                              <span className="text-yellow-400 font-light">Solicitação Pendente</span>
                            </>
                          )}
                          {influencerRequest.status === 'APPROVED' && (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-400" />
                              <span className="text-green-400 font-light">Aprovado</span>
                            </>
                          )}
                          {influencerRequest.status === 'REJECTED' && (
                            <>
                              <XCircle className="h-5 w-5 text-red-400" />
                              <span className="text-red-400 font-light">Rejeitado</span>
                            </>
                          )}
                        </div>
                        {influencerRequest.reason && (
                          <p className="text-gray-300 font-light text-sm mt-2">{influencerRequest.reason}</p>
                        )}
                        <p className="text-gray-400 font-light text-xs mt-2">
                          Enviado em {new Date(influencerRequest.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full font-medium bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-300"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Solicitar Ser Influencer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black/70 backdrop-blur-xl border border-white/10 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-light text-white">
                            Solicitar Status de Influencer
                          </DialogTitle>
                          <DialogDescription className="text-gray-400 font-light">
                            Explique por que você gostaria de ser um influencer na plataforma
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="reason" className="text-gray-300">Motivo (opcional)</Label>
                            <Textarea
                              id="reason"
                              placeholder="Conte-nos sobre você e por que você seria um bom influencer..."
                              value={influencerReason}
                              onChange={(e) => setInfluencerReason(e.target.value)}
                              maxLength={500}
                              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6] min-h-[120px]"
                            />
                            <p className="text-xs text-gray-500 text-right font-light">
                              {influencerReason.length}/500 caracteres
                            </p>
                          </div>
                          <Button
                            onClick={() => influencerRequestMutation.mutate(influencerReason)}
                            disabled={influencerRequestMutation.isPending}
                            className="w-full font-medium bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-300"
                          >
                            {influencerRequestMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              'Enviar Solicitação'
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Show influencer badge if user is influencer */}
            {user?.isInfluencer && (
              <Card className="bg-gradient-to-r from-[#8b5cf6]/20 to-[#6366f1]/20 backdrop-blur-xl border border-[#8b5cf6]/30 shadow-lg shadow-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] flex items-center justify-center">
                      <Star className="h-8 w-8 text-white fill-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-light text-white mb-1">Você é um Influencer!</h3>
                      <p className="text-gray-300 font-light text-sm">
                        Seu conteúdo tem destaque especial na plataforma
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl font-light text-white mb-2">{mockStats.ratingsCount}</div>
                  <p className="text-xs sm:text-sm text-gray-400 font-light">{t('profile.stats.ratings')}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl font-light text-white mb-2">{mockStats.newsLiked}</div>
                  <p className="text-xs sm:text-sm text-gray-400 font-light">{t('profile.stats.newsLiked')}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 sm:col-span-2 md:col-span-1">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl font-light text-white mb-2">{mockStats.daysActive}</div>
                  <p className="text-xs sm:text-sm text-gray-400 font-light">{t('profile.stats.daysActive')}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="badges">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {badges.map((badge: any) => (
                <Card 
                  key={badge.id} 
                  className={`bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 ${!badge.unlocked ? 'opacity-50' : ''}`}
                >
                  <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                    <div className="text-3xl sm:text-4xl flex-shrink-0">{badge.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-white mb-1 text-sm sm:text-base">{badge.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 font-light mb-2">{badge.description}</p>
                      <Badge 
                        variant={badge.unlocked ? 'default' : 'secondary'}
                        className={badge.unlocked 
                          ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white border-0 shadow-md shadow-purple-500/20 font-light' 
                          : 'bg-white/10 border-white/10 text-white/80 font-light'
                        }
                      >
                        {badge.unlocked ? t('profile.badges.unlocked') : t('profile.badges.locked')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
