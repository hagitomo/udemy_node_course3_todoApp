// mongoose
var { mongoose } = require('../db/mongoose.js')

// データベース`User`を定義
var User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  age: {
    type: Boolean
  },

})

module.exports = { User }
