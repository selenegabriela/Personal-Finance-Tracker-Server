const BudgetGoal = require('../models/BudgetGoal')

const addBudgetGoal = async (req,res) =>{
    try {
        const { category, amount, period } = req.body;
        const userId = req.user;

        const newBudgetGoal = new BudgetGoal({ userId, category, amount, period})
        await newBudgetGoal.save()
        res.status(201).json(newBudgetGoal);

    } catch (error) {
        console.error('Error adding budget goal:', error); 
        res.status(500).json({ message: error });
    }
}

const getBudgetGoal = async (req,res) => {
    try {
        const userId = req.user
        const budgetGoals = await BudgetGoal.find({userId})
        console.log(budgetGoals);
        res.status(201).json(budgetGoals);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

const updateBudgetGoal = async (req,res) => {
    try {
        const {id} = req.params
        const {category, amount, period} = req.body
        const updatedBudgetGoal = await BudgetGoal.findByIdAndUpdate(id,{amount,category,period}, {new: true})
        
        res.status(201).json(updatedBudgetGoal)
    } catch(error) {
        res.status(500).json({ message: 'Error updating budget goal'});
    }
}

const deleteBudgetGoal = async (req,res) => {
    try {
        const {id} = req.params
        await BudgetGoal.findByIdAndDelete(id)
        
        res.status(201).json('Budget goal deleted')
    } catch(error) {
        res.status(500).json({ message: 'Error deleting budget goal' });
    }
}


module.exports = {addBudgetGoal, getBudgetGoal, updateBudgetGoal, deleteBudgetGoal}