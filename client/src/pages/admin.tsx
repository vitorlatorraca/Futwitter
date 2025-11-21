import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { resolveApiUrl } from '@/lib/api';
import { Shield, Users, CheckCircle, XCircle, Loader2, Search, Star, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { User } from '@shared/schema';

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('PENDING');

  // Verificar se o usuário é admin
  if (user?.userType !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
        <Navbar />
        <div className="container px-6 py-8 max-w-4xl">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
            <CardContent className="p-12 text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-red-400" />
              <h2 className="text-2xl font-light text-white mb-2">Acesso Negado</h2>
              <p className="text-gray-400 font-light">Você não tem permissão para acessar esta página.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Buscar todos os usuários
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch(resolveApiUrl('/api/admin/users'), {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Erro ao buscar usuários');
      return response.json();
    },
  });

  // Buscar solicitações de influencer
  const { data: influencerRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['/api/admin/influencer-requests', requestStatusFilter],
    queryFn: async () => {
      const response = await fetch(resolveApiUrl(`/api/admin/influencer-requests?status=${requestStatusFilter}`), {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Erro ao buscar solicitações');
      return response.json();
    },
  });

  const influencerMutation = useMutation({
    mutationFn: async ({ userId, isInfluencer }: { userId: string; isInfluencer: boolean }) => {
      return await apiRequest('PUT', `/api/admin/users/${userId}/influencer`, { isInfluencer });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Status atualizado',
        description: 'O status de influencer foi atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o status',
      });
    },
  });

  const reviewRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      return await apiRequest('PUT', `/api/admin/influencer-requests/${requestId}/review`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/influencer-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Solicitação revisada',
        description: 'A solicitação foi processada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível revisar a solicitação',
      });
    },
  });

  const filteredUsers = users?.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getRoleBadge = (userType: string) => {
    switch (userType) {
      case 'ADMIN':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 font-light">Admin</Badge>;
      case 'JOURNALIST':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-light">Jornalista</Badge>;
      default:
        return <Badge className="bg-white/10 border-white/10 text-white/80 font-light">Fã</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] relative overflow-hidden">
      {/* Decorative blur circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#8b5cf6] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-[#6366f1] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

      <Navbar />

      <div className="container px-6 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-light text-4xl md:text-5xl text-white mb-4 tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#8b5cf6]" />
            Painel Administrativo
          </h1>
          <p className="text-gray-400 font-light">Gerencie usuários e defina status de influencers</p>
        </div>

        {/* Search Bar */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#8b5cf6] focus:ring-[#8b5cf6]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-light mb-1">Total de Usuários</p>
                  <p className="text-3xl font-light text-white">{users?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-[#8b5cf6]" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-light mb-1">Influencers</p>
                  <p className="text-3xl font-light text-white">
                    {users?.filter(u => u.isInfluencer).length || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-light mb-1">Jornalistas</p>
                  <p className="text-3xl font-light text-white">
                    {users?.filter(u => u.userType === 'JOURNALIST').length || 0}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Users and Requests */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-1">
            <TabsTrigger 
              value="users" 
              className="font-light data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8b5cf6] data-[state=active]:to-[#6366f1] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 text-white/80 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/5"
            >
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="font-light data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8b5cf6] data-[state=active]:to-[#6366f1] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 text-white/80 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/5"
            >
              <Star className="h-4 w-4 mr-2" />
              Solicitações de Influencer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {/* Users List */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white font-light text-2xl">Usuários</CardTitle>
                <CardDescription className="text-gray-400 font-light">
                  Gerencie o status de influencer dos usuários
                </CardDescription>
              </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-lg bg-white/5" />
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] flex items-center justify-center text-white font-light text-lg">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="text-white font-light text-lg">{u.name}</p>
                            {getRoleBadge(u.userType)}
                            {u.isInfluencer && (
                              <Badge className="bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white border-0 shadow-md shadow-purple-500/20 font-light">
                                Influencer
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 font-light">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {u.userType !== 'ADMIN' && (
                          <Button
                            variant={u.isInfluencer ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => influencerMutation.mutate({ userId: u.id, isInfluencer: !u.isInfluencer })}
                            disabled={influencerMutation.isPending}
                            className={`font-light transition-all duration-300 ${
                              u.isInfluencer
                                ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20'
                                : 'bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white border-0 shadow-lg shadow-purple-500/20'
                            }`}
                          >
                            {influencerMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : u.isInfluencer ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Remover Influencer
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Tornar Influencer
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400 font-light">Nenhum usuário encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="requests">
            {/* Influencer Requests */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white font-light text-2xl">Solicitações de Influencer</CardTitle>
                <CardDescription className="text-gray-400 font-light">
                  Revise e aprove ou rejeite solicitações de usuários para se tornarem influencers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filter Buttons */}
                <div className="flex gap-2 mb-6">
                  <Button
                    variant={requestStatusFilter === 'PENDING' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRequestStatusFilter('PENDING')}
                    className={`font-light transition-all duration-300 ${
                      requestStatusFilter === 'PENDING'
                        ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white border-0 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Pendentes
                  </Button>
                  <Button
                    variant={requestStatusFilter === 'APPROVED' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRequestStatusFilter('APPROVED')}
                    className={`font-light transition-all duration-300 ${
                      requestStatusFilter === 'APPROVED'
                        ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white border-0 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovadas
                  </Button>
                  <Button
                    variant={requestStatusFilter === 'REJECTED' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRequestStatusFilter('REJECTED')}
                    className={`font-light transition-all duration-300 ${
                      requestStatusFilter === 'REJECTED'
                        ? 'bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white border-0 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitadas
                  </Button>
                </div>

                {isLoadingRequests ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 rounded-lg bg-white/5" />
                    ))}
                  </div>
                ) : influencerRequests && influencerRequests.length > 0 ? (
                  <div className="space-y-4">
                    {influencerRequests.map((request: any) => (
                      <div
                        key={request.id}
                        className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] flex items-center justify-center text-white font-light text-lg">
                              {request.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="text-white font-light text-lg">{request.user.name}</p>
                                <Badge
                                  className={`font-light ${
                                    request.status === 'PENDING'
                                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                      : request.status === 'APPROVED'
                                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                                  }`}
                                >
                                  {request.status === 'PENDING' && 'Pendente'}
                                  {request.status === 'APPROVED' && 'Aprovado'}
                                  {request.status === 'REJECTED' && 'Rejeitado'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400 font-light mb-3">{request.user.email}</p>
                              {request.reason && (
                                <div className="bg-white/5 rounded-lg p-3 mb-3">
                                  <p className="text-sm text-gray-300 font-light">{request.reason}</p>
                                </div>
                              )}
                              <p className="text-xs text-gray-500 font-light">
                                Solicitado em {new Date(request.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {request.reviewedAt && (
                                <p className="text-xs text-gray-500 font-light mt-1">
                                  Revisado em {new Date(request.reviewedAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                          {request.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => reviewRequestMutation.mutate({ requestId: request.id, status: 'APPROVED' })}
                                disabled={reviewRequestMutation.isPending}
                                className="font-light bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/20"
                              >
                                {reviewRequestMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Aprovar
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => reviewRequestMutation.mutate({ requestId: request.id, status: 'REJECTED' })}
                                disabled={reviewRequestMutation.isPending}
                                className="font-light bg-white/5 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50"
                              >
                                {reviewRequestMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Rejeitar
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400 font-light">
                      {requestStatusFilter === 'PENDING'
                        ? 'Nenhuma solicitação pendente'
                        : requestStatusFilter === 'APPROVED'
                        ? 'Nenhuma solicitação aprovada'
                        : 'Nenhuma solicitação rejeitada'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

