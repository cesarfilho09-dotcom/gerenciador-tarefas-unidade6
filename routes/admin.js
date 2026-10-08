const express = require("express");
const bcrypt = require("bcryptjs");
const { Tarefa, Usuario } = require("../models");
const { autenticarJWT, somenteAdminJWT } = require("../middleware/jwt");

const router = express.Router();

// =========================
// OBJETOS / TAREFAS
// =========================

// POST /admin/objetos
router.post("/objetos", autenticarJWT, somenteAdminJWT, async (req, res, next) => {
  try {
    const { titulo, descricao, status, usuarioId } = req.body;

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({
        erro: "O título é obrigatório."
      });
    }

    if (!usuarioId) {
      return res.status(400).json({
        erro: "O usuário é obrigatório."
      });
    }

    const tarefa = await Tarefa.create({
      titulo: titulo.trim(),
      descricao: descricao || "",
      status: status === "concluida" ? "concluida" : "pendente",
      usuarioId: Number(usuarioId)
    });

    res.status(201).json(tarefa);

  } catch (erro) {
    next(erro);
  }
});

// GET /admin/objetos
router.get("/objetos", autenticarJWT, somenteAdminJWT, async (req, res, next) => {
  try {
    const tarefas = await Tarefa.findAll({
      order: [["id", "DESC"]]
    });

    res.json(tarefas);
  } catch (erro) {
    next(erro);
  }
});

// GET /admin/objetos/:id
router.get("/objetos/:id", autenticarJWT, somenteAdminJWT, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return res.status(404).json({
        erro: "Tarefa não encontrada."
      });
    }

    res.json(tarefa);
  } catch (erro) {
    next(erro);
  }
});

// POST /admin/objetos/:id
router.post("/objetos/:id", autenticarJWT, somenteAdminJWT, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return res.status(404).json({
        erro: "Tarefa não encontrada."
      });
    }

    const { titulo, descricao, status, usuarioId } = req.body;

    await tarefa.update({
      titulo: titulo !== undefined ? titulo : tarefa.titulo,
      descricao: descricao !== undefined ? descricao : tarefa.descricao,
      status: status !== undefined ? status : tarefa.status,
      usuarioId: usuarioId !== undefined ? usuarioId : tarefa.usuarioId
    });

    res.json(tarefa);
  } catch (erro) {
    next(erro);
  }
});

// PUT /admin/objetos/:id
router.put("/objetos/:id", autenticarJWT, somenteAdminJWT, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return res.status(404).json({
        erro: "Tarefa não encontrada."
      });
    }

    const { titulo, descricao, status, usuarioId } = req.body;

    await tarefa.update({
      titulo,
      descricao,
      status,
      usuarioId
    });

    res.json(tarefa);
  } catch (erro) {
    next(erro);
  }
});

// DELETE /admin/objetos/:id
router.delete("/objetos/:id", autenticarJWT, somenteAdminJWT, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return res.status(404).json({
        erro: "Tarefa não encontrada."
      });
    }

    await tarefa.destroy();

    res.json({
      mensagem: "Tarefa excluída com sucesso."
    });
  } catch (erro) {
    next(erro);
  }
});

// =========================
// USUÁRIOS
// =========================
// POST /admin/usuarios
router.post("/usuarios", autenticarJWT, somenteAdminJWT, async (req, res, next) => {
  try {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Nome, e-mail e senha são obrigatórios."
      });
    }

    const usuarioExistente = await Usuario.findOne({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        erro: "Já existe um usuário com esse e-mail."
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      perfil: perfil === "admin" ? "admin" : "usuario"
    });

    res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil
    });

  } catch (erro) {
    next(erro);
  }
});
// GET /admin/usuarios
router.get("/usuarios", autenticarJWT, somenteAdminJWT, async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ["senha"] },
      order: [["id", "DESC"]]
    });

    res.json(usuarios);
  } catch (erro) {
    next(erro);
  }
});

// GET /admin/usuarios/:id
router.get("/usuarios/:id", autenticarJWT, somenteAdminJWT, async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ["senha"] }
    });

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado."
      });
    }

    res.json(usuario);
  } catch (erro) {
    next(erro);
  }
});

// POST /admin/usuarios/:id
router.post("/usuarios/:id", autenticarJWT, somenteAdminJWT, async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado."
      });
    }

    const { nome, email, senha, perfil } = req.body;

    const dados = {
      nome: nome !== undefined ? nome : usuario.nome,
      email: email !== undefined ? email : usuario.email,
      perfil: perfil !== undefined ? perfil : usuario.perfil
    };

    if (senha) {
      dados.senha = await bcrypt.hash(senha, 10);
    }

    await usuario.update(dados);

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil
    });
  } catch (erro) {
    next(erro);
  }
});

// PUT /admin/usuarios/:id
router.put("/usuarios/:id", autenticarJWT, somenteAdminJWT, async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado."
      });
    }

    const { nome, email, senha, perfil } = req.body;

    const dados = {
      nome,
      email,
      perfil
    };

    if (senha) {
      dados.senha = await bcrypt.hash(senha, 10);
    }

    await usuario.update(dados);

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil
    });
  } catch (erro) {
    next(erro);
  }
});

// DELETE /admin/usuarios/:id
router.delete("/usuarios/:id", autenticarJWT, somenteAdminJWT, async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado."
      });
    }

    await usuario.destroy();

    res.json({
      mensagem: "Usuário excluído com sucesso."
    });
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;