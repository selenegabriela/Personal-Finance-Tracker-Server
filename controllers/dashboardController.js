const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

const getDashboardData = async (req, res) => {
    try {
        const userId = req.user;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is missing' });
        }

        const castedUserId = new mongoose.Types.ObjectId(userId);
        console.log('Casted User ID:', castedUserId);

        const totalExpenses = await Expense.aggregate([
            { $match: { userId: castedUserId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalIncome = await Income.aggregate([
            { $match: { userId: castedUserId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalExpensesValue = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
        const totalIncomeValue = totalIncome.length > 0 ? totalIncome[0].total : 0;

        const totalBudget = totalIncomeValue - totalExpensesValue;

        res.status(200).json({
            totalIncome: totalIncomeValue,
            totalExpenses: totalExpensesValue,
            totalBudget,
        });

    } catch (error) {
        console.error('Error en getDashboardData:', error);
        res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
    }
};

module.exports = { getDashboardData };
