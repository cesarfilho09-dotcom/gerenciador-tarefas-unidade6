const express = require("express");
const { Tarefa } = require("../models");
const { estaAutenticado, somenteAdmin } = require("../middleware/auth");

const router = express.Router();

// READ
router.get("/", estaAutenticado, async (req, res, next) => {
  try {
    const tarefas = await Tarefa.findAll({
      where: { usuarioId: req.session.usuario.id },
      order: [["id", "DESC"]]
    });

    res.render("index", { tarefas, erro: null });
  } catch (erro) {
    next(erro);
  }
});

// CREATE
router.post("/", estaAutenticado, async (req, res, next) => {
  try {
    const { titulo, descricao } = req.body;

    if (!titulo || titulo.trim().length < 3) {
      return res.status(400).render("index", {
        tarefas: await Tarefa.findAll({
          where: { usuarioId: req.session.usuario.id },
          order: [["id", "DESC"]]
        }),
        erro: "O título deve ter pelo menos 3 caracteres."
      });
    }

    await Tarefa.create({
      titulo: titulo.trim(),
      descricao: descricao || "",
      usuarioId: req.session.usuario.id
    });

    res.redirect("/tarefas");
  } catch (erro) {
    next(erro);
  }
});

// UPDATE
router.post("/:id/concluir", estaAutenticado, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findOne({
      where: {
        id: req.params.id,
        usuarioId: req.session.usuario.id
      }
    });

    if (!tarefa) {
      return res.status(404).render("erro", {
        codigo: 404,
        mensagem: "Tarefa não encontrada."
      });
    }

    await tarefa.update({ status: "concluida" });
    res.redirect("/tarefas");
  } catch (erro) {
    next(erro);
  }
});

// DELETE - apenas admin pode excluir
router.post("/:id/excluir", somenteAdmin, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return res.status(404).render("erro", {
        codigo: 404,
        mensagem: "Tarefa não encontrada."
      });
    }

    await tarefa.destroy();
    res.redirect("/tarefas");
  } catch (erro) {
    next(erro);
  }
});


// ROTAS DA INTERFACE VUE

// Listar tarefas em formato JSON
router.get("/vue/tarefas", estaAutenticado, async (req, res, next) => {
  try {
    const tarefas = await Tarefa.findAll({
      where: { usuarioId: req.session.usuario.id },
      order: [["id", "DESC"]]
    });

    res.json(tarefas);
  } catch (erro) {
    next(erro);
  }
});

// Cadastrar tarefa pelo Vue
router.post("/vue/tarefas", estaAutenticado, async (req, res, next) => {
  try {
    const { titulo, descricao } = req.body;

    if (!titulo || titulo.trim().length < 3) {
      return res.status(400).json({
        erro: "O título deve ter pelo menos 3 caracteres."
      });
    }

    const tarefa = await Tarefa.create({
      titulo: titulo.trim(),
      descricao: descricao || "",
      usuarioId: req.session.usuario.id
    });

    res.status(201).json(tarefa);
  } catch (erro) {
    next(erro);
  }
});

// Alternar status da tarefa pelo Vue
router.put("/vue/tarefas/:id/status", estaAutenticado, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findOne({
      where: {
        id: req.params.id,
        usuarioId: req.session.usuario.id
      }
    });

    if (!tarefa) {
      return res.status(404).json({
        erro: "Tarefa não encontrada."
      });
    }

    const novoStatus =
      req.body.status === "concluida" ? "concluida" : "pendente";

    await tarefa.update({ status: novoStatus });

    res.json(tarefa);
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
