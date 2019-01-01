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

  // db.collection('Todos').find({
  //   _id: new ObjectID('5c2ad385d972ed22a872f7ad')
  // }).toArray().then((docs) => {
  //   console.log('Todos')
  //   console.log(JSON.stringify(docs, undefined, 2))
  // }, (err) => {
  //   console.log('Unable to fetch todos', err)
  // })

  // db.collection('Todos').find().count().then((count) => {
  //   console.log(`Todos count : ${count}`)
  // }, (err) => {
  //   console.log('Unable to fetch', err)
  // })

  db.collection('Users').find({name: 'hagiwara'}).count().then((count) => {
    if(count > 0) {
      console.log('hagiwara')
    } else {
      console.log('hagiwaraはいない')

    }
  }, (err) => {
    console.log(err)
  })
  // client.close()
})
