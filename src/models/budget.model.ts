import {Column, Model, DataType, Table, HasMany, BelongsTo, ForeignKey} from 'sequelize-typescript'

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

    // @Column({
    //   type: DataType.STRING,
    //   allowNull: false,
    // })
    // description!: string;
  
    // @Column({
    //   type: DataType.DATE,
    //   allowNull: false,
    // })
    // date!: Date;

    // @Column({
    //   type: DataType.STRING,
    //   allowNull: false,
    // })
    // user!: User;
  }

  export default Budget