const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('./../server.js')
const { Todo } = require('./../models/todo.js')

// テスト用データ
const todos = [{
  _id: new ObjectID(), // id作成
  text: 'First test todo' // テスト用テキスト
}, {
  _id: new ObjectID(),
  text: 'Second test todo'
}]


// test開始前にデータ・ベースを空にし、データ入力
beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos)
  }).then(() => done())
})

describe('POST /todos', () => {
  // 入力テスト(正常な値が入力)
  it('should create a new todo', (done) => {
    var text = 'Text todo text'

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        // server.jsで、todoを保存したら、内容を返すようにしている。それが入力値と一致しているか
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        // 一致していなかった場合
        if (err) {
          return done(err)
        }

        // DBに保存されている値が正しいかのtest
        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text)
          done()
        }).catch((err) => done(err))
      })
  })

  // 不正な値が入力された場合のtest
  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if( err ) {
          return done(err)
        }
        Todo.find().then((todos) => {
          // DBに保存されていないか
          expect(todos.length).toBe(2)
          done()
        }).catch((err) => done(err))
      })
  })

  // todo一覧取得
  describe('GET /todos', () => {
    it('should get all todos', (done) => {
      request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
          expect(res.body.todos.length).toBe(2)
        })
        .end(done)
    })
  })

  // todo id付きで取得
  describe('GET /todos/:id', () => {
    // id部分に正しい値が入力された場合
    it('should return todo doc', (done) => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`) // idをテスト用データから取得し、16進数表記の文字列に変換
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(todos[0].text) // 返ってきた値が、テスト用データと等しいか
        })
        .end(done)
    })

    // id部分に形式は正しいが、存在しないidが入力された場合
    it('should return 404 if todo not found', (done) => {
      var hexId = new ObjectID().toHexString() // 新しいIDを作成
      request(app)
        .get(`/todos/${hexId}`)
        .expect(404)
        .end(done)
    })

    // id部分に不正な形式が入力された場合
    it('should return 404 from non-object ids', (done) => {
      var invalidId = '123abc';
      request(app)
        .get(`/todos/${invalidId}`)
        .expect(404)
        .end(done)
    })
  })
})
