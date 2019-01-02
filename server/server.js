var express = require('express')
var bodyParser = require('body-parser')

var { mongoose } = require('./db/mongoose.js') // mongoose
const { ObjectID } = require('mongodb')

var { Todo } = require('./models/todo.js')
var { User } = require('./models/user.js')

var app = express()
const port = process.env.PORT || 3000 // herokuであれば環境変数使用、localでは3000

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
    return res.status(404).send()
  }

  Todo.findById(id).then(( todo ) => {
    // 該当するデータがない場合
    if ( !todo ) {
      return res.status(404).send()
    }
    res.send( {todo} )
  }).catch(( err ) => {
    res.status(400).send()
  })
})

// todosから削除
app.delete('/todos/:id', (req, res) => {
  var id = req.params.id

  // idの形式が正しくない
  if ( !ObjectID.isValid(id) ) {
    return res.status(404).send()
  }

  Todo.findByIdAndRemove(id,{rawResult: true}).then(( todo ) => {
    // idに該当するデータがない
    if ( !todo ) {
      return res.status(404).send()
    }

    res.send( {todo} )
  }).catch(( err ) => {
    return res.status(400).send()
  })
})


app.listen(port, () => {
  console.log(`Started on port ${port} ........`)
})

module.exports = { app }
