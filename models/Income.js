const mongoose = require('mongoose')

const IncomeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    recurring: {
        type: Boolean,
        default: false,
    },
})

module.exports = mongoose.model('Income', IncomeSchema);