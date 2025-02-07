const Income = require('../models/Income')

const addIncome = async(req,res) => {
    try {
        const {amount, source, recurring} = req.body;
        const userId = req.user;

        const newIncome = new Income({userId, amount, source, recurring})
        await newIncome.save()
        res.status(201).json(newIncome)


    } catch(error) {
        res.status(500).json({ message: 'Error adding income' });
    }
}

const getIncome = async(req,res) => {
    try {
        const { month, year } = req.query;
        const userId = req.user
        const incomes = await Income.find({userId});

        const filteredIncomes = incomes.filter(income => {
            const incomeData = new Date(income.date)
            return incomeData.getFullYear().toString() === year && (incomeData.getMonth() + 1).toString() === month
        })

        res.status(201).json(filteredIncomes)
    } catch(error) {
        res.status(500).json({ message: 'Error fetching incomes' });
    }
}

const updateIncome = async(req,res) => {
    try {
        const {id} = req.params
        const {amount, source, recurring} = req.body

        const updatedIncome = await Income.findByIdAndUpdate(id,{amount,source, recurring}, {new: true})
        res.status(201).json(updatedIncome)
    } catch (error) {
        console.log('error: ', error)
        res.status(500).json({ message: 'Error updating income' });
    }
}

const deleteIncome = async(req,res) => {
    try {
        const {id} = req.params
        await Income.findByIdAndDelete(id)

        res.status(201).json('Income deleted')        
    } catch (error) {
        console.log('here the mistake');
        res.status(500).json({ message: 'Error deleting income' });
    }
}

module.exports = {addIncome,getIncome,updateIncome,deleteIncome}