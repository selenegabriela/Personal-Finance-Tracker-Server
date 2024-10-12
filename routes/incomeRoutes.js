const express = require('express')
const {addIncome, getIncome, updateIncome, deleteIncome} = require('../controllers/incomeController')
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router();

router.post('/', authMiddleware, addIncome)
router.get('/', authMiddleware, getIncome)
router.put('/:id', authMiddleware, updateIncome)
router.delete('/:id', authMiddleware, deleteIncome)

module.exports = router;