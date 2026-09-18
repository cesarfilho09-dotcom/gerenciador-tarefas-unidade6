const { Sequelize } = require("sequelize");
const Usuario = require("./Usuario");
const Tarefa = require("./Tarefa");

const sequelize = new Sequelize(
  process.env.DB_NAME || "gerenciador_tarefas",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: console.log
  }
);

Usuario.initModel(sequelize);
Tarefa.initModel(sequelize);

Usuario.hasMany(Tarefa, { foreignKey: "usuarioId" });
Tarefa.belongsTo(Usuario, { foreignKey: "usuarioId" });

module.exports = { sequelize, Usuario, Tarefa };
