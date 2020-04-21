const mongoose = require('mongoose')


const taskSchema = new mongoose.Schema({
    task: {
        type: String,
        trim: true,
        required: true
    },
    completedStatus: {
        type: Boolean,
        default: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Tasks', taskSchema)

module.exports = Task