const { ObjectID } = require('mongodb')

const { mongoose } = require('./../server/db/mongoose.js')
const { Todo } = require('./../server/models/todo.js')
const { User } = require('./../server/models/user.js')

var id = '5c2c4cd951d674106fd4dd8b'

// idの形式が正しいか確認
if( !ObjectID.isValid(id) ) {
  console.log('ID not valid')
}

// // 一致してるものをすべて
// Todo.find({
//   _id: id
// }).then(( todos ) => {
//   console.log('Todos', todos)
// })

// // 一致しているもので、最初の一つ
// Todo.findOne({
//   _id: id
// }).then(( todo ) => {
//   console.log('Todo', todo)
// })

// // idで検索
// Todo.findById(id).then(( todo ) => {
//   if ( !todo ) {
//     return console.log('Id not found')
//   }
//   console.log('Todo', todo )
// }).catch(( err ) => console.log(err)) // idの値が不正（桁が多いなど）のときは、エラーとして扱われる

User.find({
  _id: id
}).then(( users ) => {
  console.log('Users', users)
})


// User.findOne({
//   _id: id
// }).then(( todo ) => {
//   console.log('User', user)
// })

User.findById(id).then(( user ) => {
  if ( !user ) {
    return console.log('id not found')
  }
  console.log('Todo', user)
}).catch(( err ) => console.log(err))

