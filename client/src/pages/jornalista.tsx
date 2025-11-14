import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { TEAMS_DATA } from '@/lib/team-data';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import type { News } from '@shared/schema';

export default function JornalistaPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);

  const [formData, setFormData] = useState({
    teamId: user?.isInfluencer && user?.teamId ? user.teamId : '',
    category: 'NEWS',
    title: '',
    content: '',
    imageUrl: '',
  });

  const { data: myNews } = useQuery<News[]>({
    queryKey: ['/api/news/my-news'],
    enabled: user?.userType === 'JOURNALIST' || user?.isInfluencer === true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/news', data);
    },
    onSuccess: () => {
      // Invalidar todas as queries de notícias (com qualquer filtro)
      queryClient.invalidateQueries({ queryKey: ['/api/news'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['/api/news/my-news'] });
      toast({
        title: 'Notícia publicada!',
        description: 'Sua notícia foi publicada com sucesso',
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao publicar',
        description: error.message || 'Tente novamente',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (newsId: string) => {
      return await apiRequest('DELETE', `/api/news/${newsId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      toast({
        title: 'Notícia excluída',
        description: 'A notícia foi removida com sucesso',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      teamId: user?.isInfluencer && user?.teamId ? user.teamId : '',
      category: 'NEWS',
      title: '',
      content: '',
      imageUrl: '',
    });
    setIsCreating(false);
    setEditingNews(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Para influencers, usar o teamId do usuário
    const submitData = user?.isInfluencer && user?.teamId 
      ? { ...formData, teamId: user.teamId }
      : formData;
    
    if (!submitData.teamId || !submitData.title || !submitData.content) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
      });
      return;
    }

    createMutation.mutate(submitData);
  };

  const categoryLabels: Record<string, string> = {
    NEWS: 'Notícia',
    ANALYSIS: 'Análise',
    BACKSTAGE: 'Bastidores',
    MARKET: 'Mercado',
  };

  if (user?.userType !== 'JOURNALIST' && !user?.isInfluencer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
        <Navbar />
        <div className="container px-6 py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="font-light text-2xl text-white mb-3 tracking-tight">
            Acesso Restrito
          </h3>
          <p className="text-gray-400 font-light">
            Você precisa ser um jornalista ou influencer para acessar esta página
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
      <Navbar />

      <div className="container px-6 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-light text-3xl text-white mb-2 tracking-tight">
              {user?.isInfluencer ? 'Painel do Influencer' : 'Painel do Jornalista'}
            </h1>
            <p className="text-gray-400 font-light text-sm">
              {user?.isInfluencer 
                ? 'Gerencie suas publicações e compartilhe novidades com os torcedores'
                : 'Gerencie suas publicações e compartilhe novidades com os torcedores'
              }
            </p>
          </div>
          <Button 
            onClick={() => setIsCreating(true)} 
            data-testid="button-new-news"
            className="bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white border-0 shadow-lg shadow-purple-500/20 font-light"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Notícia
          </Button>
        </div>

        {isCreating || editingNews ? (
          <Card className="mb-8 bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white font-light text-2xl">
                {editingNews ? 'Editar Notícia' : 'Publicar Nova Notícia'}
              </CardTitle>
              <CardDescription className="text-gray-400 font-light">
                Compartilhe novidades com os torcedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="team" className="text-white/80 font-light">Time *</Label>
                    {user?.isInfluencer && user?.teamId ? (
                      <div className="flex items-center gap-2 p-3 border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm">
                        {TEAMS_DATA.find(t => t.id === user.teamId) && (
                          <>
                            <img 
                              src={TEAMS_DATA.find(t => t.id === user.teamId)!.logoUrl} 
                              alt={TEAMS_DATA.find(t => t.id === user.teamId)!.name} 
                              className="w-6 h-6 rounded-full" 
                            />
                            <span className="text-sm text-white font-light">{TEAMS_DATA.find(t => t.id === user.teamId)!.name}</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <Select value={formData.teamId} onValueChange={(value) => setFormData({ ...formData, teamId: value })}>
                        <SelectTrigger 
                          data-testid="select-team"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          <SelectValue placeholder="Selecione o time" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10">
                          {TEAMS_DATA.map((team) => (
                            <SelectItem 
                              key={team.id} 
                              value={team.id}
                              className="text-white hover:bg-white/10 focus:bg-white/10"
                            >
                              <div className="flex items-center gap-2">
                                <img src={team.logoUrl} alt={team.name} className="w-5 h-5 rounded-full" />
                                {team.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {user?.isInfluencer && (
                      <p className="text-xs text-gray-400 font-light">Influencers só podem postar para o seu próprio time</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-white/80 font-light">Categoria *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger 
                        data-testid="select-category"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10">
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <SelectItem 
                            key={key} 
                            value={key}
                            className="text-white hover:bg-white/10 focus:bg-white/10"
                          >
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white/80 font-light">Título * (máx. 200 caracteres)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={200}
                    placeholder="Digite um título chamativo"
                    data-testid="input-title"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 font-light"
                  />
                  <p className="text-xs text-gray-400 font-light text-right">
                    {formData.title.length}/200
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-white/80 font-light">Conteúdo * (máx. 1000 caracteres)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    maxLength={1000}
                    rows={8}
                    placeholder="Escreva o conteúdo da notícia"
                    data-testid="textarea-content"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 font-light resize-none"
                  />
                  <p className="text-xs text-gray-400 font-light text-right">
                    {formData.content.length}/1000
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-white/80 font-light">URL da Imagem (opcional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    data-testid="input-image-url"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 font-light"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending} 
                    data-testid="button-publish"
                    className="bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white border-0 shadow-lg shadow-purple-500/20 font-light"
                  >
                    {createMutation.isPending ? 'Publicando...' : 'Publicar'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm} 
                    data-testid="button-cancel"
                    className="bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white font-light"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {/* My News List */}
        <div className="space-y-4">
          <h2 className="font-light text-2xl text-white mb-6 tracking-tight">Minhas Publicações</h2>
          {myNews && myNews.length > 0 ? (
            <div className="grid gap-4">
              {myNews.map((news: any) => (
                <Card key={news.id} className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge 
                            variant="secondary" 
                            className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-light"
                          >
                            {categoryLabels[news.category]}
                          </Badge>
                          <span className="text-xs text-gray-400 font-light">
                            {news.team?.name}
                          </span>
                        </div>
                        <h3 className="font-light text-lg text-white mb-2 truncate">{news.title}</h3>
                        <p className="text-sm text-gray-400 font-light line-clamp-2">{news.content}</p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1 font-light">
                            <Eye className="h-4 w-4" />
                            {news.likesCount + news.dislikesCount} interações
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingNews(news)}
                          data-testid={`button-edit-${news.id}`}
                          className="text-white/60 hover:text-white hover:bg-white/10 border-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(news.id)}
                          data-testid={`button-delete-${news.id}`}
                          className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                  <span className="text-3xl">📰</span>
                </div>
                <h3 className="font-light text-xl text-white mb-2 tracking-tight">
                  Nenhuma publicação ainda
                </h3>
                <p className="text-gray-400 font-light">
                  Você ainda não publicou nenhuma notícia
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
