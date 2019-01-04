const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('./../server.js')
const { Todo } = require('./../models/todo.js')
const { User } = require('./../models/user.js')

const { users, todos, populateTodos, populateUsers } = require('./seed/seed.js')


// test開始前にデータ・ベースを空にし、データ入力
beforeEach(populateUsers)
beforeEach(populateTodos)

// todos 入力テスト
describe('GET /todos', () => {
  // 正常な値が入力
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

// 削除
describe('DELETE /todo/:id', () => {
  // id部分に正しい値が入力された場合
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBeFalsy() // idは削除したため見つからない
      })
      .end(( err, res ) => {
        if (err) {
          return done(err)
        }

        // idは削除したため見つからない
        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeFalsy()
          done()
        }).catch(( err ) => {
          return done(err)
        })
      })
  })

  // id部分に形式は正しいが、存在しないidが入力された場合
  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString()
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(404)
      .end(done)
  })

  // id部分に不正な形式が入力された場合
  it('should return 404 from non-object ids', (done) => {
    var invalidId = '123abc'
    request(app)
      .delete(`/todos/${todos[0]}`)
      .expect(404)
      .end(done)
  })
})

// 更新
describe('PATCH /todos/:id', () => {
  // 更新が成功
  it('should update the todo', (done) => {
    var hexId = todos[0]._id.toHexString()
    var update = {
      "completed": true,
      "text": "udemy lessen"
    }

    request(app)
      .patch(`/todos/${hexId}`)
      .send(update)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(update.text)
        expect(res.body.todo.completed).toBe(true)
        expect(typeof res.body.todo.completedAt).toBe('number')
      })
      .end(done)
  })

  // completedがfalseの場合、completedAtの値がクリアされる
  it('should clear completedAt when todo is not completed', (done) => {
    var hexId = todos[1]._id.toHexString()
    var update = {
      "completed": false,
      "text": "new udemy lessen"
    }

    request(app)
      .patch(`/todos/${hexId}`)
      .send(update)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(update.text)
        expect(res.body.todo.completed).toBe(false)
        expect(res.body.todo.completedAt).toBeNull()
      })
      .end(done)
  })
})

// ユーザーページにアクセスした場合
describe('GET /users/me', () => {
  // すでにユーザーが認証されている
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString())
        expect(res.body.email).toBe(users[0].email)
      })
      .end(done)
  })

  // 認証されていない
  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({})
      })
      .end(done)
  })
})

// ユーザー登録
describe('POST /users', () => {
  // 登録成功
  it('should create a user', (done) => {
    var email = "jiajijid@jadsjncs.com"
    var password = "knvojknsfnv!!"

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy() // headerにx-authが付加されているか
        expect(res.body._id).toBeTruthy() // idが存在するか
        expect(res.body.email).toBe(email) // emailが存在するか
      })
      .end(( err ) => {
        if ( err ) {
          return done(err)
        }

        // dbに登録されているか
        User.findOne({email}).then(( user ) => {
          expect(user).toBeTruthy() // ユーザーが存在するか
          expect(user.password).not.toBe(password) // パスワードがhash化され、登録時と違う
          done()
        }).catch((err) => {
          return done(err)
        })
      })
  })

  // 登録時の情報が正しくない
  it('should return validation errors if request invalid', (done) => {
    var email = "jiajijid@jadsjncs"
    var password = "knvo"

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done)
  })

  // 登録されたemailがすでに使用されている
  it('should not create user if email in use', (done) => {

    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'knvojknsfnv!!'
      })
      .expect(400)
      .end(done)
  })
})

// ログイン処理のテスト
describe('POST /users/login', () => {
  // 登録テスト
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy() // headerにtokenが付加されているか
      })
      .end(( err, res) => {
        if ( err ) {
          return done(err)
        }

        // db上のユーザー登録されているtokenが、返却されたheaderのものを含むか
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          })
          done()
        }).catch((err) => {
          return done(err)
        })
      })
  })

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'err-pass'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).not.toBeTruthy()
      })
      .end(( err, res ) => {
        if ( err ) {
          return done(err)
        }

        // db上のユーザー登録されているtokenが存在しない
        User.findById([users[1]._id]).then((user) => {
          expect(user.tokens.length).toBe(0)
          done()
        }).catch((err) => {
          return done(err)
        })
      })
  })
})
