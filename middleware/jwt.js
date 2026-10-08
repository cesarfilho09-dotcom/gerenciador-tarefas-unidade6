const jwt = require("jsonwebtoken");

function autenticarJWT(req, res, next) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao) {
    return res.status(401).json({
      erro: "Token não informado."
    });
  }

  const partes = autorizacao.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      erro: "Formato do token inválido."
    });
  }

  const token = partes[1];

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET);

    req.usuarioJWT = usuario;

    next();
  } catch (erro) {
    return res.status(401).json({
      erro: "Token inválido ou expirado."
    });
  }
}

function somenteAdminJWT(req, res, next) {
  if (!req.usuarioJWT) {
    return res.status(401).json({
      erro: "Usuário não autenticado."
    });
  }

  if (req.usuarioJWT.perfil !== "admin") {
    return res.status(403).json({
      erro: "Acesso permitido somente para administradores."
    });
  }

  next();
}

module.exports = {
  autenticarJWT,
  somenteAdminJWT
};