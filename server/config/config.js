// 環境変数
const env = process.env.NODE_ENV  || 'development' // (heroku上だと`production`に)

if (env === 'development') {
  process.env.PORT = 3000
  process.env.MONGODB_URI = 'mongodb://user:user@localhost:27017/TodoApp'
} else if (env === 'test' ) { // test実行時にenvを`test`に設定してある（package.json）
  process.env.PORT = 3000
  process.env.MONGODB_URI = 'mongodb://user:user@localhost:27017/TodoAppTest'
}
