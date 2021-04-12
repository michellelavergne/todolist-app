// Connects express
const express = require('express')
// Renames express to just be app.
const app = express()
// Connects mongo client - connects to database
const MongoClient = require('mongodb').MongoClient
// the Port
const PORT = 2121
require('dotenv').config()

// Holds the database
let db,
// string to use to connect to Mongo Atlas
    dbConnectionStr = process.env.DB_STRING,
// Names the DB!
    dbName = 'todo'

// Connects to the database -takes in connection string and object that is special to not get errors lol
MongoClient.connect(dbConnectionStr, {useUnifiedTopology: true})
    .then(client => {
        // Tells us we're connected to the database
        console.log(`Hey, connected to ${dbName} database`)
        db = client.db(dbName)
    })
    .catch (err => {
        console.log(err)
    })



// Set up the server
app.set('view engine', 'ejs')
// Sees inside static folder
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true}))
// Sees json
app.use(express.json())

// Serves up the index.ejs file
app.get('/', async (req, res) => {
    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    res.render('index.ejs', {zebra: todoItems, left: itemsLeft})

    
})

// the post request then send to mongodb, finds all the todos and creates an array, goes into data and passes in the zebra key value pair
app.post('/createTodo', (req, res) => {
    db.collection('todos').insertOne({todo: req.body.todoItem, completed: false})
    .then(result => {
        console.log('Todo has been added!')
        res.redirect('/')
    })
})
// Marks the item as complete
app.put('/markComplete', (req,res) =>{
db.collection('todos').updateOne({todo: req.body.rainbowUnicorn}, {
    $set: {
        completed: true
    }
})
.then(result =>{
    console.log('Marked Complete')
    res.json('Marked Complete')
})
} )

// undo
app.put('/undo', (req,res) =>{
db.collection('todos').updateOne({todo: req.body.rainbowUnicorn}, {
    $set: {
        completed: false
    }
})
.then(result =>{
    console.log('Marked Complete')
    res.json('Marked Complete')
})
})

// Deletes item
app.delete('/deleteTodo', (req, res) =>{
    
    db.collection('todos').deleteOne({todo: req.body.rainbowUnicorn})
    .then(result =>{
        console.log('deleted todo')
        res.json('Deleted it!')
    })
    .catch(err => console.log(err))
})

// Starts the server
app.listen(process.env.PORT || PORT, () => {
    console.log('Server is running, you better catch it!')
})