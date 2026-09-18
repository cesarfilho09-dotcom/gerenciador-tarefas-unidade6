# Gerenciador de Tarefas - Unidade 3

Projeto simples de aluno para a atividade **Unidade 3 – Tarefa 3: Autenticação e Tratamento de Erros**.

## Tecnologias

- Node.js
- Express
- EJS
- Sequelize
- MariaDB/MySQL
- Express Session
- bcryptjs

## 1. Criar o banco

No MariaDB/phpMyAdmin, execute:

```sql
CREATE DATABASE gerenciador_tarefas;
```

Não é necessário criar as tabelas manualmente. O Sequelize usa `sequelize.sync()` para criá-las.

## 2. Configurar o projeto

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

Copie `.env.example` para `.env`.

No `.env`, confira principalmente:

```text
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gerenciador_tarefas
DB_USER=root
DB_PASSWORD=
SESSION_SECRET=chave-secreta-de-teste
PORT=3000
```

Coloque sua senha do MariaDB em `DB_PASSWORD` se existir.

## 3. Executar

```bash
npm start
```

Depois abra:

http://localhost:3000

## Usuários de teste

### Administrador
- E-mail: `admin@teste.com`
- Senha: `123456`
- Perfil: `admin`

### Usuário comum
- E-mail: `usuario@teste.com`
- Senha: `123456`
- Perfil: `usuario`

Os usuários são criados automaticamente na primeira execução.

## O que foi implementado

### Autenticação
- Tela de login.
- Verificação de e-mail e senha.
- Senha armazenada usando hash com bcrypt.
- Sessão com `express-session`.
- Logout.

### Controle de acesso
As rotas `/tarefas` precisam de usuário autenticado.

A exclusão de tarefas é uma função disponível somente para o perfil `admin`.

### Erros

- **400:** dados inválidos no cadastro ou login incompleto.
- **403:** usuário sem permissão para uma operação.
- **404:** rota ou tarefa não encontrada.
- **500:** erro inesperado do servidor.

### Banco de dados

O Sequelize está com:

```js
logging: console.log
```

Assim, os comandos SQL aparecem no terminal.

Exemplo conceitual de consulta gerada ao listar tarefas:

```sql
SELECT `id`, `titulo`, `descricao`, `status`, `usuarioId`,
       `createdAt`, `updatedAt`
FROM `tarefas` AS `Tarefa`
WHERE `Tarefa`.`usuarioId` = 1
ORDER BY `Tarefa`.`id` DESC;
```

Ela está relacionada ao método:

```js
Tarefa.findAll(...)
```

## CRUD usado

- Create: `Tarefa.create()`
- Read: `Tarefa.findAll()` e `Tarefa.findByPk()`
- Update: `tarefa.update()`
- Delete: `tarefa.destroy()`

## Evidências sugeridas para entregar

Tire screenshots mostrando:

1. Tela de login.
2. Login realizado como usuário comum.
3. Lista de tarefas.
4. Cadastro de uma tarefa.
5. Login como admin.
6. Opção de excluir aparecendo para admin.
7. Tentativa de acesso sem permissão mostrando erro 403.
8. Uma URL inexistente mostrando erro 404.
9. Terminal mostrando o servidor e os comandos SQL do Sequelize.
10. phpMyAdmin mostrando as tabelas `usuarios` e `tarefas`.

## Breve relatório

O sistema foi desenvolvido a partir de um Gerenciador de Tarefas simples, acrescentando autenticação e controle de acesso. Foi criada uma tela de login com dois usuários de teste, sendo um administrador e um usuário comum.

A autenticação utiliza sessão para manter o usuário conectado enquanto navega pelo sistema. As rotas de tarefas possuem um middleware que verifica se existe uma sessão válida.

Também foi criada uma regra de autorização por perfil. O usuário comum pode cadastrar e concluir suas tarefas, enquanto o administrador possui também a opção de excluir tarefas.

Para o tratamento de erros, foram utilizados os códigos HTTP 400, 403, 404 e 500. O código 400 é usado quando os dados enviados são inválidos, o 403 quando o usuário não possui permissão, o 404 quando uma página ou tarefa não existe e o 500 para erros internos inesperados.

O banco de dados foi feito com MariaDB e acessado pelo Sequelize. O logging do Sequelize foi ativado para que os comandos SQL possam ser visualizados no terminal durante a execução.

O projeto mantém os dados no banco de dados, portanto as tarefas continuam existindo mesmo depois de reiniciar o servidor.
