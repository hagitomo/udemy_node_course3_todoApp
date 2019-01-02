const { ObjectID } = require('mongodb')

const { mongoose } = require('./../server/db/mongoose.js')
const { Todo } = require('./../server/models/todo.js')
const { User } = require('./../server/models/user.js')

// すべて削除
// Todo.remove({}).then((result) => {
//   console.log(result)
// })

// idで指定して削除、残ったデータが、callbackに渡される
Todo.findByIdAndRemove('5c2cbd17671b421d281cf4de').then((todo) => {
  console.log(todo)
})
