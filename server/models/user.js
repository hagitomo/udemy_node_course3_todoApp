const { mongoose } = require('../db/mongoose.js')
const validator = require('validator') // バリデータ ライブラリ
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

// schema作成
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
    validate: { // custom validatio
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{ // tokenの設定
    access: { // アクセス権を保存
      type: String,
      required: true
    },
    token: { // tokenを保存
      type: String,
      required: true
    }
  }]
})

// ユーザーに返却するプロパティを id, emailに
UserSchema.methods.toJSON = function() {
  var user = this
  var userObject = user.toObject() // toObjectはmongooseのメソッド

  return _.pick(userObject, ['_id', 'email'])
}

// 作製したSchemaに `generateAuthTokenメソッド` を登録する
UserSchema.methods.generateAuthToken = function() {
  var user = this
  var access = 'auth'
  // `id`, `アクセス権`を暗号化したtoken発行
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString()

  // アクセス権とtokenをもつ配列作成
  user.tokens = user.tokens.concat([{ access, token} ])

  // dbに保存して、tokenを返す
  return user.save().then(() => {
    return token
  })
}

// tokenを削除する
UserSchema.methods.removeToken = function(token) {
  var user = this

  // 渡されたtokenと等しいtokenを持つユーザーを削除
  return user.update({
    $pull: {
      tokens: {token}
    }
  })
}

// tokenから、一致するユーザーを見つける
UserSchema.statics.findByToken = function( token ) {
  var User = this
  var decoded;

  // tokenがあれば、tokenから情報を復元
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch( err ) {
    return Promise.reject()
  }

  // 復元された情報に一致するユーザーを返す
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

// emailとpasswordからlogin判定
UserSchema.statics.findByCredentials = function (email, password) {
  var User = this

  // emailが一致するユーザーを探す
  return User.findOne({email}).then((user) => {
    // ユーザーが存在しない
    if (!user) {
      return Promise.reject()
    }

    return new Promise((resolve, reject) => {
      // 入力されたpassとdb登録のpassを比較
      bcrypt.compare(password, user.password, (req, res) => {
        if (res) {
          resolve(user)
        } else {
          reject()
        }
      })
    })
  })
}

// hash化して passwordを保存
UserSchema.pre('save', function (next) {
  var user = this

  // passwprdが変更された場合
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        // hash化したものを保存
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

// データベース`User`を定義
var User = mongoose.model('User', UserSchema)

module.exports = { User }
