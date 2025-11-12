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
    teamId: '',
    category: 'NEWS',
    title: '',
    content: '',
    imageUrl: '',
  });

  const { data: myNews } = useQuery<News[]>({
    queryKey: ['/api/news/my-news'],
    enabled: user?.userType === 'JOURNALIST',
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/news', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
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
      teamId: '',
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
    
    if (!formData.teamId || !formData.title || !formData.content) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const categoryLabels: Record<string, string> = {
    NEWS: 'Notícia',
    ANALYSIS: 'Análise',
    BACKSTAGE: 'Bastidores',
    MARKET: 'Mercado',
  };

  if (user?.userType !== 'JOURNALIST') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-16 text-center">
          <p className="text-muted-foreground">Você precisa ser um jornalista para acessar esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-bold text-3xl">Painel do Jornalista</h1>
          <Button onClick={() => setIsCreating(true)} data-testid="button-new-news">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Notícia
          </Button>
        </div>

        {isCreating || editingNews ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingNews ? 'Editar Notícia' : 'Publicar Nova Notícia'}</CardTitle>
              <CardDescription>Compartilhe novidades com os torcedores</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="team">Time *</Label>
                    <Select value={formData.teamId} onValueChange={(value) => setFormData({ ...formData, teamId: value })}>
                      <SelectTrigger data-testid="select-team">
                        <SelectValue placeholder="Selecione o time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAMS_DATA.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            <div className="flex items-center gap-2">
                              <img src={team.logoUrl} alt={team.name} className="w-5 h-5 rounded-full" />
                              {team.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título * (máx. 200 caracteres)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={200}
                    placeholder="Digite um título chamativo"
                    data-testid="input-title"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.title.length}/200
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo * (máx. 1000 caracteres)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    maxLength={1000}
                    rows={8}
                    placeholder="Escreva o conteúdo da notícia"
                    data-testid="textarea-content"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.content.length}/1000
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    data-testid="input-image-url"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-publish">
                    {createMutation.isPending ? 'Publicando...' : 'Publicar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {/* My News List */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-2xl">Minhas Publicações</h2>
          {myNews && myNews.length > 0 ? (
            <div className="grid gap-4">
              {myNews.map((news: any) => (
                <Card key={news.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{categoryLabels[news.category]}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {news.team?.name}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 truncate">{news.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{news.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(news.id)}
                          data-testid={`button-delete-${news.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Você ainda não publicou nenhuma notícia</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
