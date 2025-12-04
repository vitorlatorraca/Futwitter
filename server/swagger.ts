import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Futwitter API',
      version: '1.0.0',
      description: 'API do Futwitter - Rede social para torcedores do Brasileirão',
      contact: {
        name: 'Futwitter Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Servidor de desenvolvimento',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Autenticação de usuários' },
      { name: 'Teams', description: 'Gerenciamento de times' },
      { name: 'Matches', description: 'Partidas e jogos' },
      { name: 'News', description: 'Notícias e publicações' },
      { name: 'Players', description: 'Jogadores e avaliações' },
      { name: 'Profile', description: 'Perfil do usuário' },
      { name: 'Badges', description: 'Conquistas e badges' },
      { name: 'Admin', description: 'Rotas administrativas' },
      { name: 'Influencer', description: 'Solicitações de influencer' },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session cookie para autenticação',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            teamId: { type: 'string', nullable: true },
            userType: { type: 'string', enum: ['FAN', 'JOURNALIST', 'ADMIN'] },
            isInfluencer: { type: 'boolean' },
            avatarUrl: { type: 'string', nullable: true },
          },
        },
        Team: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            shortName: { type: 'string' },
            logoUrl: { type: 'string' },
            primaryColor: { type: 'string' },
            secondaryColor: { type: 'string' },
            currentPosition: { type: 'integer', nullable: true },
            points: { type: 'integer' },
            wins: { type: 'integer' },
            draws: { type: 'integer' },
            losses: { type: 'integer' },
            goalsFor: { type: 'integer' },
            goalsAgainst: { type: 'integer' },
          },
        },
        Player: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            teamId: { type: 'string' },
            name: { type: 'string' },
            photoUrl: { type: 'string', nullable: true },
            position: { type: 'string', enum: ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'] },
            jerseyNumber: { type: 'integer' },
            nationality: { type: 'string', nullable: true },
            sofascoreRating: { type: 'number', nullable: true },
            isActive: { type: 'boolean' },
          },
        },
        Match: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            teamId: { type: 'string' },
            opponent: { type: 'string' },
            opponentLogoUrl: { type: 'string', nullable: true },
            isHomeMatch: { type: 'boolean' },
            teamScore: { type: 'integer', nullable: true },
            opponentScore: { type: 'integer', nullable: true },
            matchDate: { type: 'string', format: 'date-time' },
            stadium: { type: 'string', nullable: true },
            championshipRound: { type: 'integer', nullable: true },
            status: { type: 'string' },
          },
        },
        News: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            journalistId: { type: 'string', nullable: true },
            userId: { type: 'string', nullable: true },
            teamId: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            imageUrl: { type: 'string', nullable: true },
            videoUrl: { type: 'string', nullable: true },
            contentType: { type: 'string', enum: ['TEXT', 'VIDEO'] },
            category: { type: 'string', enum: ['NEWS', 'ANALYSIS', 'BACKSTAGE', 'MARKET'] },
            likesCount: { type: 'integer' },
            dislikesCount: { type: 'integer' },
            isPublished: { type: 'boolean' },
            publishedAt: { type: 'string', format: 'date-time' },
          },
        },
        Badge: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' },
            condition: { type: 'string' },
            threshold: { type: 'integer' },
            unlocked: { type: 'boolean' },
            earnedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Transfer: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            teamId: { type: 'string' },
            playerName: { type: 'string' },
            playerPhotoUrl: { type: 'string', nullable: true },
            fromTeam: { type: 'string', nullable: true },
            toTeam: { type: 'string', nullable: true },
            transferType: { type: 'string' },
            transferFee: { type: 'string', nullable: true },
            transferDate: { type: 'string', format: 'date-time' },
            season: { type: 'string', nullable: true },
          },
        },
        InfluencerRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string' },
            reason: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
            reviewedBy: { type: 'string', nullable: true },
            reviewedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    paths: {
      // ============================================
      // AUTHENTICATION ROUTES
      // ============================================
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registrar novo usuário',
          description: 'Cria uma nova conta de usuário no sistema',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', minLength: 2, example: 'João Silva' },
                    email: { type: 'string', format: 'email', example: 'joao@email.com' },
                    password: { type: 'string', minLength: 6, example: 'senha123' },
                    teamId: { type: 'string', example: 'flamengo' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Usuário criado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            400: {
              description: 'Dados inválidos ou email já cadastrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login de usuário',
          description: 'Autentica um usuário existente',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'joao@email.com' },
                    password: { type: 'string', example: 'senha123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login realizado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            401: {
              description: 'Email ou senha incorretos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout de usuário',
          description: 'Encerra a sessão do usuário',
          security: [{ sessionAuth: [] }],
          responses: {
            200: {
              description: 'Logout realizado com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Logout realizado com sucesso' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Obter usuário atual',
          description: 'Retorna os dados do usuário autenticado',
          security: [{ sessionAuth: [] }],
          responses: {
            200: {
              description: 'Dados do usuário',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            401: {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },

      // ============================================
      // TEAMS ROUTES
      // ============================================
      '/api/teams': {
        get: {
          tags: ['Teams'],
          summary: 'Listar todos os times',
          description: 'Retorna a lista de todos os times do Brasileirão',
          responses: {
            200: {
              description: 'Lista de times',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Team' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/teams/{id}': {
        get: {
          tags: ['Teams'],
          summary: 'Obter time por ID',
          description: 'Retorna os detalhes de um time específico com seus jogadores',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do time (ex: flamengo, palmeiras)',
            },
          ],
          responses: {
            200: {
              description: 'Detalhes do time',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Team' },
                      {
                        type: 'object',
                        properties: {
                          players: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Player' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            404: {
              description: 'Time não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },

      // ============================================
      // MATCHES ROUTES
      // ============================================
      '/api/matches/{teamId}/recent': {
        get: {
          tags: ['Matches'],
          summary: 'Listar partidas recentes',
          description: 'Retorna as partidas recentes de um time',
          parameters: [
            {
              name: 'teamId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do time',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
              description: 'Número máximo de partidas',
            },
          ],
          responses: {
            200: {
              description: 'Lista de partidas',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Match' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/teams/{teamId}/last-match': {
        get: {
          tags: ['Matches'],
          summary: 'Obter última partida',
          description: 'Retorna a última partida jogada pelo time com informações dos jogadores',
          parameters: [
            {
              name: 'teamId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Última partida do time',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Match' },
                },
              },
            },
          },
        },
      },
      '/api/teams/{teamId}/upcoming': {
        get: {
          tags: ['Matches'],
          summary: 'Próximas partidas',
          description: 'Retorna as próximas partidas agendadas do time',
          parameters: [
            {
              name: 'teamId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 3 },
            },
          ],
          responses: {
            200: {
              description: 'Lista de próximas partidas',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Match' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/standings': {
        get: {
          tags: ['Matches'],
          summary: 'Classificação do campeonato',
          description: 'Retorna a tabela de classificação atual do Brasileirão',
          responses: {
            200: {
              description: 'Tabela de classificação',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Team' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/teams/{teamId}/transfers': {
        get: {
          tags: ['Teams'],
          summary: 'Transferências do time',
          description: 'Retorna as transferências recentes de um time',
          parameters: [
            {
              name: 'teamId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
            },
          ],
          responses: {
            200: {
              description: 'Lista de transferências',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Transfer' },
                  },
                },
              },
            },
          },
        },
      },

      // ============================================
      // NEWS ROUTES
      // ============================================
      '/api/news': {
        get: {
          tags: ['News'],
          summary: 'Listar notícias',
          description: 'Retorna a lista de notícias com filtros opcionais',
          parameters: [
            {
              name: 'teamId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filtrar por time específico',
            },
            {
              name: 'filter',
              in: 'query',
              schema: { type: 'string', enum: ['all', 'my-team'] },
              description: 'Filtro de notícias',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 50 },
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer', default: 0 },
            },
          ],
          responses: {
            200: {
              description: 'Lista de notícias',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/News' },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['News'],
          summary: 'Criar notícia',
          description: 'Cria uma nova notícia (apenas jornalistas e influencers)',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'content', 'teamId'],
                  properties: {
                    title: { type: 'string', minLength: 10, maxLength: 200 },
                    content: { type: 'string', minLength: 50, maxLength: 1000 },
                    teamId: { type: 'string' },
                    imageUrl: { type: 'string' },
                    videoUrl: { type: 'string' },
                    contentType: { type: 'string', enum: ['TEXT', 'VIDEO'] },
                    category: { type: 'string', enum: ['NEWS', 'ANALYSIS', 'BACKSTAGE', 'MARKET'] },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Notícia criada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/News' },
                },
              },
            },
            401: { description: 'Não autenticado' },
            403: { description: 'Acesso negado' },
          },
        },
      },
      '/api/news/my-news': {
        get: {
          tags: ['News'],
          summary: 'Minhas notícias',
          description: 'Retorna as notícias criadas pelo usuário autenticado',
          security: [{ sessionAuth: [] }],
          responses: {
            200: {
              description: 'Lista de notícias do usuário',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/News' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/news/{id}': {
        delete: {
          tags: ['News'],
          summary: 'Excluir notícia',
          description: 'Exclui uma notícia (apenas autor ou admin)',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Notícia excluída' },
            401: { description: 'Não autenticado' },
            403: { description: 'Acesso negado' },
          },
        },
      },
      '/api/news/{id}/interaction': {
        post: {
          tags: ['News'],
          summary: 'Interagir com notícia',
          description: 'Adiciona like ou dislike em uma notícia',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['type'],
                  properties: {
                    type: { type: 'string', enum: ['LIKE', 'DISLIKE'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Interação registrada' },
            401: { description: 'Não autenticado' },
          },
        },
      },

      // ============================================
      // PLAYER RATINGS ROUTES
      // ============================================
      '/api/players/{id}/ratings': {
        get: {
          tags: ['Players'],
          summary: 'Obter avaliações do jogador',
          description: 'Retorna todas as avaliações de um jogador',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Avaliações do jogador',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ratings: { type: 'array', items: { type: 'object' } },
                      average: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Players'],
          summary: 'Avaliar jogador',
          description: 'Cria uma avaliação para um jogador em uma partida',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['matchId', 'rating'],
                  properties: {
                    matchId: { type: 'string' },
                    rating: { type: 'number', minimum: 0, maximum: 10 },
                    comment: { type: 'string', maxLength: 200 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Avaliação criada' },
            401: { description: 'Não autenticado' },
          },
        },
      },

      // ============================================
      // PROFILE ROUTES
      // ============================================
      '/api/profile': {
        put: {
          tags: ['Profile'],
          summary: 'Atualizar perfil',
          description: 'Atualiza nome e email do usuário',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Perfil atualizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
      },
      '/api/profile/password': {
        put: {
          tags: ['Profile'],
          summary: 'Alterar senha',
          description: 'Altera a senha do usuário',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['currentPassword', 'newPassword'],
                  properties: {
                    currentPassword: { type: 'string' },
                    newPassword: { type: 'string', minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Senha alterada' },
            401: { description: 'Senha atual incorreta' },
          },
        },
      },
      '/api/profile/avatar': {
        put: {
          tags: ['Profile'],
          summary: 'Atualizar avatar',
          description: 'Atualiza a foto de perfil do usuário',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['avatarUrl'],
                  properties: {
                    avatarUrl: { type: 'string', description: 'URL da imagem ou base64' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Avatar atualizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
      },

      // ============================================
      // BADGES ROUTES
      // ============================================
      '/api/badges': {
        get: {
          tags: ['Badges'],
          summary: 'Listar badges',
          description: 'Retorna todas as badges com status de desbloqueio',
          security: [{ sessionAuth: [] }],
          responses: {
            200: {
              description: 'Lista de badges',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Badge' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/badges/check': {
        post: {
          tags: ['Badges'],
          summary: 'Verificar badges',
          description: 'Verifica e concede novas badges ao usuário',
          security: [{ sessionAuth: [] }],
          responses: {
            200: {
              description: 'Novas badges concedidas',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Badge' },
                  },
                },
              },
            },
          },
        },
      },

      // ============================================
      // ADMIN ROUTES
      // ============================================
      '/api/admin/users': {
        get: {
          tags: ['Admin'],
          summary: 'Listar usuários',
          description: 'Retorna todos os usuários (apenas admin)',
          security: [{ sessionAuth: [] }],
          responses: {
            200: {
              description: 'Lista de usuários',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
            403: { description: 'Acesso negado' },
          },
        },
      },
      '/api/admin/users/{id}/influencer': {
        put: {
          tags: ['Admin'],
          summary: 'Alterar status de influencer',
          description: 'Define se um usuário é influencer (apenas admin)',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['isInfluencer'],
                  properties: {
                    isInfluencer: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Status atualizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            403: { description: 'Acesso negado' },
          },
        },
      },
      '/api/admin/influencer-requests': {
        get: {
          tags: ['Admin'],
          summary: 'Listar solicitações de influencer',
          description: 'Retorna todas as solicitações de influencer (apenas admin)',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
            },
          ],
          responses: {
            200: {
              description: 'Lista de solicitações',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/InfluencerRequest' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/influencer-requests/{id}/review': {
        put: {
          tags: ['Admin'],
          summary: 'Revisar solicitação de influencer',
          description: 'Aprova ou rejeita uma solicitação de influencer',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Solicitação revisada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/InfluencerRequest' },
                },
              },
            },
          },
        },
      },

      // ============================================
      // INFLUENCER REQUEST ROUTES
      // ============================================
      '/api/influencer/request': {
        post: {
          tags: ['Influencer'],
          summary: 'Criar solicitação de influencer',
          description: 'Solicita para se tornar um influencer',
          security: [{ sessionAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reason: { type: 'string', maxLength: 500, description: 'Motivo da solicitação' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Solicitação criada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/InfluencerRequest' },
                },
              },
            },
            400: { description: 'Solicitação já existe' },
          },
        },
      },
      '/api/influencer/request/my': {
        get: {
          tags: ['Influencer'],
          summary: 'Minha solicitação de influencer',
          description: 'Retorna a solicitação de influencer do usuário',
          security: [{ sessionAuth: [] }],
          responses: {
            200: {
              description: 'Solicitação do usuário',
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      { $ref: '#/components/schemas/InfluencerRequest' },
                      { type: 'null' },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Futwitter API Documentation',
  }));

  // Endpoint to get the swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

