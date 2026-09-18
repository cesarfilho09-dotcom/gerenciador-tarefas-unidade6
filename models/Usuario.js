const { DataTypes, Model } = require("sequelize");

class Usuario extends Model {
  static initModel(sequelize) {
    Usuario.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        nome: {
          type: DataTypes.STRING(100),
          allowNull: false
        },
        email: {
          type: DataTypes.STRING(150),
          allowNull: false,
          unique: true
        },
        senha: {
          type: DataTypes.STRING(255),
          allowNull: false
        },
        perfil: {
          type: DataTypes.ENUM("admin", "usuario"),
          allowNull: false,
          defaultValue: "usuario"
        }
      },
      {
        sequelize,
        modelName: "Usuario",
        tableName: "usuarios",
        timestamps: true
      }
    );
  }
}

module.exports = Usuario;
