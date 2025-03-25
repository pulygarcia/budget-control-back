import { Sequelize } from "sequelize-typescript";
import dotenv from 'dotenv'

dotenv.config(); //enable env variables

const DB_URL = process.env.DB_URL;

export const db = new Sequelize(DB_URL, {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // allow connections without strict validations
        },
    },
    models: [__dirname + "/../models/**/*"], // register all models,
    logging: false
})
