import express from 'express' 
import morgan from 'morgan'
import {db} from './config/database';

async function connectDB() {
    try {
        await db.authenticate();
        db.sync()
        console.log("Connected to PostgreSQL with Sequelize");
      } catch (error) {
        console.error("Error connecting db:", error);
    }
}

connectDB();
const app = express()

app.use(morgan('dev'))

app.use(express.json())



export default app