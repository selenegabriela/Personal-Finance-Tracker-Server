const mongoose = require("mongoose");

const BudgetGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly'
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('BudgetGoal', BudgetGoalSchema)