const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const users_controller = new express.Router()
const auth = require('../middleware/auth')
const { sendWelcomeEmail,
    sendFeedbackRequestEmail } = require('../emails/accounts')

users_controller.post('/users/sign_up', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})

users_controller.post('/users/sign_in', async (req, res) => {
    const credentials = Object.keys(req.body)
    const allowedCredentials = ['email', 'password']
    const isValidOperation = credentials.every((credential) => allowedCredentials.includes(credential))
    
    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid Operation'})
    }
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user,token })
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})


users_controller.post('/users/sign_out', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((tokenObj) => {
            return tokenObj.token !== req.token 
        })
        await req.user.save()
        res.send()
    }
    catch(e) {
        res.status(500).send(e)
    }
})

users_controller.post('/users/sign_out_all', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch(e) {
        res.status(500).send(e)
    }
})

const uploads = multer({
    limits: {
        fileSize: 2500000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|png|jpeg|gif)$/)){
            return callback(new Error('File must be am Image'))
        }
        callback(undefined, true)
    }

})

users_controller.post('/users/avatar', auth, uploads.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width:250, height:250 }).toBuffer()
    req.user.avatar = buffer
    await req.user.save() 
    res.send(req.user)
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

users_controller.delete('/users/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send(req.user)
    }
    catch (e) {
        res.status(500).send({ error: error.message})
    }
})

users_controller.get('/users',auth, async (req, res) => {

    res.status(200).send(req.user)
})
users_controller.patch('/users',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        res.status(400).send({error: "Invalid Updates"})
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.status(200).send(req.user)
    }
    catch(e) {
        res.status(400).send(e)
    }
})
users_controller.delete('/users',auth, async (req, res) => {
    try {
        await req.user.remove()
        sendFeedbackRequestEmail(req.user.email, req.user.name)
        res.status(200).send()
    }
    catch(e) {
        res.status(500).send()
    }
})

module.exports = users_controller