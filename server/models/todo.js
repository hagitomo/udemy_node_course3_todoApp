// mongoose
var { mongoose } = require('../db/mongoose.js')

// データベース`Todo`を定義
var Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: { // 作成者
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
})

module.exports = { Todo }
