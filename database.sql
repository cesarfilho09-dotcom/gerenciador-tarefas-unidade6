CREATE DATABASE IF NOT EXISTS gerenciador_tarefas;
USE gerenciador_tarefas;

-- O Sequelize cria/atualiza as tabelas automaticamente ao iniciar.
-- Este arquivo serve apenas como referência para o banco.

-- Estrutura aproximada da tabela usuarios:
-- id, nome, email, senha, perfil, createdAt, updatedAt

-- Estrutura aproximada da tabela tarefas:
-- id, titulo, descricao, status, usuarioId, createdAt, updatedAt
