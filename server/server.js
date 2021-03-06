require('./config/config.js')

const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')

const { mongoose } = require('./db/mongoose.js') // mongoose
const { ObjectID } = require('mongodb')

const { Todo } = require('./models/todo.js')
const { User } = require('./models/user.js')
const { authenticate } = require('./middlewear/authenticate.js')
const bcrypt = require('bcryptjs')

const app = express()
const port = process.env.PORT // herokuであれば環境変数使用、localでは3000

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('hello')
})

// todoリストにデータ送信（POST）時のアクセス
app.post('/todos',authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  })

  todo.save().then((doc) => {
    res.send(doc)
  }, (err) => {
    res.status(400).send(err)
  })
})

// todoリストに通常アクセス(get) DBのtodoリストを表示
app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos})
  }, (err) => {
    res.status(400).send(err)
  })
})

// todoリストににパラメータ付きでアクセス
app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id

  // idの部分がidの形式にあっていない場合
  if( !ObjectID.isValid(id) ) {
    return res.status(404).send()
  }

  Todo.findOne({
      _id: id,
      _creator: req.user._id
    })
    .then(( todo ) => {
    // 該当するデータがない場合
    if ( !todo ) {
      return res.status(404).send()
    }
    res.send( {todo} )
  }).catch(( err ) => {
    res.status(400).send()
  })
})

// todoリストから削除
app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id

  // idの形式が正しくない
  if ( !ObjectID.isValid(id) ) {
    return res.status(404).send()
  }

  // idと作成者が一致
  Todo.findOneAndRemove(
    { _id: id, _creator: req.user._id },
    { rawResult: true }
    ).then(( todo ) => {
    // idに該当するデータがない
    if ( !todo ) {
      return res.status(404).send()
    }

    res.send( {todo} )
  }).catch(( err ) => {
    return res.status(400).send()
  })
})


// todoリストを更新
app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id
  var body = _.pick(req.body, ['text', `completed`]) // 更新するプロパティをオブジェクトで取得

  // idの形式が不正
  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  // completedがbooleanの形式 && 入力値がtrue
  if (_.isBoolean(body.completed) && body.completed) {
    // completedAtを現在時間で更新
    body.completedAt = new Date().getTime()
  } else {
    // completedがfalseなので、falseで更新
    body.completed = false
    body.completedAt = null
  }

  Todo.findOneAndUpdate({
      _id: id,
      _creator: req.user._id
    },
    { $set: body }, // 更新する値
    { new: true } // 更新後の結果を返す
  ).then((todo) => {
    if (!todo) { // 値がなかった場合
      return res.status(404).send()
    }

    res.send({todo})
  }).catch(( err ) => {
    res.status(400).send()
  })
})

// user登録
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password'])
  var user = new User(body)

  user.save().then(() => {
    // ユーザー情報を保存後、tokenを発行し、それを返す
    return user.generateAuthToken()

  }).then((token) => {
    // headerの`x-auth`にtoken情報をつけて返却する
    res.header('x-auth', token).send(user)

  }).catch((err) => {
    res.status(400).send(err)
  })
})

// user マイページ
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

// user ログイン
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password'])

  // emailとpasswordから認証判定
  User.findByCredentials(body.email, body.password).then((user) => {
    // 認証が成功した場合、tokenを再発行し、headerに付加
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user)
    })
  }).catch((err) => {
    res.status(400).send()
  })
})

// user logout
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  }, () => {
    res.status(400).send()
  })
})

app.listen(port, () => {
  console.log(`Started on port ${port} ........`)
})

module.exports = { app }
