const express = require('express')
const { addExpense,getExpenses,getExpense,updateExpenses, deleteExpenses } = require('../controllers/expenseController')
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router();

router.post('/', authMiddleware, addExpense)
router.get('/', authMiddleware, getExpenses)
router.get('/:id', authMiddleware, getExpense)
router.put('/:id', authMiddleware, updateExpenses)
router.delete('/:id', authMiddleware, deleteExpenses)

module.exports = router;