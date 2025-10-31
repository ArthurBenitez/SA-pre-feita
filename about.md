# DevHub - Rede Social para Desenvolvedores

##  Sobre o Projeto

O **DevHub** é uma rede social desenvolvida para conectar desenvolvedores
permitindo interações sociais e networking profissional.
O projeto inclui um backend robusto com Node.js/Express e um frontend responsivo com HTML, CSS e JavaScript.

## Tecnologias utilizadas nesse projeto

### Backend (Node.js, Express e MySQL2)
- **Servidor**: Express.js rodando na porta 3000
- **Banco de Dados**: MySQL com conexão local
- **Autenticação**: Com login e senha

### Frontend (HTML, CSS e JavaScript)
- **Interface**: Design com três colunas
- **Interaçãp - botões e etc**: JavaScript puro com funções


## Banco de Dados MySQL:

### Tabelas Principais:

1. **usuarios**
   - `id`, `nome`, `email`, `senha`, `created_at`

2. **posts**
   - `id`, `id_usuario`, `texto`, `created_at`

3. **comentarios**
   - `id`, `id_post`, `id_usuario`, `texto`, `created_at`

4. **curtidas**
   - `id`, `id_post`, `id_usuario`, `created_at`

5. **seguidores**
   - `id`, `id_seguidor`, `id_seguido`, `created_at`

6. **notificacoes**
   - `id`, `id_usuario`, `id_remetente`, `tipo`, `texto`, `lida`, `created_at`

## 🔧 Funcionalidades Implementadas

### Autenticação dos usuários:

- **Cadastro de usuários** com validação de email único
- **Login seguro** com verificação de credenciais
- **Logout**
- **Deleção de conta** com confirmação

### 📱 Interface Principal
- **Navbar superior** com menu de navegação
- **Sidebar** com informações do perfil
- **Feed central** para posts e interações
- **Rightbar** para atividades recentes

###  Funcionalidades de Posts
- **Criação de posts** com texto
- **Listagem de posts** ordenados por data
- **Sistema de curtidas** com toggle
- **Comentários** em tempo real
- **Notificações** automáticas para interações

### 👥 Sistema Social
- **Lista de seguidores** e seguindo - talvez implementar futuramente
- **Perfis de usuários** com informações básicas - no momento só o meu próprio nome consigo ver, e só o nome pode ser alterado

### 🔔 Sistema de Notificações
- **Notificações em tempo real** para:
  - Novos seguidores
  - Curtidas em posts
  - Comentários em posts
- **Badge visual** para notificações não lidas
- **Marcar como lida** ao clicar

###  Atualização de Perfil:
- **Upload de foto** - usei um input de enviar arquivos para isso
- **Edição de nome** 
- **Reset de foto** - remover

##  Endpoints criados

### Usuários
- `POST /usuarios` - Criar usuário
- `POST /login` - Autenticar usuário
- `GET /usuarios` - Listar usuários
- `PUT /usuarios/:id` - Atualizar usuário
- `DELETE /usuarios/:id` - Deletar usuário

### Posts
- `POST /posts` - Criar post
- `GET /posts` - Listar posts com autores

### 💬 Comentários
- `POST /comentarios` - Adicionar comentário
- `GET /comentarios/:id_post` - Listar comentários de um post

### Curtidas
- `POST /curtidas` - Adicionar/remover curtida
- `GET /curtidas/:id_post` - Contar curtidas

### Notificações
- `POST /notificacoes` - Criar notificação
- `GET /notificacoes/:id_usuario` - Listar notificações
- `PUT /notificacoes/:id/lida` - Marcar como lida

### Seguidores
- `POST /seguir` - Seguir usuário
- `DELETE /seguir` - Deixar de seguir
- `GET /seguidores/:id_usuario` - Listar seguidores
- `GET /seguindo/:id_usuario` - Listar seguindo

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL2** - Driver do banco MySQL
- **CORS** - Habilitado para todas origens

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos e responsividade
- **JavaScript ES6+** - Interatividade
- **LocalStorage API** - Persistência local

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado
- MySQL instalado e rodando
- Banco de dados `devhub` criado


### Instalação
1. Clone o repositório
2. Instale as dependências: npm i express mysql2
```bash
npm install express mysql2

Acesse http://localhost:3000












