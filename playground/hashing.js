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

