const { User } = require('./../models/user.js')

const authenticate = ( req, res, next ) => {
  var token = req.header('x-auth')

  User.findByToken(token).then((user) => {
    if ( !user ) {
      return Promise.reject()
    }

    // リクエストオブジェクトを書き換え,
    // tokenから見つけたユーザーを要求するようにする
    req.user = user
    req.token = token
    next()
  }).catch((err) => {
    res.status(401).send()
  })
}

module.exports = {
  authenticate
}
