# ⚡ HyperEfficient - Sistema de Gestão Energética Inteligente

<div align="center">

![HyperEfficient Logo](assets/img/logo.svg)

**Sistema completo de monitoramento e gestão de consumo energético empresarial com integração IoT**

[![Backend](https://img.shields.io/badge/Backend-ASP.NET%20Core-512BD4?style=for-the-badge&logo=.net)](https://dotnet.microsoft.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS-F7DF1E?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Database](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![IoT](https://img.shields.io/badge/IoT-Tuya%20API-00D4AA?style=for-the-badge&logo=homeassistant)](https://developer.tuya.com/)

[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Produção-brightgreen?style=for-the-badge)](https://github.com/seu-usuario/HyperEfficient)

</div>

---

## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
- [🚀 Funcionalidades](#-funcionalidades)
- [🏗️ Arquitetura](#️-arquitetura)
- [🛠️ Tecnologias](#️-tecnologias)
- [📦 Instalação](#-instalação)
- [🔧 Configuração](#-configuração)
- [📱 Uso](#-uso)
- [🔌 Integração IoT](#-integração-iot)
- [📊 Dashboard](#-dashboard)
- [🔐 Segurança](#-segurança)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **HyperEfficient** é um sistema inovador de gestão energética desenvolvido como projeto acadêmico para o curso Entra21 (turma C). O sistema permite monitorar equipamentos elétricos em tempo real, registrar consumo energético, gerar relatórios detalhados e controlar custos por setor com uma arquitetura moderna e modular.

### ✨ Diferenciais

- 🔌 **Integração IoT**: Conecta-se com dispositivos inteligentes Tuya para monitoramento em tempo real
- 📊 **Dashboard Inteligente**: Interface moderna com gráficos interativos e análises avançadas
- 🤖 **Automação**: Background services para atualização automática de dados
- 📱 **Responsivo**: Interface adaptável para desktop e dispositivos móveis
- 🔒 **Seguro**: Autenticação JWT e criptografia PBKDF2

---

## 🚀 Funcionalidades

### 🔐 Autenticação e Usuários

- ✅ Cadastro e login de usuários
- ✅ Autenticação JWT com expiração configurável
- ✅ Criptografia PBKDF2 para senhas
- ✅ Sistema de "Lembrar de mim"
- ✅ Proteção de rotas com AuthGuard

### 🏢 Gestão Empresarial

- ✅ **Setores**: Organização por divisões da empresa
- ✅ **Categorias**: Classificação de equipamentos
- ✅ **Equipamentos**: Cadastro com integração IoT opcional
- ✅ **Registros**: Controle de uso com cálculo automático de consumo

### 🔌 Integração IoT (Tuya)

- ✅ **Monitoramento em Tempo Real**: Status atual de dispositivos
- ✅ **Controle Remoto**: Ligar/desligar equipamentos via API
- ✅ **Dados Reais**: Consumo energético real dos dispositivos
- ✅ **Atualização Automática**: Background service a cada 3 horas
- ✅ **Fallback Inteligente**: Cálculo manual para equipamentos sem IoT

### 📊 Dashboard e Relatórios

- ✅ **Dashboard Interativo**: Gráficos de consumo com Chart.js
- ✅ **Filtros Avançados**: Seleção de período com validação
- ✅ **Totalizadores Animados**: Cards com métricas em tempo real
- ✅ **Rankings**: Setores e categorias ordenados por consumo
- ✅ **Histórico**: Evolução do consumo ao longo do tempo

### 🎨 Interface Moderna

- ✅ **Design Responsivo**: Adaptável a qualquer dispositivo
- ✅ **Tema Escuro**: Interface moderna e confortável
- ✅ **Animações**: Transições suaves e feedback visual
- ✅ **Componentes Reutilizáveis**: Biblioteca Utils.js centralizada
- ✅ **Modais Inteligentes**: Confirmações e formulários dinâmicos

---

## 🏗️ Arquitetura

### Backend (ASP.NET Core)

```
HyperEfficient/
├── Controllers/          # Endpoints da API REST
├── Services/            # Lógica de negócio
├── Repositories/        # Acesso a dados
├── Entities/           # Modelos de domínio
├── DTOs/               # Objetos de transferência
├── Infrastructure/     # Autenticação, conexão, etc.
└── BackgroundServices/ # Serviços em background
```

### Frontend (Vanilla JavaScript)

```
HyperEfficient-frontEnd/
├── pages/
│   ├── auth/           # Autenticação
│   ├── dashboard/      # Dashboard principal
│   ├── equipamentos/   # Gestão de equipamentos
│   ├── setores/        # Gestão de setores
│   ├── categorias/     # Gestão de categorias
│   └── shared/         # Componentes compartilhados
├── assets/
│   ├── css/           # Estilos e componentes
│   ├── js/            # Bibliotecas externas
│   └── img/           # Imagens e ícones
└── Backend/           # Código do backend
```

---

## 🛠️ Tecnologias

### Backend

- **ASP.NET Core 8.0** - Framework web moderno
- **C#** - Linguagem de programação
- **Dapper** - Micro-ORM para acesso a dados
- **MySQL 8.0** - Banco de dados relacional
- **JWT** - Autenticação stateless
- **AutoMapper** - Mapeamento entre objetos
- **Background Services** - Tarefas em background

### Frontend

- **Vanilla JavaScript** - JavaScript puro ES6+
- **HTML5** - Estrutura semântica
- **Tailwind CSS** - Framework CSS utilitário
- **Chart.js** - Gráficos interativos
- **Fetch API** - Comunicação com backend

### Integração IoT

- **Tuya API** - Plataforma IoT para dispositivos inteligentes
- **HMAC-SHA256** - Autenticação segura
- **WebSocket** - Comunicação em tempo real

### Ferramentas

- **Visual Studio 2022** - IDE para desenvolvimento
- **MySQL Workbench** - Gerenciamento de banco
- **Postman** - Testes de API
- **Git** - Controle de versão

---

## 📦 Instalação

### Pré-requisitos

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [MySQL 8.0+](https://dev.mysql.com/downloads/mysql/)
- [Node.js 18+](https://nodejs.org/) (opcional, para desenvolvimento)

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/HyperEfficient.git
cd HyperEfficient
```

### 2. Configuração do Banco de Dados

```sql
-- Crie o banco de dados
CREATE DATABASE hyperefficient CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Execute o script de criação das tabelas
-- Arquivo: Backend/HyperEfficient/CreateSQL.txt
```

### 3. Configuração do Backend

```bash
cd Backend/HyperEfficient

# Restaure as dependências
dotnet restore

# Configure a string de conexão
# Edite: appsettings.json
```

### 4. Configuração do Frontend

```bash
# O frontend é estático, não requer build
# Apenas configure o servidor web para servir os arquivos
```

---

## 🔧 Configuração

### Backend (appsettings.json)

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Port=3306;Database=hyperefficient;User=root;Password=sua_senha"
  },
  "JwtSettings": {
    "SecretKey": "sua_chave_secreta_aqui"
  },
  "TuyaApi": {
    "ClientId": "seu_client_id_tuya",
    "ClientSecret": "seu_client_secret_tuya",
    "BaseUrl": "https://openapi.tuyaeu.com"
  }
}
```

### Frontend (api.js)

```javascript
const API_CONFIG = {
  BASE_URL: "http://localhost:5205", // URL do seu backend
  ENDPOINTS: {
    // Endpoints configurados automaticamente
  },
};
```

### Integração Tuya

1. Crie uma conta em [Tuya IoT Platform](https://iot.tuya.com/)
2. Obtenha suas credenciais (Client ID e Client Secret)
3. Configure no `appsettings.json`
4. Adicione o Device ID dos seus dispositivos nos equipamentos

---

## 📱 Uso

### 1. Acesso ao Sistema

- URL: `http://localhost:5000` (ou porta configurada)
- Faça login com suas credenciais
- Ou crie uma nova conta

### 2. Dashboard Principal

- Visualize o consumo energético geral
- Selecione períodos para análise
- Acompanhe setores e categorias

### 3. Gestão de Equipamentos

- Cadastre equipamentos com ou sem integração IoT
- Para dispositivos Tuya: adicione o Device ID
- Monitore status em tempo real

### 4. Controle de Registros

- Inicie/pare o uso de equipamentos
- Sistema calcula automaticamente o consumo
- Histórico completo de uso

---

## 🔌 Integração IoT

### Dispositivos Suportados

- ✅ Tomadas inteligentes Tuya
- ✅ Interruptores inteligentes
- ✅ Dispositivos com sensor de energia
- ✅ Qualquer dispositivo compatível com Tuya

### Como Funciona

1. **Cadastro**: Adicione o Device ID do dispositivo
2. **Monitoramento**: Sistema obtém dados em tempo real
3. **Controle**: Ligar/desligar remotamente
4. **Cálculo**: Consumo real vs. estimado

### Exemplo de Integração

```csharp
// Obter status do dispositivo
var status = await _tuyaApiClient.GetStatusAsync(deviceId);
// Retorna: Potência atual, consumo total, status ligado/desligado

// Controlar dispositivo
await _tuyaApiClient.LigarAsync(equipamentoId);
await _tuyaApiClient.DesligarAsync(equipamentoId);
```

---

## 📊 Dashboard

### Funcionalidades

- **Gráfico de Consumo**: Evolução temporal do consumo
- **Cards de Métricas**: Totalizadores animados
- **Rankings**: Setores e categorias por consumo
- **Filtros**: Seleção de período com validação
- **Exportação**: Dados para análise externa

### Visualizações

- 📈 Gráfico de linha para evolução temporal
- 🍰 Gráfico de pizza para distribuição por setor
- 📊 Gráfico de barras para comparações
- 🎯 Cards com métricas principais

---

## 🔐 Segurança

### Autenticação

- **JWT Tokens**: Autenticação stateless
- **Expiração Configurável**: 2h padrão, 30 dias com "lembrar de mim"
- **Refresh Automático**: Verificação periódica de validade

### Criptografia

- **Senhas**: Hash PBKDF2 com salt
- **API Tuya**: HMAC-SHA256 com nonce
- **HTTPS**: Comunicação criptografada

### Validação

- **Input Sanitization**: Prevenção de ataques
- **Data Annotations**: Validação no backend
- **CORS**: Configuração de origens permitidas

---

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Padrões de Código

- **C#**: Seguir convenções Microsoft
- **JavaScript**: ES6+ com nomes descritivos
- **SQL**: UPPERCASE para campos do banco
- **Commits**: Mensagens em português, descritivas

### Estrutura de Commits

```
feat: adiciona integração com Tuya API
fix: corrige cálculo de consumo energético
docs: atualiza documentação do dashboard
style: melhora interface do formulário
refactor: reorganiza estrutura de pastas
test: adiciona testes para RegistroService
```

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Suporte

- **Email**: seu-email@exemplo.com
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/HyperEfficient/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/HyperEfficient/wiki)

---

<div align="center">

**Desenvolvido com ❤️ para o curso Entra21 - Turma C**

[![Entra21](https://img.shields.io/badge/Entra21-Turma%20C-blue?style=for-the-badge)](https://entra21.com.br/)

</div>
