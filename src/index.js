const express = require('express')
require('./db/mongoose')
const users_controller = require('./controllers/users_controller')
const tasks_controller = require('./controllers/tasks_controller')

const app = express()
const port = process.env.PORT

// app.use((req, res, next) => {
//     res.status(503).send("System under maintenance. Will be online shortly")
// })

app.use(express.json())

app.use(users_controller)
app.use(tasks_controller)


app.listen(port, () => {
    console.log('Server is running on port ' + port)
})
