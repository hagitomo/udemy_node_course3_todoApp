// 環境変数
const env = process.env.NODE_ENV  || 'development' // (heroku上だと`production`に)

if (env === 'development' || env === 'test' ) {
  var config = require('./config.json')
  var envConfig = config[env]

  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key]
  })
}
