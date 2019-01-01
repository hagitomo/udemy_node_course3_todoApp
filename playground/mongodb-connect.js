const MongoConnection = {
  URL: "mongodb://user:user@localhost:27017/?authMechanism=SCRAM-SHA-1&authSource=TodoApp",
  DATABASE: "TodoApp",
  OPTIONS: {
    family: 4, // ipv4を指定（v6が優先され遅くなるため）
  }
}

//const MongoClient = require('mongodb').MongoClient
const { MongoClient, ObjectID } = require('mongodb') // 上記と等しい
var obj = new ObjectID() // object IDを自由に扱える


MongoClient.connect(MongoConnection.URL, MongoConnection.OPTIONS, (err, client) => {
  if( err ) {
    return console.log('unable to connect')
  }

  console.log('success! connect server')
  const db = client.db(MongoConnection.DATABASE)

  db.collection('Todos').insertOne({
    text: 'Somthing to do',
    completed: false
  }, (err, result) => {
    if (err) {
      return console.log('unable to insert todo', err)
    }

    console.log(JSON.stringify(result.ops, undefined, 2))
  })

  client.close()
})
