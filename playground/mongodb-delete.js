const MongoConnection = {
  URL: "mongodb://user:user@localhost:27017/?authMechanism=SCRAM-SHA-1&authSource=TodoApp",
  DATABASE: "TodoApp",
  OPTIONS: {
    family: 4, // ipv4を指定（v6が優先され遅くなるため）
  }
}

//const MongoClient = require('mongodb').MongoClient
const { MongoClient, ObjectID } = require('mongodb') // 上記と等しい
var obj = new ObjectID() // object IDをどこでも使用できる


MongoClient.connect(MongoConnection.URL, MongoConnection.OPTIONS, (err, client) => {
  if( err ) {
    return console.log('unable to connect')
  }

  console.log('success! connect server')
  const db = client.db(MongoConnection.DATABASE)

  // deleteMany
  // db.collection('Todos').deleteMany({text: 'eat lunch'}).then((result) => {
  //   console.log(result)
  // })

  // deleteOne
  // db.collection('Todos').deleteOne({text: 'eat launch'}).then((result) => {
  //   console.log(result)
  // })

  // findOne and delete
  // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
  //   console.log(result)
  // })

  db.collection('Users').findOneAndDelete({name: 'hagiwara'}).then((result) => {
    console.log(result)
  })

  // client.close()
})
