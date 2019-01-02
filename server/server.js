var express = require('express')
var bodyParser = require('body-parser')

var { mongoose } = require('./db/mongoose.js') // mongoose
const { ObjectID } = require('mongodb')

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

// /todosにパラメータ付きでアクセス
app.get('/todos/:id', (req, res) => {
  var id = req.params.id

  // idの部分がidの形式にあっていない場合
  if( !ObjectID.isValid(id) ) {
    res.status(404).send()
  }

  Todo.findById(id).then(( todo ) => {
    // 該当するデータがない場合
    if ( !todo ) {
      res.status(404).send()
    }
    res.send( {todo} )
  }).catch(( err ) => {
    res.status(400).send(err)
  })
})


app.listen(3000, () => {
  console.log('Started on port 3000 ........')
})

module.exports = { app }
