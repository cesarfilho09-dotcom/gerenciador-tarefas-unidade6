const { DataTypes, Model } = require("sequelize");

class Tarefa extends Model {
  static initModel(sequelize) {
    Tarefa.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        titulo: {
          type: DataTypes.STRING(150),
          allowNull: false
        },
        descricao: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        status: {
          type: DataTypes.ENUM("pendente", "concluida"),
          allowNull: false,
          defaultValue: "pendente"
        },
        usuarioId: {
          type: DataTypes.INTEGER,
          allowNull: false
        }
      },
      {
        sequelize,
        modelName: "Tarefa",
        tableName: "tarefas",
        timestamps: true
      }
    );
  }
}

module.exports = Tarefa;
