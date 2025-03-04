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

        let budgetGoals = await BudgetGoal.find({
            userId: castedUserId,
            date: { $gte: startDate, $lte: endDate }
        });
        

        if (budgetGoals.length === 0 && selectedMonth > 0) {

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


        const expensesByCategory = await Expense.aggregate([
            { $match: { userId: castedUserId, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);

        const expensesByCategoryObj = expensesByCategory.reduce((acc, expense) => {
            acc[expense._id] = expense.total;
            return acc;
        }, {});


        const totalExpenses = await Expense.aggregate([
            { $match: { userId: castedUserId, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);


        const totalIncome = await Income.aggregate([
            { $match: { userId: castedUserId, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        let incomes = [];

        if (selectedMonth > 0) {
            const prevStartDate = new Date(selectedYear, selectedMonth - 1, 1);
            const prevEndDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

            const previousIncomes = await Income.find({
                userId: castedUserId,
                date: { $gte: prevStartDate, $lte: prevEndDate },
                recurring: true
            });

            if (previousIncomes.length > 0) {
                const currentStartDate = new Date(selectedYear, selectedMonth, 1);
                const currentEndDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

                const existingIncomes = await Income.find({
                    userId: castedUserId,
                    date: { $gte: currentStartDate, $lte: currentEndDate },
                    source: { $in: previousIncomes.map(income => income.source) }
                });

                const existingSources = new Set(existingIncomes.map(income => income.source));
                const newIncomes = previousIncomes
                    .filter(income => !existingSources.has(income.source)) // Evitar duplicados
                    .map(income => ({
                        userId: income.userId,
                        category: income.category,
                        amount: income.amount,
                        source: income.source,
                        date: currentStartDate, 
                        recurring: true
                    }));

                if (newIncomes.length > 0) {
                    await Income.insertMany(newIncomes);
                    incomes = [...incomes, ...newIncomes];
                }
            }
        }

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
