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

  db.collection('Users').findOneAndUpdate(
    { "_id": new ObjectID('5c2af658898562190df8b8c7')},
    { $set: { name: 'honda'},
      $inc: { age: 1 }
    },
    { returnOriginal: false }
  ).then((result) => {
    console.log(result)
  })

  // client.close()
})
