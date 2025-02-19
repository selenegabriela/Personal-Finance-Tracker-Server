const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const budgetGoalRoutes = require('./routes/budgetGoalRoutes');
const cors = require('cors')

dotenv.config();
connectDB();

const app = express()
app.use(cors())
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgetGoal', budgetGoalRoutes);

//app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}) 