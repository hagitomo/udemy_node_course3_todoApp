const expect = require('expect')
const request = require('supertest')

const { app } = require('./../server.js')
const { Todo } = require('./../models/todo.js')


const Todos = [{
  text: 'First test todo'
}, {
  text: 'Second test todo'
}]


// test開始前にデータ・ベースを空にし、データ入力
beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(Todos)
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

})
