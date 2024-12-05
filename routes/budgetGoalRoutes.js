const express = require('express')
const {addBudgetGoal,getBudgetGoal,updateBudgetGoal, deleteBudgetGoal} = require('../controllers/budgetGoalController')
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router()

router.post('/', authMiddleware, addBudgetGoal)
router.get('/', authMiddleware, getBudgetGoal)
router.put('/:id', authMiddleware, updateBudgetGoal)
router.delete('/:id', authMiddleware, deleteBudgetGoal)

module.exports = router;



