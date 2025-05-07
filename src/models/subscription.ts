// models/subscription.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../utils/db"; // Adjust path as needed

// interfaces/subscription.interface.ts
interface ISubscription {
  id?: string;
  email: string;
  description: string;
  amount: number;
  nextExpectedDate: Date;
  lastNotified: Date | null;
}

// Optional fields for creation
interface SubscriptionCreationAttributes
  extends Optional<ISubscription, "id"> {}

export class Subscription
  extends Model<ISubscription, SubscriptionCreationAttributes>
  implements ISubscription
{
  public id!: string;
  public email!: string;
  public description!: string;
  public amount!: number;
  public nextExpectedDate!: Date;
  public lastNotified!: Date | null;

  // Optional: timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    nextExpectedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lastNotified:{
        type: DataTypes.DATE,
        allowNull:true,
        defaultValue:null
    }
  },
  {
    sequelize,
    tableName: "subscriptions",
    timestamps: true,
  }
);
