const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const BudgetGoal = require('../models/BudgetGoal');

const getDashboardData = async (req, res) => {
    try {
        const userId = req.user;
        const { month, year } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is missing' });
        }

        const castedUserId = new mongoose.Types.ObjectId(userId);
        const selectedMonth = month ? parseInt(month) - 1 : new Date().getMonth();
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();

        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        console.log(startDate,endDate);
        // 🔹 Obtener budget goals del mes actual
        let budgetGoals = await BudgetGoal.find({
            userId: castedUserId,
            date: { $gte: startDate, $lte: endDate }
        });
        
        // 🔹 Si no hay, replicar los del mes anterior
        if (budgetGoals.length === 0 && selectedMonth > 0) {
            console.log('startDate,endDate');
            const prevStartDate = new Date(selectedYear, selectedMonth - 1, 1);
            const prevEndDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

            const previousBudgetGoals = await BudgetGoal.find({
                userId: castedUserId,
                date: { $gte: prevStartDate, $lte: prevEndDate }
            });

            if (previousBudgetGoals.length > 0) {
                const newBudgetGoals = previousBudgetGoals.map(goal => ({
                    userId: goal.userId,
                    category: goal.category,
                    amount: goal.amount,
                    date: startDate
                }));

                await BudgetGoal.insertMany(newBudgetGoals);
                budgetGoals = newBudgetGoals;
            }
        }

        // 🔹 Expenses grouped by category
        const expensesByCategory = await Expense.aggregate([
            { $match: { userId: castedUserId, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);

        const expensesByCategoryObj = expensesByCategory.reduce((acc, expense) => {
            acc[expense._id] = expense.total;
            return acc;
        }, {});

        // 🔹 Total expenses
        const totalExpenses = await Expense.aggregate([
            { $match: { userId: castedUserId, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // 🔹 Total income
        const totalIncome = await Income.aggregate([
            { $match: { userId: castedUserId, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalExpensesValue = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
        const totalIncomeValue = totalIncome.length > 0 ? totalIncome[0].total : 0;
        const totalBudget = totalIncomeValue - totalExpensesValue;

        res.status(200).json({
            selectedMonth: selectedMonth + 1,
            selectedYear,
            totalIncome: totalIncomeValue,
            totalExpenses: totalExpensesValue,
            totalBudget,
            expensesByCategory: expensesByCategoryObj,
            budgetGoals
        });

    } catch (error) {
        console.error('Error in getDashboardData:', error);
        res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
    }
};

module.exports = { getDashboardData };
