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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('VessieMCP server running on stdio');
  }
}

const server = new VessieMCPServer();
server.run().catch(console.error);