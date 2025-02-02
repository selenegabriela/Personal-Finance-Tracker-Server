const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

const getDashboardData = async (req, res) => {
    try {
        const userId = req.user;
        const { month, year } = req.query; // Get the selected month and year
        console.log(month,year);
        if (!userId) {
            return res.status(400).json({ message: 'User ID is missing' });
        }

        const castedUserId = new mongoose.Types.ObjectId(userId);

        // Convert month and year to numbers (default to current month/year if not provided)
        const selectedMonth = month ? parseInt(month) - 1 : new Date().getMonth();
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();

        // Get the first and last day of the selected month
        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

        // Expenses grouped by category
        const expensesByCategory = await Expense.aggregate([
            { 
                $match: { 
                    userId: castedUserId,
                    date: { $gte: startDate, $lte: endDate }
                } 
            },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);

        const expensesByCategoryObj = expensesByCategory.reduce((acc, expense) => {
            acc[expense._id] = expense.total;
            return acc;
        }, {});

        // Total expenses
        const totalExpenses = await Expense.aggregate([
            { 
                $match: { 
                    userId: castedUserId,
                    date: { $gte: startDate, $lte: endDate }
                } 
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Total income
        const totalIncome = await Income.aggregate([
            { 
                $match: { 
                    userId: castedUserId,
                    date: { $gte: startDate, $lte: endDate }
                } 
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalExpensesValue = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
        const totalIncomeValue = totalIncome.length > 0 ? totalIncome[0].total : 0;
        const totalBudget = totalIncomeValue - totalExpensesValue;

        res.status(200).json({
            selectedMonth: selectedMonth + 1, // Return as 1-based index (Jan = 1)
            selectedYear,
            totalIncome: totalIncomeValue,
            totalExpenses: totalExpensesValue,
            totalBudget,
            expensesByCategory: expensesByCategoryObj,
        });

    } catch (error) {
        console.error('Error in getDashboardData:', error);
        res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
    }
};

module.exports = { getDashboardData };
