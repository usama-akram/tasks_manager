const express = require('express')
const Task = require('../models/task')
const Auth = require('../middleware/auth')
const tasks_controller = new express.Router()


tasks_controller.post('/tasks',Auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        author: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    }
    catch(e) {
        res.status(400).send(e.name)
    }
})
//GET /tasks?completedStatus=true
tasks_controller.get('/tasks',Auth, async (req, res) => {
    const status = {}
    const sort = {}
    if (req.query.completedStatus) {
        status.completedStatus = req.query.completedStatus === 'true'
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path: 'userTasks',
            match: status,
            options: {
                limit: 10,
                skip: 10 * (parseInt(req.query.page) - 1),
                sort: sort
            }
        }).execPopulate()
        res.status(200).send(req.user.userTasks)
    }
    catch(e) {
        res.status(400).send(e)
    }
})
tasks_controller.get('/tasks/:id',Auth, async (req, res) => {

    try {
        const task = await Task.findOne({"_id": req.params.id, author: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    }
    catch(e) {
        res.status(400).send(e)
    }
})
tasks_controller.patch('/tasks/:id',Auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['completedStatus']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({error: "Invalid Updates"})
    }
    try {
        const task = await Task.findOne({_id: req.params.id, author: req.user._id})
        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.status(200).send(task)
    }
    catch(e) {
        res.status(400).send(e)
    }
})
tasks_controller.delete('/tasks/:id',Auth, async (req, res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, author: req.user._id})
        
        // const task = await Task.findByIdAndDelete(req.params.id)

        if (!task) {
            res.status(404).send()
        }
        await task.delete()

        res.status(200).send()
    }
    catch(e) {
        res.status(500).send()
    }
})

module.exports = tasks_controller