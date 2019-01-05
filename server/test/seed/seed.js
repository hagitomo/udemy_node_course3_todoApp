const { ObjectID } = require('mongodb')
const jwt = require('jsonwebtoken')

const { Todo } = require('../../models/todo.js')
const { User } = require('../../models/user.js')

// テスト用ユーザー
const userOneId = new ObjectID()
const userTwoId = new ObjectID()
const users = [{
  _id: userOneId,
  email: 'hogefuga@fuga.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, acess: 'auth'}, 'abc123').toString()
  }]
},{
  _id: userTwoId,
  email: 'piyo@piyo.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, acess: 'auth'}, 'abc123').toString()
  }]
}]

// テスト用データ
const todos = [{
  _id: new ObjectID(), // id作成
  text: 'First test todo', // テスト用テキスト
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}]


// test開始前にTodosデータ・ベースを空にし、データ入力
const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos)
  }).then(() => done())
}

// test開始前にUsersデータ・ベースを空にし、データ入力
const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save()
    var userTwo = new User(users[1]).save()

    return Promise.all([userOne, userTwo])
  }).then(() => done())
}

module.exports = {
  users,
  todos,
  populateTodos,
  populateUsers
}
