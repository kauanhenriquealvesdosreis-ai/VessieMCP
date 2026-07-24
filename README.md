# VessieMCP

Servidor MCP (Model Context Protocol) completo com busca na web, descoberta de servidores MCP e utilitários diversos.

## 🚀 Funcionalidades

### 🔍 Busca na Web
- **web_search**: Busca informações na web usando diferentes motores de busca (Google, DuckDuckGo, Bing)
- **fetch_website**: Busca e extrai conteúdo de páginas web

### 🌐 Descoberta de Servidores MCP
- **list_mcp_servers**: Lista servidores MCP populares por categoria
- **search_mcp_servers**: Pesquisa servidores MCP por funcionalidade ou nome
- **get_mcp_server_info**: Obtém informações detalhadas sobre servidores específicos

### 📦 Patches
- **list_patches**: Lista patches disponíveis para o projeto
- **apply_patch**: Aplica um patch específico ao projeto

### 🧩 Módulos
- **list_modules**: Lista módulos disponíveis no projeto
- **get_module_info**: Obtém informações detalhadas sobre um módulo específico

### 📚 Práticas de Desenvolvimento
- **list_practices**: Lista práticas de desenvolvimento recomendadas
- **get_practice_details**: Obtém detalhes de uma prática específica

### 🛠️ Utilitários
- **calculate**: Operações matemáticas básicas (add, subtract, multiply, divide, power, sqrt)
- **generate_password**: Gera senhas seguras customizáveis
- **validate_cpf**: Valida números de CPF brasileiro
- **generate_uuid**: Gera UUIDs v4 aleatórios
- **get_current_time**: Data/hora atual em diferentes formatos e fusos horários
- **encode_decode_base64**: Codifica e decodifica texto em Base64

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/kauan/VessieMCP.git
cd VessieMCP
```

2. Instale as dependências:
```bash
npm install
```

3. Compile o projeto:
```bash
npm run build
```

4. Configure no arquivo de settings do MCP:
   
   Adicione ao arquivo `cline_mcp_settings.json`:
   ```json
   {
     "mcpServers": {
       "vessie-mcp": {
         "command": "node",
         "args": ["C:\\Users\\kauan\\Documents\\GitHub\\VessieMCP\\build\\index.js"],
         "enabled": true,
         "autoApprove": []
       }
     }
   }
   ```

## 🛠️ Desenvolvimento

### Estrutura do Projeto
```
VessieMCP/
├── src/
│   └── index.ts          # Código fonte principal
├── build/
│   └── index.js          # Código compilado
├── package.json
├── tsconfig.json
├── README.md
├── .gitignore
└── LICENSE
```

### Scripts Disponíveis

- `npm run build` - Compila o projeto TypeScript
- `npm run watch` - Compila em modo watch
- `npm start` - Executa o servidor compilado
- `npm run dev` - Compila em modo watch para desenvolvimento

## 🔧 Ferramentas Disponíveis

### web_search
Busca informações na web.
```json
{
  "query": "TypeScript tutorial",
  "engine": "duckduckgo",
  "max_results": 5
}
```

### fetch_website
Busca conteúdo de uma página web.
```json
{
  "url": "https://example.com",
  "selector": "h1"
}
```

### list_mcp_servers
Lista servidores MCP por categoria.
```json
{
  "category": "all"
}
```

### search_mcp_servers
Pesquisa servidores MCP.
```json
{
  "keyword": "database"
}
```

### get_mcp_server_info
Obtém informações detalhadas de um servidor.
```json
{
  "server_name": "github"
}
```

### calculate
Realiza operações matemáticas.
```json
{
  "operation": "add",
  "a": 10,
  "b": 5
}
```

### generate_password
Gera senhas seguras.
```json
{
  "length": 16,
  "includeUppercase": true,
  "includeLowercase": true,
  "includeNumbers": true,
  "includeSymbols": true
}
```

### validate_cpf
Valida CPF brasileiro.
```json
{
  "cpf": "123.456.789-09"
}
```

### generate_uuid
Gera UUIDs v4.
```json
{
  "count": 3
}
```

### get_current_time
Obtém data/hora atual.
```json
{
  "timezone": "America/Sao_Paulo",
  "format": "readable"
}
```

### encode_decode_base64
Codifica/decodifica Base64.
```json
{
  "text": "Hello World",
  "operation": "encode"
}
```

### list_patches
Lista patches disponíveis.
```json
{
  "status": "all"
}
```

### apply_patch
Aplica um patch específico.
```json
{
  "patch_id": "patch-001",
  "target_file": "package.json"
}
```

### list_modules
Lista módulos do projeto.
```json
{
  "category": "core"
}
```

### get_module_info
Obtém informações de um módulo.
```json
{
  "module_name": "core"
}
```

### list_practices
Lista práticas de desenvolvimento.
```json
{
  "category": "security"
}
```

### get_practice_details
Obtém detalhes de uma prática.
```json
{
  "practice_id": "practice-001"
}
```

## 🚀 Deploy

O servidor está configurado e pronto para uso. Após a compilação, ele será automaticamente carregado pelo sistema MCP.

## 📝 Notas

- Algumas ferramentas de busca web estão em modo simulação. Para produção, conecte-se a APIs reais como Google Custom Search, DuckDuckGo API, etc.
- O servidor utiliza o SDK oficial do Model Context Protocol
- Todas as ferramentas retornam dados em formato JSON

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👤 Autor

Desenvolvido como parte do projeto VessieMCP

---

⭐ Se este projeto foi útil para você, considere dar uma estrela!