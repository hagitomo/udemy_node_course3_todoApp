const { SHA256 } = require('crypto-js')


const jwt = require('jsonwebtoken')

var data = {
  id: 10
}

// dataをもとに、keyを利用し暗号化して、tokenを発行
var token = jwt.sign(data, '123abc')
console.log(token)

// 発行されたtokenから復元
// token と keyが正しくないとエラー
var decoded = jwt.verify(token, '123abc')
console.log('decoded', decoded)

// https://jwt.io/
// https://qiita.com/kaiinui/items/21ec7cc8a1130a1a103a
// 発行されたtokenから復元された情報
var payload = {
  "id": 10, // id
  "iat": 1546500723 // 有効期限
}


const bcrypt = require('bcryptjs')

var password = '123abc!'

// hash化
bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash)
  })
})

var hashedPassword = '$2a$10$dRpuWFX/tAPO9uRT0yVA5eXzPr6KO1o8LUX77xbA5w66dnborJNJ2'

// hash化したものと、元のpasswordを比較
bcrypt.compare('123abc!', hashedPassword, (err, res) => {
  console.log(res)
})
