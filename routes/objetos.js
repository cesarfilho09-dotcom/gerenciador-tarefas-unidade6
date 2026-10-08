const express = require("express");
const { Tarefa } = require("../models");

const router = express.Router();

// GET /objetos
router.get("/", async (req, res, next) => {
  try {
    const pagina = Math.max(Number(req.query.pagina) || 1, 1);
    const limite = Math.max(Number(req.query.limite) || 5, 1);

    const offset = (pagina - 1) * limite;

    const resultado = await Tarefa.findAndCountAll({
      limit: limite,
      offset: offset,
      order: [["id", "DESC"]]
    });

    const dados = {
      objetos: resultado.rows,
      pagina,
      limite,
      total: resultado.count,
      totalPaginas: Math.ceil(resultado.count / limite)
    };

    if (req.accepts("html") && !req.accepts("json")) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Objetos</title>
        </head>
        <body>
          <h1>Lista de Objetos</h1>

          ${resultado.rows.map(objeto => `
            <div>
              <h2>${objeto.titulo}</h2>
              <p>${objeto.descricao || ""}</p>
              <p>Status: ${objeto.status}</p>
              <a href="/objetos/${objeto.id}">Ver detalhes</a>
            </div>
            <hr>
          `).join("")}

          <p>
            Página ${pagina} de ${dados.totalPaginas || 1}
          </p>
        </body>
        </html>
      `);
    }

    res.json(dados);

  } catch (erro) {
    next(erro);
  }
});

// GET /objetos/:id
router.get("/:id", async (req, res, next) => {
  try {
    const objeto = await Tarefa.findByPk(req.params.id);

    if (!objeto) {
      return res.status(404).json({
        erro: "Objeto não encontrado."
      });
    }

    if (req.accepts("html") && !req.accepts("json")) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>${objeto.titulo}</title>
        </head>
        <body>
          <h1>${objeto.titulo}</h1>
          <p>${objeto.descricao || ""}</p>
          <p>Status: ${objeto.status}</p>

          <a href="/objetos">Voltar</a>
        </body>
        </html>
      `);
    }

    res.json(objeto);

  } catch (erro) {
    next(erro);
  }
});

module.exports = router;