import {Column, Model, DataType, Table, BelongsTo, ForeignKey} from 'sequelize-typescript'
import Budget from './budget.model';

@Table({
    tableName: "expenses",
    timestamps: true,
  })

export class Expense extends Model {
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    declare name: string;
  
    @Column({
      type: DataType.DECIMAL,
      allowNull: false,
    })
    declare amount: number;

    @ForeignKey(() => Budget)
    declare budgetId: number

    @BelongsTo(() => Budget)
    declare budget: Budget
  }

  export default Expense