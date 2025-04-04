import {Column, Model, DataType, Table, HasMany, BelongsTo, ForeignKey} from 'sequelize-typescript'
import Expense from './expense.model';
import User from './user.model';

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

    @ForeignKey(() => User)
    declare userId: number

    @HasMany(() => Expense, {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    })
    declare expenses: Expense[]

    @BelongsTo(() => User)
    declare user: User
  }

  export default Budget