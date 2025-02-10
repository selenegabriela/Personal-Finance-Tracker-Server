const BudgetGoal = require('../models/BudgetGoal')

const addBudgetGoal = async (req,res) =>{
    try {
        const { category, amount} = req.body;
        const userId = req.user;

        const newBudgetGoal = new BudgetGoal({ userId, category, amount,})
        await newBudgetGoal.save()
        res.status(201).json(newBudgetGoal);

    } catch (error) {
        console.error('Error adding budget goal:', error); 
        res.status(500).json({ message: error });
    }
}

const getBudgetGoal = async (req,res) => {
    try {
        const { month, year } = req.query;
        const userId = req.user
        const budgetGoals = await BudgetGoal.find({userId})

        const filteredBudgetGoals = budgetGoals.filter(budgetGoal => {
            const budgetGoalData = new Date(budgetGoal.date)
            return budgetGoalData.getFullYear().toString() === year && (budgetGoalData.getMonth() + 1).toString() === month
        })

        res.status(201).json(filteredBudgetGoals);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

const updateBudgetGoal = async (req,res) => {
    try {
        const {id} = req.params
        const {category, amount} = req.body
        const updatedBudgetGoal = await BudgetGoal.findByIdAndUpdate(id,{amount,category}, {new: true})
        
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