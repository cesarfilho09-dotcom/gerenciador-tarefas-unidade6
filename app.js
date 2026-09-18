require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const { sequelize, Usuario, Tarefa } = require("./models");
const { estaAutenticado } = require("./middleware/auth");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "chave-secreta-de-teste",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }
  })
);

// Deixa o usuário disponível nas páginas EJS
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

// Rota protegida da interface Vue
app.get("/vue", estaAutenticado, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "vue-tarefas.html"));
});

// Rotas
app.use("/", require("./routes/auth"));
app.use("/tarefas", require("./routes/tarefas"));

// 404 - rota que não existe
app.use((req, res) => {
  res.status(404).render("erro", {
    codigo: 404,
    mensagem: "Página não encontrada."
  });
});

// 500 - tratamento geral de erros
app.use((err, req, res, next) => {
  console.error("ERRO 500:", err);

  res.status(500).render("erro", {
    codigo: 500,
    mensagem: "Ocorreu um erro interno no servidor."
  });
});

async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log("Banco de dados conectado.");

    // Cria as tabelas se ainda não existirem.
    await sequelize.sync();

    // Cria usuários de teste automaticamente.
    const senhaAdmin = await require("bcryptjs").hash("123456", 10);
    const senhaUsuario = await require("bcryptjs").hash("123456", 10);

    const [admin] = await Usuario.findOrCreate({
      where: { email: "admin@teste.com" },
      defaults: {
        nome: "Administrador",
        senha: senhaAdmin,
        perfil: "admin"
      }
    });

    await Usuario.findOrCreate({
      where: { email: "usuario@teste.com" },
      defaults: {
        nome: "Usuário Teste",
        senha: senhaUsuario,
        perfil: "usuario"
      }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
      console.log("Admin: admin@teste.com / 123456");
      console.log("Usuário: usuario@teste.com / 123456");
    });
  } catch (erro) {
    console.error("Não foi possível iniciar:", erro.message);
    process.exit(1);
  }
}

iniciar();
