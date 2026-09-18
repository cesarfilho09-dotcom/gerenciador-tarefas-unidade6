function estaAutenticado(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  next();
}

function somenteAdmin(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  if (req.session.usuario.perfil !== "admin") {
    return res.status(403).render("erro", {
      codigo: 403,
      mensagem: "Você não tem permissão para acessar esta página."
    });
  }

  next();
}

module.exports = { estaAutenticado, somenteAdmin };
