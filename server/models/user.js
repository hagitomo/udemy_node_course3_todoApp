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
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString()

  // アクセス権とtokenをもつ配列作成
  user.tokens = user.tokens.concat([{ access, token} ])

  // dbに保存して、tokenを返す
  return user.save().then(() => {
    return token
  })
}

// tokenから、一致するユーザーを見つける
UserSchema.statics.findByToken = function( token ) {
  var User = this
  var decoded;

  // tokenがあれば、tokenから情報を復元
  try {
    decoded = jwt.verify(token, 'abc123')
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
