var express = require('express')
var bodyParser = require('body-parser')

var { mongoose } = require('./db/mongoose.js') // mongoose
var { Todo } = require('./models/todo.js')
var { User } = require('./models/user.js')

var app = express()
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('hello')
})

// /todosにデータ送信（POST）時のアクセス
app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  })

  todo.save().then((doc) => {
    res.send(doc)
  }, (err) => {
    res.status(400).send(err)
  })
})

// /todosに通常アクセス(get) DBのtodoリストを表示
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos})
  }, (err) => {
    res.status(400).send(err)
  })
})

app.listen(3000, () => {
  console.log('Started on port 3000 ........')
})

module.exports = { app }
