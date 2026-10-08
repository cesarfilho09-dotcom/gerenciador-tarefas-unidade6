const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
      if (req.is("application/json")) {
        return res.status(400).json({
          erro: "Informe o e-mail e a senha."
        });
      }

      return res.status(400).render("login", {
        erro: "Informe o e-mail e a senha."
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      if (req.is("application/json")) {
        return res.status(401).json({
          erro: "E-mail ou senha inválidos."
        });
      }

      return res.status(401).render("login", {
        erro: "E-mail ou senha inválidos."
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      if (req.is("application/json")) {
        return res.status(401).json({
          erro: "E-mail ou senha inválidos."
        });
      }

      return res.status(401).render("login", {
        erro: "E-mail ou senha inválidos."
      });
    }

    const dadosUsuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil
    };

    // Mantém o login tradicional por sessão
    req.session.usuario = dadosUsuario;

    // Cria o JWT para a SPA
    const token = jwt.sign(
      dadosUsuario,
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Se a requisição veio como JSON, devolve o token
    if (req.is("application/json")) {
      return res.json({
        mensagem: "Login realizado com sucesso.",
        token,
        usuario: dadosUsuario
      });
    }

    // Login tradicional
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