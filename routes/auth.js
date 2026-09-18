const express = require("express");
const bcrypt = require("bcryptjs");
const { Usuario } = require("../models");

const router = express.Router();

router.get("/", (req, res) => {
  if (req.session.usuario) {
    return res.redirect("/tarefas");
  }
  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.render("login", { erro: null });
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).render("login", {
        erro: "Informe o e-mail e a senha."
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(401).render("login", {
        erro: "E-mail ou senha inválidos."
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).render("login", {
        erro: "E-mail ou senha inválidos."
      });
    }

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil
    };

    res.redirect("/tarefas");
  } catch (erro) {
    next(erro);
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
