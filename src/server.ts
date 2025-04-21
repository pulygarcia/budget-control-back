import express from 'express' 
import morgan from 'morgan'
import {db} from './config/database';
import budgetRoutes from './routes/budget.router'
import authRoutes from './routes/auth.router'

export async function connectDB() {
    try {
        await db.authenticate();
        db.sync()
        //console.log("Connected to PostgreSQL with Sequelize");
      } catch (error) {
        //console.error("Error connecting db:", error);
    }
}

connectDB();
const app = express()

app.use(morgan('dev'))

app.use(express.json())

//define routes
app.use('/api/budgets', budgetRoutes);
app.use('/api/auth', authRoutes);

export default app