const mongoose = require('mongoose')
// const validator = require('validator')

const connectionUrl = process.env.MONGODB_URL

mongoose.connect(connectionUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})