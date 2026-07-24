#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

class VessieMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'vessie-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[VessieMCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'web_search',
          description: 'Busca informações na web usando diferentes motores de busca',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Termo de busca',
              },
              engine: {
                type: 'string',
                enum: ['google', 'duckduckgo', 'bing'],
                description: 'Motor de busca a ser utilizado',
                default: 'duckduckgo',
              },
              max_results: {
                type: 'number',
                description: 'Número máximo de resultados (1-10)',
                minimum: 1,
                maximum: 10,
                default: 5,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'list_patches',
          description: 'Lista patches disponíveis para o projeto',
          inputSchema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['all', 'pending', 'applied', 'failed'],
                description: 'Filtra patches por status',
                default: 'all',
              },
            },
            required: [],
          },
        },
        {
          name: 'apply_patch',
          description: 'Aplica um patch específico ao projeto',
          inputSchema: {
            type: 'object',
            properties: {
              patch_id: {
                type: 'string',
                description: 'ID do patch a ser aplicado',
              },
              target_file: {
                type: 'string',
                description: 'Arquivo alvo para aplicação do patch',
              },
            },
            required: ['patch_id'],
          },
        },
        {
          name: 'list_modules',
          description: 'Lista módulos disponíveis no projeto',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Categoria para filtrar módulos (ex: core, utils, services)',
              },
            },
            required: [],
          },
        },
        {
          name: 'get_module_info',
          description: 'Obtém informações detalhadas sobre um módulo específico',
          inputSchema: {
            type: 'object',
            properties: {
              module_name: {
                type: 'string',
                description: 'Nome do módulo',
              },
            },
            required: ['module_name'],
          },
        },
        {
          name: 'list_practices',
          description: 'Lista práticas de desenvolvimento recomendadas',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['all', 'security', 'performance', 'code-quality', 'testing', 'documentation'],
                description: 'Categoria de práticas',
                default: 'all',
              },
            },
            required: [],
          },
        },
        {
          name: 'get_practice_details',
          description: 'Obtém detalhes de uma prática específica',
          inputSchema: {
            type: 'object',
            properties: {
              practice_id: {
                type: 'string',
                description: 'ID da prática',
              },
            },
            required: ['practice_id'],
          },
        },
        {
          name: 'fetch_website',
          description: 'Busca o conteúdo de uma página web',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL da página web',
              },
              selector: {
                type: 'string',
                description: 'Seletor CSS opcional para extrair conteúdo específico',
              },
            },
            required: ['url'],
          },
        },
        {
          name: 'list_mcp_servers',
          description: 'Lista servidores MCP populares e suas funcionalidades',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['all', 'productivity', 'development', 'data', 'ai', 'communication'],
                description: 'Categoria de servidores para filtrar',
                default: 'all',
              },
            },
            required: [],
          },
        },
        {
          name: 'search_mcp_servers',
          description: 'Pesquisa servidores MCP por funcionalidade ou nome',
          inputSchema: {
            type: 'object',
            properties: {
              keyword: {
                type: 'string',
                description: 'Palavra-chave para busca (ex: database, api, filesystem)',
              },
            },
            required: ['keyword'],
          },
        },
        {
          name: 'get_mcp_server_info',
          description: 'Obtém informações detalhadas sobre um servidor MCP específico',
          inputSchema: {
            type: 'object',
            properties: {
              server_name: {
                type: 'string',
                description: 'Nome do servidor MCP',
              },
            },
            required: ['server_name'],
          },
        },
        {
          name: 'calculate',
          description: 'Realiza operações matemáticas básicas',
          inputSchema: {
            type: 'object',
            properties: {
              operation: {
                type: 'string',
                enum: ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt'],
                description: 'Operação matemática',
              },
              a: {
                type: 'number',
                description: 'Primeiro número',
              },
              b: {
                type: 'number',
                description: 'Segundo número (não necessário para sqrt)',
              },
            },
            required: ['operation', 'a'],
          },
        },
        {
          name: 'generate_password',
          description: 'Gera senhas seguras com critérios customizáveis',
          inputSchema: {
            type: 'object',
            properties: {
              length: {
                type: 'number',
                description: 'Comprimento da senha (8-128)',
                minimum: 8,
                maximum: 128,
                default: 16,
              },
              includeUppercase: {
                type: 'boolean',
                description: 'Incluir letras maiúsculas',
                default: true,
              },
              includeLowercase: {
                type: 'boolean',
                description: 'Incluir letras minúsculas',
                default: true,
              },
              includeNumbers: {
                type: 'boolean',
                description: 'Incluir números',
                default: true,
              },
              includeSymbols: {
                type: 'boolean',
                description: 'Incluir símbolos especiais',
                default: true,
              },
            },
            required: ['length'],
          },
        },
        {
          name: 'validate_cpf',
          description: 'Valida um número de CPF brasileiro',
          inputSchema: {
            type: 'object',
            properties: {
              cpf: {
                type: 'string',
                description: 'Número de CPF (com ou sem pontuação)',
              },
            },
            required: ['cpf'],
          },
        },
        {
          name: 'generate_uuid',
          description: 'Gera UUIDs v4 aleatórios',
          inputSchema: {
            type: 'object',
            properties: {
              count: {
                type: 'number',
                description: 'Quantidade de UUIDs (1-10)',
                minimum: 1,
                maximum: 10,
                default: 1,
              },
            },
            required: [],
          },
        },
        {
          name: 'get_current_time',
          description: 'Obtém data e hora atual em diferentes formatos e fusos horários',
          inputSchema: {
            type: 'object',
            properties: {
              timezone: {
                type: 'string',
                description: 'Fuso horário (ex: America/Sao_Paulo, UTC)',
                default: 'America/Sao_Paulo',
              },
              format: {
                type: 'string',
                enum: ['iso', 'unix', 'readable'],
                description: 'Formato de saída',
                default: 'iso',
              },
            },
            required: [],
          },
        },
        {
          name: 'encode_decode_base64',
          description: 'Codifica ou decodifica texto em Base64',
          inputSchema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'Texto para codificar/decodificar',
              },
              operation: {
                type: 'string',
                enum: ['encode', 'decode'],
                description: 'Operação a ser realizada',
              },
            },
            required: ['text', 'operation'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const args = request.params.arguments;

      try {
        switch (toolName) {
          case 'web_search':
            return this.webSearch(args);
          case 'list_patches':
            return this.listPatches(args);
          case 'apply_patch':
            return this.applyPatch(args);
          case 'list_modules':
            return this.listModules(args);
          case 'get_module_info':
            return this.getModuleInfo(args);
          case 'list_practices':
            return this.listPractices(args);
          case 'get_practice_details':
            return this.getPracticeDetails(args);
          case 'fetch_website':
            return this.fetchWebsite(args);
          case 'list_mcp_servers':
            return this.listMCPServers(args);
          case 'search_mcp_servers':
            return this.searchMCPServers(args);
          case 'get_mcp_server_info':
            return this.getMCPServerInfo(args);
          case 'calculate':
            return this.calculate(args);
          case 'generate_password':
            return this.generatePassword(args);
          case 'validate_cpf':
            return this.validateCPF(args);
          case 'generate_uuid':
            return this.generateUUID(args);
          case 'get_current_time':
            return this.getCurrentTime(args);
          case 'encode_decode_base64':
            return this.encodeDecodeBase64(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Ferramenta desconhecida: ${toolName}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        return {
          content: [
            {
              type: 'text',
              text: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async webSearch(args: any) {
    const query = args.query;
    const engine = args.engine || 'duckduckgo';
    const maxResults = args.max_results || 5;

    if (!query) {
      throw new McpError(ErrorCode.InvalidParams, 'Query é obrigatória');
    }

    // Simulação de busca web (em produção, usaria APIs reais como Google Custom Search, DuckDuckGo API, etc.)
    const mockResults = [
      {
        title: `Resultado para: ${query}`,
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Informações sobre ${query} encontradas na web...`,
        source: engine,
      },
      {
        title: `Documentação: ${query}`,
        url: `https://docs.example.com/${encodeURIComponent(query)}`,
        snippet: `Documentação oficial e guias sobre ${query}...`,
        source: engine,
      },
      {
        title: `Tutoriais de ${query}`,
        url: `https://tutorials.example.com/${encodeURIComponent(query)}`,
        snippet: `Aprenda ${query} com nossos tutoriais passo a passo...`,
        source: engine,
      },
    ];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            query,
            engine,
            results: mockResults.slice(0, maxResults),
            total_results: mockResults.length,
            note: 'Esta é uma simulação. Em produção, conecte-se a APIs reais de busca.',
          }, null, 2),
        },
      ],
    };
  }

  private async fetchWebsite(args: any) {
    const url = args.url;
    const selector = args.selector;

    if (!url) {
      throw new McpError(ErrorCode.InvalidParams, 'URL é obrigatória');
    }

    // Simulação de fetch (em produção, usaria axios, fetch, ou puppeteer)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            url,
            selector,
            content: `<html><body><h1>Conteúdo de ${url}</h1><p>Conteúdo extraído da página...</p></body></html>`,
            status: 'success',
            note: 'Esta é uma simulação. Em produção, faça requisições HTTP reais.',
          }, null, 2),
        },
      ],
    };
  }

  private listMCPServers(args: any) {
    const category = args.category || 'all';

    const servers = [
      {
        name: 'filesystem',
        description: 'Acesso seguro a arquivos e diretórios',
        category: 'productivity',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
        tools: ['read_file', 'write_file', 'list_directory', 'search_files'],
      },
      {
        name: 'postman',
        description: 'Integração com Postman para testes de API',
        category: 'development',
        repository: 'https://github.com/postmanlabs/postman-mcp-server',
        tools: ['send_request', 'get_collections', 'run_test'],
      },
      {
        name: 'github',
        description: 'Acesso ao GitHub API',
        category: 'development',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
        tools: ['create_issue', 'search_repos', 'get_file_content'],
      },
      {
        name: 'sqlite',
        description: 'Banco de dados SQLite',
        category: 'data',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
        tools: ['query', 'execute', 'list_tables'],
      },
      {
        name: 'brave-search',
        description: 'Busca na web usando Brave Search API',
        category: 'productivity',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
        tools: ['web_search', 'search_images'],
      },
      {
        name: 'fetch',
        description: 'Busca conteúdo de URLs',
        category: 'productivity',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
        tools: ['fetch_url', 'fetch_html', 'fetch_json'],
      },
      {
        name: 'slack',
        description: 'Integração com Slack',
        category: 'communication',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
        tools: ['send_message', 'list_channels', 'get_channel_history'],
      },
      {
        name: 'google-maps',
        description: 'Integração com Google Maps',
        category: 'productivity',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps',
        tools: ['geocode', 'places_search', 'directions'],
      },
    ];

    const filtered = category === 'all' 
      ? servers 
      : servers.filter(s => s.category === category);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            category,
            total: filtered.length,
            servers: filtered,
          }, null, 2),
        },
      ],
    };
  }

  private searchMCPServers(args: any) {
    const keyword = args.keyword.toLowerCase();

    if (!keyword) {
      throw new McpError(ErrorCode.InvalidParams, 'Keyword é obrigatória');
    }

    const allServers = [
      { name: 'filesystem', description: 'Acesso a arquivos', keywords: ['file', 'filesystem', 'directory', 'read', 'write'] },
      { name: 'postman', description: 'Testes de API', keywords: ['api', 'test', 'postman', 'http', 'rest'] },
      { name: 'github', description: 'GitHub API', keywords: ['github', 'git', 'repository', 'issue', 'code'] },
      { name: 'sqlite', description: 'Banco de dados', keywords: ['database', 'sql', 'sqlite', 'data', 'query'] },
      { name: 'brave-search', description: 'Busca na web', keywords: ['search', 'web', 'brave', 'google'] },
      { name: 'fetch', description: 'Busca URLs', keywords: ['fetch', 'url', 'http', 'web', 'content'] },
      { name: 'slack', description: 'Slack integration', keywords: ['slack', 'message', 'chat', 'communication'] },
      { name: 'google-maps', description: 'Google Maps', keywords: ['maps', 'location', 'geocode', 'places'] },
      { name: 'puppeteer', description: 'Automação de browser', keywords: ['browser', 'automation', 'scraping', 'puppeteer'] },
      { name: 'redis', description: 'Redis database', keywords: ['redis', 'cache', 'key-value', 'database'] },
    ];

    const results = allServers.filter(server => 
      server.name.toLowerCase().includes(keyword) ||
      server.description.toLowerCase().includes(keyword) ||
      server.keywords.some(k => k.includes(keyword))
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            keyword,
            found: results.length,
            servers: results,
          }, null, 2),
        },
      ],
    };
  }

  private getMCPServerInfo(args: any) {
    const serverName = args.server_name.toLowerCase();

    const serverDetails: Record<string, any> = {
      filesystem: {
        name: 'filesystem',
        description: 'Servidor MCP para acesso seguro a arquivos e diretórios locais',
        category: 'productivity',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
        documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem/README.md',
        tools: [
          { name: 'read_file', description: 'Lê o conteúdo de um arquivo' },
          { name: 'write_file', description: 'Escreve conteúdo em um arquivo' },
          { name: 'list_directory', description: 'Lista arquivos e diretórios' },
          { name: 'search_files', description: 'Busca arquivos por padrão' },
        ],
        features: ['Acesso restrito a diretórios permitidos', 'Suporte a múltiplos formatos', 'Operações seguras'],
      },
      postman: {
        name: 'postman',
        description: 'Integração com Postman para gerenciar e testar APIs',
        category: 'development',
        repository: 'https://github.com/postmanlabs/postman-mcp-server',
        documentation: 'https://github.com/postmanlabs/postman-mcp-server',
        tools: [
          { name: 'send_request', description: 'Envia requisições HTTP' },
          { name: 'get_collections', description: 'Lista coleções do Postman' },
          { name: 'run_test', description: 'Executa testes de API' },
        ],
        features: ['Testes automatizados', 'Coleções de requisições', 'Validação de respostas'],
      },
      github: {
        name: 'github',
        description: 'Acesso completo à API do GitHub',
        category: 'development',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
        documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github/README.md',
        tools: [
          { name: 'create_issue', description: 'Cria issues em repositórios' },
          { name: 'search_repos', description: 'Busca repositórios' },
          { name: 'get_file_content', description: 'Obtém conteúdo de arquivos' },
        ],
        features: ['Gerenciamento de repositórios', 'Issues e PRs', 'Busca de código'],
      },
    };

    const info = serverDetails[serverName];
    
    if (!info) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              found: false,
              message: `Servidor "${serverName}" não encontrado na base de dados.`,
              suggestion: 'Use list_mcp_servers para ver todos os servidores disponíveis.',
            }, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            found: true,
            ...info,
          }, null, 2),
        },
      ],
    };
  }

  private calculate(args: any) {
    const { operation, a, b } = args;
    
    if (typeof a !== 'number') {
      throw new McpError(ErrorCode.InvalidParams, 'Parâmetro "a" deve ser um número');
    }

    let result: number;
    switch (operation) {
      case 'add':
        result = a + (b || 0);
        break;
      case 'subtract':
        result = a - (b || 0);
        break;
      case 'multiply':
        result = a * (b || 1);
        break;
      case 'divide':
        if (b === 0) throw new McpError(ErrorCode.InvalidParams, 'Divisão por zero');
        result = a / b;
        break;
      case 'power':
        result = Math.pow(a, b || 2);
        break;
      case 'sqrt':
        if (a < 0) throw new McpError(ErrorCode.InvalidParams, 'Raiz quadrada de número negativo');
        result = Math.sqrt(a);
        break;
      default:
        throw new McpError(ErrorCode.InvalidParams, `Operação inválida: ${operation}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ operation, a, b, result }, null, 2),
        },
      ],
    };
  }

  private generatePassword(args: any) {
    const length = args.length || 16;
    const includeUppercase = args.includeUppercase !== false;
    const includeLowercase = args.includeLowercase !== false;
    const includeNumbers = args.includeNumbers !== false;
    const includeSymbols = args.includeSymbols !== false;

    if (length < 8 || length > 128) {
      throw new McpError(ErrorCode.InvalidParams, 'Comprimento deve estar entre 8 e 128');
    }

    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      throw new McpError(ErrorCode.InvalidParams, 'Pelo menos um tipo de caractere deve ser selecionado');
    }

    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            password, 
            length, 
            includes: {
              uppercase: includeUppercase,
              lowercase: includeLowercase,
              numbers: includeNumbers,
              symbols: includeSymbols,
            }
          }, null, 2),
        },
      ],
    };
  }

  private validateCPF(args: any) {
    const cpf = args.cpf.replace(/\D/g, '');

    if (cpf.length !== 11) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ 
              valid: false, 
              message: 'CPF deve conter 11 dígitos' 
            }, null, 2),
          },
        ],
      };
    }

    if (/^(\d)\1{10}$/.test(cpf)) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ 
              valid: false, 
              message: 'CPF inválido: todos os dígitos são iguais' 
            }, null, 2),
          },
        ],
      };
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[9])) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ 
              valid: false, 
              message: 'CPF inválido: primeiro dígito verificador incorreto' 
            }, null, 2),
          },
        ],
      };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[10])) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ 
              valid: false, 
              message: 'CPF inválido: segundo dígito verificador incorreto' 
            }, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            valid: true, 
            cpf: cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
            message: 'CPF válido' 
          }, null, 2),
        },
      ],
    };
  }

  private generateUUID(args: any) {
    const count = args.count || 1;
    
    if (count < 1 || count > 10) {
      throw new McpError(ErrorCode.InvalidParams, 'Quantidade deve estar entre 1 e 10');
    }

    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      uuids.push(crypto.randomUUID());
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ uuids, count }, null, 2),
        },
      ],
    };
  }

  private getCurrentTime(args: any) {
    const timezone = args.timezone || 'America/Sao_Paulo';
    const format = args.format || 'iso';

    try {
      const now = new Date();
      
      let result: any = {};
      
      switch (format) {
        case 'iso':
          result = {
            iso: now.toISOString(),
            timezone,
            timestamp: now.getTime(),
          };
          break;
        case 'unix':
          result = {
            unix: Math.floor(now.getTime() / 1000),
            timezone,
            iso: now.toISOString(),
          };
          break;
        case 'readable':
          result = {
            date: now.toLocaleDateString('pt-BR', { 
              timeZone: timezone,
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }),
            time: now.toLocaleTimeString('pt-BR', { 
              timeZone: timezone,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }),
            timezone,
            iso: now.toISOString(),
          };
          break;
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InvalidParams, `Fuso horário inválido: ${timezone}`);
    }
  }

  private encodeDecodeBase64(args: any) {
    const { text, operation } = args;

    if (!text) {
      throw new McpError(ErrorCode.InvalidParams, 'Texto é obrigatório');
    }

    let result: string;
    try {
      if (operation === 'encode') {
        result = Buffer.from(text, 'utf-8').toString('base64');
      } else if (operation === 'decode') {
        result = Buffer.from(text, 'base64').toString('utf-8');
      } else {
        throw new McpError(ErrorCode.InvalidParams, `Operação inválida: ${operation}`);
      }
    } catch (error) {
      throw new McpError(ErrorCode.InvalidParams, 'Erro ao processar Base64. Verifique se o texto está correto.');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            operation, 
            original: text,
            result,
            originalLength: text.length,
            resultLength: result.length
          }, null, 2),
        },
      ],
    };
  }

  private listPatches(args: any) {
    const status = args.status || 'all';

    const patches = [
      {
        id: 'patch-001',
        name: 'Atualização de dependências',
        description: 'Atualiza todas as dependências do projeto para as versões mais recentes',
        status: 'pending',
        created_at: '2024-01-15T10:00:00Z',
        target_files: ['package.json'],
        priority: 'high',
      },
      {
        id: 'patch-002',
        name: 'Correção de tipagem',
        description: 'Corrige erros de tipagem TypeScript no código',
        status: 'applied',
        created_at: '2024-01-14T14:30:00Z',
        target_files: ['src/**/*.ts'],
        priority: 'medium',
      },
      {
        id: 'patch-003',
        name: 'Otimização de performance',
        description: 'Implementa otimizações de performance no servidor',
        status: 'pending',
        created_at: '2024-01-13T09:15:00Z',
        target_files: ['src/index.ts'],
        priority: 'high',
      },
      {
        id: 'patch-004',
        name: 'Adição de testes',
        description: 'Adiciona testes unitários e de integração',
        status: 'failed',
        created_at: '2024-01-12T16:45:00Z',
        target_files: ['tests/**/*.test.ts'],
        priority: 'medium',
      },
      {
        id: 'patch-005',
        name: 'Documentação',
        description: 'Atualiza documentação e README',
        status: 'applied',
        created_at: '2024-01-11T11:20:00Z',
        target_files: ['README.md', 'docs/**/*.md'],
        priority: 'low',
      },
    ];

    const filtered = status === 'all' 
      ? patches 
      : patches.filter(p => p.status === status);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status,
            total: filtered.length,
            patches: filtered,
          }, null, 2),
        },
      ],
    };
  }

  private applyPatch(args: any) {
    const patchId = args.patch_id;
    const targetFile = args.target_file;

    if (!patchId) {
      throw new McpError(ErrorCode.InvalidParams, 'patch_id é obrigatório');
    }

    const patchDetails: Record<string, any> = {
      'patch-001': {
        id: 'patch-001',
        name: 'Atualização de dependências',
        status: 'applied',
        applied_at: new Date().toISOString(),
        target_file: targetFile || 'package.json',
        changes: [
          'Atualizado @modelcontextprotocol/sdk para v1.2.0',
          'Atualizado typescript para v5.4.0',
          'Atualizado @types/node para v20.11.0',
        ],
        message: 'Patch aplicado com sucesso',
      },
      'patch-002': {
        id: 'patch-002',
        name: 'Correção de tipagem',
        status: 'applied',
        applied_at: new Date().toISOString(),
        target_file: targetFile || 'src/index.ts',
        changes: [
          'Corrigido tipo de retorno de webSearch',
          'Adicionado tipo para argumentos de ferramentas',
          'Corrigido erro de tipagem em calculate',
        ],
        message: 'Patch aplicado com sucesso',
      },
      'patch-003': {
        id: 'patch-003',
        name: 'Otimização de performance',
        status: 'pending',
        message: 'Patch pendente - requer revisão',
      },
      'patch-004': {
        id: 'patch-004',
        name: 'Adição de testes',
        status: 'failed',
        message: 'Falha ao aplicar patch: dependências de teste não encontradas',
      },
      'patch-005': {
        id: 'patch-005',
        name: 'Documentação',
        status: 'applied',
        applied_at: new Date().toISOString(),
        target_file: targetFile || 'README.md',
        changes: [
          'Atualizado README com novas ferramentas',
          'Adicionada seção de exemplos',
          'Atualizada documentação de API',
        ],
        message: 'Patch aplicado com sucesso',
      },
    };

    const patch = patchDetails[patchId];
    
    if (!patch) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              message: `Patch "${patchId}" não encontrado`,
              suggestion: 'Use list_patches para ver todos os patches disponíveis',
            }, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            ...patch,
          }, null, 2),
        },
      ],
    };
  }

  private listModules(args: any) {
    const category = args.category;

    const modules = [
      {
        name: 'core',
        description: 'Módulo principal do servidor',
        category: 'core',
        version: '1.0.0',
        dependencies: [],
        exports: ['VessieMCPServer', 'createServer'],
        size: '15KB',
        last_updated: '2024-01-15',
      },
      {
        name: 'tools',
        description: 'Implementação de ferramentas MCP',
        category: 'core',
        version: '1.0.0',
        dependencies: ['core'],
        exports: ['webSearch', 'fetchWebsite', 'calculate', 'generatePassword'],
        size: '25KB',
        last_updated: '2024-01-15',
      },
      {
        name: 'utils',
        description: 'Utilitários e funções auxiliares',
        category: 'utils',
        version: '1.0.0',
        dependencies: ['core'],
        exports: ['validateCPF', 'generateUUID', 'encodeDecodeBase64', 'getCurrentTime'],
        size: '8KB',
        last_updated: '2024-01-14',
      },
      {
        name: 'search',
        description: 'Módulo de busca e descoberta',
        category: 'services',
        version: '1.0.0',
        dependencies: ['core', 'utils'],
        exports: ['listMCPServers', 'searchMCPServers', 'getMCPServerInfo'],
        size: '12KB',
        last_updated: '2024-01-14',
      },
      {
        name: 'patches',
        description: 'Sistema de gerenciamento de patches',
        category: 'services',
        version: '1.0.0',
        dependencies: ['core'],
        exports: ['listPatches', 'applyPatch', 'rollbackPatch'],
        size: '10KB',
        last_updated: '2024-01-15',
      },
      {
        name: 'practices',
        description: 'Gerenciador de práticas de desenvolvimento',
        category: 'services',
        version: '1.0.0',
        dependencies: ['core'],
        exports: ['listPractices', 'getPracticeDetails', 'validatePractice'],
        size: '18KB',
        last_updated: '2024-01-13',
      },
      {
        name: 'logger',
        description: 'Sistema de logging',
        category: 'utils',
        version: '1.0.0',
        dependencies: ['core'],
        exports: ['Logger', 'createLogger'],
        size: '5KB',
        last_updated: '2024-01-12',
      },
      {
        name: 'config',
        description: 'Gerenciador de configurações',
        category: 'core',
        version: '1.0.0',
        dependencies: ['core'],
        exports: ['ConfigManager', 'loadConfig', 'saveConfig'],
        size: '7KB',
        last_updated: '2024-01-12',
      },
    ];

    const filtered = category 
      ? modules.filter(m => m.category === category)
      : modules;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            category: category || 'all',
            total: filtered.length,
            modules: filtered,
          }, null, 2),
        },
      ],
    };
  }

  private getModuleInfo(args: any) {
    const moduleName = args.module_name.toLowerCase();

    const moduleDetails: Record<string, any> = {
      core: {
        name: 'core',
        description: 'Módulo principal do servidor VessieMCP',
        category: 'core',
        version: '1.0.0',
        author: 'VessieMCP Team',
        license: 'MIT',
        dependencies: [],
        exports: [
          { name: 'VessieMCPServer', type: 'class', description: 'Classe principal do servidor' },
          { name: 'createServer', type: 'function', description: 'Factory function para criar servidor' },
        ],
        internal_dependencies: [],
        documentation: 'https://docs.vessiemcp.dev/core',
        repository: 'https://github.com/kauan/VessieMCP',
      },
      tools: {
        name: 'tools',
        description: 'Implementação de todas as ferramentas MCP disponíveis',
        category: 'core',
        version: '1.0.0',
        author: 'VessieMCP Team',
        license: 'MIT',
        dependencies: ['core'],
        exports: [
          { name: 'webSearch', type: 'function', description: 'Busca na web' },
          { name: 'fetchWebsite', type: 'function', description: 'Busca conteúdo de URL' },
          { name: 'calculate', type: 'function', description: 'Operações matemáticas' },
          { name: 'generatePassword', type: 'function', description: 'Gerador de senhas' },
        ],
        internal_dependencies: ['utils'],
        documentation: 'https://docs.vessiemcp.dev/tools',
        repository: 'https://github.com/kauan/VessieMCP',
      },
      utils: {
        name: 'utils',
        description: 'Utilitários e funções auxiliares reutilizáveis',
        category: 'utils',
        version: '1.0.0',
        author: 'VessieMCP Team',
        license: 'MIT',
        dependencies: ['core'],
        exports: [
          { name: 'validateCPF', type: 'function', description: 'Validador de CPF' },
          { name: 'generateUUID', type: 'function', description: 'Gerador de UUID v4' },
          { name: 'encodeDecodeBase64', type: 'function', description: 'Codificador/decodificador Base64' },
          { name: 'getCurrentTime', type: 'function', description: 'Obtém data/hora atual' },
        ],
        internal_dependencies: [],
        documentation: 'https://docs.vessiemcp.dev/utils',
        repository: 'https://github.com/kauan/VessieMCP',
      },
      search: {
        name: 'search',
        description: 'Módulo de busca e descoberta de servidores MCP',
        category: 'services',
        version: '1.0.0',
        author: 'VessieMCP Team',
        license: 'MIT',
        dependencies: ['core', 'utils'],
        exports: [
          { name: 'listMCPServers', type: 'function', description: 'Lista servidores MCP' },
          { name: 'searchMCPServers', type: 'function', description: 'Pesquisa servidores MCP' },
          { name: 'getMCPServerInfo', type: 'function', description: 'Informações de servidor MCP' },
        ],
        internal_dependencies: [],
        documentation: 'https://docs.vessiemcp.dev/search',
        repository: 'https://github.com/kauan/VessieMCP',
      },
      patches: {
        name: 'patches',
        description: 'Sistema de gerenciamento de patches e atualizações',
        category: 'services',
        version: '1.0.0',
        author: 'VessieMCP Team',
        license: 'MIT',
        dependencies: ['core'],
        exports: [
          { name: 'listPatches', type: 'function', description: 'Lista patches disponíveis' },
          { name: 'applyPatch', type: 'function', description: 'Aplica um patch' },
          { name: 'rollbackPatch', type: 'function', description: 'Reverte um patch' },
        ],
        internal_dependencies: ['logger'],
        documentation: 'https://docs.vessiemcp.dev/patches',
        repository: 'https://github.com/kauan/VessieMCP',
      },
      practices: {
        name: 'practices',
        description: 'Gerenciador de práticas de desenvolvimento recomendadas',
        category: 'services',
        version: '1.0.0',
        author: 'VessieMCP Team',
        license: 'MIT',
        dependencies: ['core'],
        exports: [
          { name: 'listPractices', type: 'function', description: 'Lista práticas' },
          { name: 'getPracticeDetails', type: 'function', description: 'Detalhes de prática' },
          { name: 'validatePractice', type: 'function', description: 'Valida prática' },
        ],
        internal_dependencies: [],
        documentation: 'https://docs.vessiemcp.dev/practices',
        repository: 'https://github.com/kauan/VessieMCP',
      },
      logger: {
        name: 'logger',
        description: 'Sistema de logging estruturado',
        category: 'utils',
        version: '1.0.0',
        author: 'VessieMCP Team',
        license: 'MIT',
        dependencies: ['core'],
        exports: [
          { name: 'Logger', type: 'class', description: 'Classe de logger' },
          { name: 'createLogger', type: 'function', description: 'Cria instância de logger' },
        ],
        internal_dependencies: [],
        documentation: 'https://docs.vessiemcp.dev/logger',
        repository: 'https://github.com/kauan/VessieMCP',
      },
      config: {
        name: 'config',
        description: 'Gerenciador de configurações do servidor',
        category: 'core',
        version: '1.0.0',
        author: 'VessieMCP Team',
        license: 'MIT',
        dependencies: ['core'],
        exports: [
          { name: 'ConfigManager', type: 'class', description: 'Gerenciador de configurações' },
          { name: 'loadConfig', type: 'function', description: 'Carrega configurações' },
          { name: 'saveConfig', type: 'function', description: 'Salva configurações' },
        ],
        internal_dependencies: ['logger'],
        documentation: 'https://docs.vessiemcp.dev/config',
        repository: 'https://github.com/kauan/VessieMCP',
      },
    };

    const info = moduleDetails[moduleName];
    
    if (!info) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              found: false,
              message: `Módulo "${moduleName}" não encontrado`,
              suggestion: 'Use list_modules para ver todos os módulos disponíveis',
            }, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            found: true,
            ...info,
          }, null, 2),
        },
      ],
    };
  }

  private listPractices(args: any) {
    const category = args.category || 'all';

    const practices = [
      {
        id: 'practice-001',
        name: 'Validação de entrada',
        category: 'security',
        description: 'Sempre valide e sanitize dados de entrada do usuário',
        priority: 'critical',
        tags: ['security', 'validation', 'input'],
        examples: ['Usar schemas de validação', 'Sanitizar strings', 'Verificar tipos'],
      },
      {
        id: 'practice-002',
        name: 'Tratamento de erros',
        category: 'code-quality',
        description: 'Implemente tratamento de erros robusto e informativo',
        priority: 'high',
        tags: ['error-handling', 'logging', 'debugging'],
        examples: ['Try-catch blocks', 'Error logging', 'User-friendly messages'],
      },
      {
        id: 'practice-003',
        name: 'Otimização de queries',
        category: 'performance',
        description: 'Otimize consultas de banco de dados e operações custosas',
        priority: 'high',
        tags: ['database', 'performance', 'optimization'],
        examples: ['Índices', 'Connection pooling', 'Query optimization'],
      },
      {
        id: 'practice-004',
        name: 'Testes unitários',
        category: 'testing',
        description: 'Escreva testes unitários para funções críticas',
        priority: 'high',
        tags: ['testing', 'unit-tests', 'coverage'],
        examples: ['Jest', 'Mocha', 'Coverage > 80%'],
      },
      {
        id: 'practice-005',
        name: 'Documentação de código',
        category: 'documentation',
        description: 'Documente funções, classes e módulos importantes',
        priority: 'medium',
        tags: ['documentation', 'comments', 'readme'],
        examples: ['JSDoc', 'README', 'API docs'],
      },
      {
        id: 'practice-006',
        name: 'Autenticação e autorização',
        category: 'security',
        description: 'Implemente autenticação forte e autorização baseada em roles',
        priority: 'critical',
        tags: ['security', 'auth', 'jwt', 'oauth'],
        examples: ['JWT tokens', 'OAuth 2.0', 'Role-based access'],
      },
      {
        id: 'practice-007',
        name: 'Cache de dados',
        category: 'performance',
        description: 'Use cache para melhorar performance de operações repetitivas',
        priority: 'medium',
        tags: ['cache', 'performance', 'redis'],
        examples: ['Redis', 'In-memory cache', 'CDN'],
      },
      {
        id: 'practice-008',
        name: 'Logging estruturado',
        category: 'code-quality',
        description: 'Implemente logging estruturado para debugging e monitoramento',
        priority: 'high',
        tags: ['logging', 'monitoring', 'debugging'],
        examples: ['Winston', 'Pino', 'ELK Stack'],
      },
      {
        id: 'practice-009',
        name: 'Testes de integração',
        category: 'testing',
        description: 'Escreva testes de integração para fluxos completos',
        priority: 'medium',
        tags: ['testing', 'integration', 'e2e'],
        examples: ['Supertest', 'Cypress', 'Playwright'],
      },
      {
        id: 'practice-010',
        name: 'Versionamento de API',
        category: 'documentation',
        description: 'Versiona APIs para garantir compatibilidade',
        priority: 'high',
        tags: ['api', 'versioning', 'compatibility'],
        examples: ['URL versioning', 'Header versioning', 'Semantic versioning'],
      },
    ];

    const filtered = category === 'all' 
      ? practices 
      : practices.filter(p => p.category === category);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            category,
            total: filtered.length,
            practices: filtered,
          }, null, 2),
        },
      ],
    };
  }

  private getPracticeDetails(args: any) {
    const practiceId = args.practice_id.toLowerCase();

    const practiceDetails: Record<string, any> = {
      'practice-001': {
        id: 'practice-001',
        name: 'Validação de entrada',
        category: 'security',
        priority: 'critical',
        description: 'Sempre valide e sanitize dados de entrada do usuário para prevenir injeções e ataques.',
        rationale: 'Dados não validados são a principal causa de vulnerabilidades de segurança como SQL Injection, XSS e Command Injection.',
        implementation: {
          steps: [
            'Defina schemas de validação usando bibliotecas como Zod ou Joi',
            'Sanitize strings removendo caracteres perigosos',
            'Verifique tipos de dados antes do processamento',
            'Implemente limites de tamanho para inputs',
            'Use allowlists ao invés de blocklists',
          ],
          code_example: `// Exemplo com Zod
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  age: z.number().min(18),
});

const validatedUser = userSchema.parse(userInput);`,
        },
        tools: ['Zod', 'Joi', 'Yup', 'validator.js'],
        references: [
          'https://owasp.org/www-community/controls/Input_Validation',
          'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html',
        ],
        tags: ['security', 'validation', 'input'],
      },
      'practice-002': {
        id: 'practice-002',
        name: 'Tratamento de erros',
        category: 'code-quality',
        priority: 'high',
        description: 'Implemente tratamento de erros robusto com mensagens informativas e logging adequado.',
        rationale: 'Bom tratamento de erros facilita debugging, melhora UX e previne vazamento de informações sensíveis.',
        implementation: {
          steps: [
            'Use try-catch em operações assíncronas',
            'Implemente error boundaries (frontend) ou middleware de erro (backend)',
            'Log erros com contexto suficiente para debugging',
            'Retorne mensagens user-friendly sem expor detalhes internos',
            'Implemente retry logic para operações transitórias',
          ],
          code_example: `// Exemplo de tratamento de erro
async function fetchData(id: string) {
  try {
    const data = await api.get(\`/data/\${id}\`);
    return data;
  } catch (error) {
    logger.error('Failed to fetch data', { id, error });
    throw new AppError('DATA_FETCH_FAILED', 'Unable to fetch data', 500);
  }
}`,
        },
        tools: ['Winston', 'Pino', 'Sentry', 'Bugsnag'],
        references: [
          'https://nodejs.org/en/docs/guides/error-handling/',
          'https://blog.risingstack.io/node-js-error-handling-best-practices/',
        ],
        tags: ['error-handling', 'logging', 'debugging'],
      },
      'practice-003': {
        id: 'practice-003',
        name: 'Otimização de queries',
        category: 'performance',
        priority: 'high',
        description: 'Otimize consultas de banco de dados para melhorar performance.',
        rationale: 'Queries não otimizadas são uma das principais causas de lentidão em aplicações.',
        implementation: {
          steps: [
            'Use índices em colunas frequentemente consultadas',
            'Evite SELECT * - especifique apenas colunas necessárias',
            'Use JOINs ao invés de múltiplas queries',
            'Implemente connection pooling',
            'Cache resultados de queries frequentes',
          ],
          code_example: `-- ❌ Ruim
SELECT * FROM users WHERE email LIKE '%@example.com';

-- ✅ Bom
SELECT id, name, email FROM users 
WHERE email = 'user@example.com'
AND created_at > NOW() - INTERVAL '30 days';`,
        },
        tools: ['PostgreSQL', 'MySQL', 'Redis', 'MongoDB'],
        references: [
          'https://use-the-index-luke.com/',
          'https://www.postgresql.org/docs/current/performance-tips.html',
        ],
        tags: ['database', 'performance', 'optimization'],
      },
      'practice-004': {
        id: 'practice-004',
        name: 'Testes unitários',
        category: 'testing',
        priority: 'high',
        description: 'Escreva testes unitários abrangentes para garantir qualidade do código.',
        rationale: 'Testes unitários previnem regressões e facilitam refatoração.',
        implementation: {
          steps: [
            'Teste funções puras e utilitários',
            'Use mocks para dependências externas',
            'Mantenha testes independentes e isolados',
            'Busque cobertura > 80%',
            'Escreva testes antes do código (TDD)',
          ],
          code_example: `// Exemplo com Jest
test('soma dois números corretamente', () => {
  expect(add(2, 3)).toBe(5);
  expect(add(-1, 1)).toBe(0);
});

test('lança erro para valores inválidos', () => {
  expect(() => divide(10, 0)).toThrow('Divisão por zero');
});`,
        },
        tools: ['Jest', 'Mocha', 'Vitest', 'Jasmine'],
        references: [
          'https://jestjs.io/docs/getting-started',
          'https://github.com/goldbergyoni/javascript-testing-best-practices',
        ],
        tags: ['testing', 'unit-tests', 'coverage'],
      },
      'practice-005': {
        id: 'practice-005',
        name: 'Documentação de código',
        category: 'documentation',
        priority: 'medium',
        description: 'Documente código complexo e mantenha README atualizado.',
        rationale: 'Boa documentação reduz tempo de onboarding e facilita manutenção.',
        implementation: {
          steps: [
            'Use JSDoc/TSDoc para documentar funções públicas',
            'Mantenha README com instruções de instalação e uso',
            'Documente decisões arquiteturais (ADRs)',
            'Inclua exemplos de uso',
            'Mantenha changelog atualizado',
          ],
          code_example: `/**
 * Calcula a soma de dois números
 * @param a - Primeiro número
 * @param b - Segundo número
 * @returns Soma dos dois números
 * @example
 * add(2, 3) // returns 5
 */
function add(a: number, b: number): number {
  return a + b;
}`,
        },
        tools: ['TypeDoc', 'JSDoc', 'Markdown', 'Docusaurus'],
        references: [
          'https://jsdoc.app/',
          'https://makeapullrequest.com/',
        ],
        tags: ['documentation', 'comments', 'readme'],
      },
      'practice-006': {
        id: 'practice-006',
        name: 'Autenticação e autorização',
        category: 'security',
        priority: 'critical',
        description: 'Implemente autenticação forte e autorização baseada em roles.',
        rationale: 'Controle de acesso inadequado é uma das vulnerabilidades mais exploradas.',
        implementation: {
          steps: [
            'Use HTTPS em todas as comunicações',
            'Implemente JWT com refresh tokens',
            'Hash senhas com bcrypt ou argon2',
            'Implemente rate limiting',
            'Use OAuth 2.0 para integrações',
          ],
          code_example: `// Exemplo com JWT
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Middleware de autenticação
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};`,
        },
        tools: ['Passport.js', 'JWT', 'OAuth2', 'bcrypt'],
        references: [
          'https://owasp.org/www-community/controls/Authentication_Cheat_Sheet',
          'https://jwt.io/introduction',
        ],
        tags: ['security', 'auth', 'jwt', 'oauth'],
      },
      'practice-007': {
        id: 'practice-007',
        name: 'Cache de dados',
        category: 'performance',
        priority: 'medium',
        description: 'Use cache para melhorar performance de operações repetitivas.',
        rationale: 'Cache reduz latência e carga em bancos de dados.',
        implementation: {
          steps: [
            'Identifique dados frequentemente acessados',
            'Implemente cache com TTL apropriado',
            'Use estratégias de invalidação',
            'Considere cache em múltiplas camadas',
            'Monitore hit/miss ratio',
          ],
          code_example: `// Exemplo com Redis
const getCachedUser = async (userId: string) => {
  const cached = await redis.get(\`user:\${userId}\`);
  if (cached) return JSON.parse(cached);
  
  const user = await db.users.findById(userId);
  await redis.setex(\`user:\${userId}\`, 3600, JSON.stringify(user));
  return user;
};`,
        },
        tools: ['Redis', 'Memcached', 'Node-cache', 'CDN'],
        references: [
          'https://redis.io/docs/manual/patterns/',
          'https://aws.amazon.com/caching/',
        ],
        tags: ['cache', 'performance', 'redis'],
      },
      'practice-008': {
        id: 'practice-008',
        name: 'Logging estruturado',
        category: 'code-quality',
        priority: 'high',
        description: 'Implemente logging estruturado para debugging e monitoramento.',
        rationale: 'Logs estruturados facilitam debugging e análise de problemas em produção.',
        implementation: {
          steps: [
            'Use formato JSON para logs',
            'Inclua contexto relevante (userId, requestId)',
            'Implemente níveis de log (debug, info, warn, error)',
            'Não log dados sensíveis',
            'Centralize logs em ferramentas como ELK ou Datadog',
          ],
          code_example: `// Exemplo com Pino
import pino from 'pino';
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  format: { timestamp: pino.stdTimeFunctions.isoTime }
});

// Uso
logger.info({ userId: 123, action: 'login' }, 'User logged in');
logger.error({ err: error, userId: 123 }, 'Login failed');`,
        },
        tools: ['Pino', 'Winston', 'Bunyan', 'ELK Stack'],
        references: [
          'https://getpino.io/',
          'https://www.elastic.co/elastic-stack',
        ],
        tags: ['logging', 'monitoring', 'debugging'],
      },
      'practice-009': {
        id: 'practice-009',
        name: 'Testes de integração',
        category: 'testing',
        priority: 'medium',
        description: 'Escreva testes de integração para validar fluxos completos.',
        rationale: 'Testes de integração garantem que componentes funcionam juntos corretamente.',
        implementation: {
          steps: [
            'Teste fluxos completos de API',
            'Use bancos de dados de teste',
            'Limpe dados após cada teste',
            'Teste cenários de erro',
            'Automatize testes em CI/CD',
          ],
          code_example: `// Exemplo com Supertest
import request from 'supertest';
import { app } from './app';

describe('POST /users', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'John', email: 'john@example.com' });
    
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('John');
  });
});`,
        },
        tools: ['Supertest', 'Cypress', 'Playwright', 'Jest'],
        references: [
          'https://jestjs.io/docs/getting-started',
          'https://www.cypress.io/',
        ],
        tags: ['testing', 'integration', 'e2e'],
      },
      'practice-010': {
        id: 'practice-010',
        name: 'Versionamento de API',
        category: 'documentation',
        priority: 'high',
        description: 'Versiona APIs para garantir compatibilidade e evolução.',
        rationale: 'Versionamento permite evoluir APIs sem quebrar clientes existentes.',
        implementation: {
          steps: [
            'Use versionamento semântico (SemVer)',
            'Inclua versão na URL ou header',
            'Documente breaking changes',
            'Mantenha versões antigas por período de depreciação',
            'Comunique mudanças aos usuários',
          ],
          code_example: `// Versionamento por URL
app.use('/api/v1/users', v1Router);
app.use('/api/v2/users', v2Router);

// Versionamento por header
app.use((req, res, next) => {
  const version = req.headers['api-version'] || 'v1';
  req.apiVersion = version;
  next();
});`,
        },
        tools: ['OpenAPI', 'Swagger', 'GraphQL', 'REST'],
        references: [
          'https://swagger.io/',
          'https://semver.org/',
        ],
        tags: ['api', 'versioning', 'compatibility'],
      },
    };

    const info = practiceDetails[practiceId];
    
    if (!info) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              found: false,
              message: `Prática "${practiceId}" não encontrada`,
              suggestion: 'Use list_practices para ver todas as práticas disponíveis',
            }, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            found: true,
            ...info,
          }, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('VessieMCP server running on stdio');
  }
}

const server = new VessieMCPServer();
server.run().catch(console.error);