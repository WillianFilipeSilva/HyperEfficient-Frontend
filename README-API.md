# HyperEfficient - Frontend

Este é o frontend do sistema HyperEfficient, desenvolvido com HTML, CSS e JavaScript puro, integrado com uma API REST.

## 📋 Páginas do Sistema

### 1. Página de Login (`login.html`)
- **Funcionalidade**: Autenticação de usuários
- **Integração**: Conecta com o endpoint `/api/usuarios/login`
- **Validações**: Email e senha obrigatórios
- **Redirecionamento**: Para dashboard após login bem-sucedido

### 2. Página de Cadastro (`cadastro.html`)
- **Funcionalidade**: Registro de novos usuários
- **Integração**: Conecta com o endpoint `/api/usuarios/cadastro`
- **Validações**: Nome, email e senha obrigatórios
- **Redirecionamento**: Para login após cadastro bem-sucedido

### 3. Dashboard (`dashboard.html`)
- **Funcionalidade**: Página principal do sistema
- **Proteção**: Rota protegida (requer autenticação)
- **Exibição**: Estatísticas e informações do usuário logado
- **Navegação**: Links para outras páginas do sistema

### 4. Perfil (`perfil.html`)
- **Funcionalidade**: Visualização e edição de dados do usuário
- **Proteção**: Rota protegida (requer autenticação)
- **Funcionalidades**: Editar nome, email e senha
- **Integração**: Conecta com o endpoint `/api/usuarios/atualizar`

### 5. Listagem (`listagem.html`)
- **Funcionalidade**: Exibição de tabelas de dados
- **Proteção**: Rota protegida (requer autenticação)
- **Conteúdo**: Tabela de autores com informações

## 🚀 Como Usar

### Primeira Execução
1. Abra a página de cadastro (`cadastro.html`)
2. Preencha os dados e crie sua conta
3. Abra a página de login (`login.html`)
4. Faça login com suas credenciais
5. Acesse o dashboard e explore o sistema

### Navegação
- **Dashboard**: Página principal com estatísticas
- **Listagem**: Visualizar tabelas de dados
- **Perfil**: Gerenciar dados pessoais
- **Logout**: Sair do sistema

## 📁 Estrutura de Arquivos

```
build/
├── assets/
│   ├── css/
│   │   ├── dashboard-tailwind.css
│   │   ├── nucleo-icons.css
│   │   ├── nucleo-svg.css
│   │   └── perfect-scrollbar.css
│   ├── js/
│   │   ├── api-config.js
│   │   ├── utils.js
│   │   ├── dashboard-tailwind.js
│   │   └── plugins/
│   │       └── perfect-scrollbar.min.js
│   └── img/
│       └── logo.svg
├── pages/
│   ├── dashboard.html              # Página principal
│   ├── login.html                  # Página de login
│   ├── cadastro.html               # Página de cadastro
│   ├── perfil.html                 # Página de perfil
│   └── listagem.html               # Página de listagem
└── README-API.md
```

## 🔧 Configuração da API

### Endpoints Utilizados
- `POST /api/usuarios/login` - Autenticação
- `POST /api/usuarios/cadastro` - Cadastro de usuários
- `PUT /api/usuarios/atualizar` - Atualização de dados

### Configuração
O arquivo `api-config.js` centraliza todas as configurações da API:
- URL base da API
- Funções de requisição autenticadas e públicas
- Utilitários de autenticação
- Tratamento de erros

## 🛠️ Utilitários

### Utils.js
Arquivo com funções utilitárias gerais:
- Validação de formulários
- Manipulação de UI/UX
- Gerenciamento de localStorage
- Funções de navegação
- Utilitários de strings e arrays

### Exemplo de Uso
```javascript
// Validação de formulário
const validation = Utils.validateForm(data, rules);

// Mostrar toast
Utils.showToast('Mensagem de sucesso!', 'success');

// Redirecionamento
Utils.redirect('../pages/login.html');
```

## 🔒 Segurança

### Proteção de Rotas
- Verificação de token de autenticação
- Redirecionamento automático para login
- Verificação de expiração do token

### Validação de Dados
- Validação client-side em todos os formulários
- Sanitização de inputs
- Tratamento de erros da API

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🎨 Design

- Interface moderna e intuitiva
- Tema escuro/claro
- Componentes reutilizáveis
- Animações suaves

## 🔄 Atualizações

### Versão 1.0.1
- Integração completa com API
- Sistema de autenticação
- Proteção de rotas
- Validação de formulários
- Interface responsiva

---

**Desenvolvido por HyperEfficient** - 2025