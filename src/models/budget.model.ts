import {Column, Model, DataType, Table, HasMany, BelongsTo, ForeignKey} from 'sequelize-typescript'
import Expense from './expense.model';

@Table({
    tableName: "budgets",
    timestamps: true, // enable createdAt y updatedAt
  })

export class Budget extends Model {
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

    @HasMany(() => Expense, {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    })
    declare expenses: Expense[]
  }

  export default Budget