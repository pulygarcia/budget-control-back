import {Column, Model, DataType, Table, HasMany, Default, Unique, BelongsTo} from 'sequelize-typescript'
import Budget from './budget.model';

@Table({
    tableName: "users",
    timestamps: true,
})

export class User extends Model {
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    declare username: string;
  
    @Unique(true)
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    declare email: string;

    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    declare password: string;

    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    declare token: string;

    @Default(false)
    @Column({
      type: DataType.BOOLEAN,
      allowNull: false,
    })
    declare verified: boolean;

    @HasMany(() => Budget, {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    })
    declare budgets: Budget[]
  }

  export default User