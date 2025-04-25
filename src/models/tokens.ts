import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import sequelize from "../utils/db";

interface TokenAttributes {
  id: number;
  userId: number;
  access_token: string;
  refresh_token: string;
  expires_in: string;
}

interface TokenActivationAttribute extends Optional<TokenAttributes, "id"> {}

export class Tokens
  extends Model<TokenAttributes, TokenActivationAttribute>
  implements TokenAttributes
{
  public id!: number;
  public userId!: number;
  public access_token!: string;
  public refresh_token!: string;
  public expires_in!: string;
}

Tokens.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_in: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "tokens",
    timestamps: true,
  }
);
