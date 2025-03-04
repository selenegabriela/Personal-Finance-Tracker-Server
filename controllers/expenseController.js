const Expense = require('../models/Expense')

const addExpense = async (req,res) => {
    try {
        const {amount, category, name} = req.body;
        const userId = req.user;

        const newExpense = new Expense({userId, amount, category})
        await newExpense.save();
        res.status(201).json(newExpense);


    } catch(error){
        console.error('Error adding expense:', error); 
        res.status(500).json({ message: 'Error adding expense' });
    }
}

const getExpenses = async (req,res) => {
    try {
        const { month, year } = req.query;
        const userId = req.user
        const expenses = await Expense.find({userId});

        const filteredExpenses = expenses.filter(expense => {
            const expenseData = new Date(expense.date)
            return expenseData.getFullYear().toString() === year && (expenseData.getMonth() + 1).toString() === month
        })
        
        res.status(201).json(filteredExpenses)
    } catch(error) {
        res.status(500).json({ message: 'Error fetching expenses' });
    }
}

const getExpense = async (req,res) => {
    try {
        const {id} = req.params
        const expense = await Expense.findById(id)
        
        res.status(201).json(expense)
    } catch(error) {
        res.status(500).json({ message: 'Error getting expense' });
    }
}

const updateExpenses = async (req,res) => {
    try {
        const {id} = req.params
        const {amount, category} = req.body
        const updatedExpense = await Expense.findByIdAndUpdate(id,{amount,category}, {new: true})
        
        res.status(201).json(updatedExpense)
    } catch(error) {
        res.status(500).json({ message: 'Error updating expense' });
    }
}

const deleteExpenses = async (req,res) => {
    try {
        const {id} = req.params
        await Expense.findByIdAndDelete(id)
        
        res.status(201).json('Expense deleted')
    } catch(error) {
        res.status(500).json({ message: 'Error deleting expense' });
    }
}

module.exports = {addExpense,getExpenses,getExpense,updateExpenses,deleteExpenses}