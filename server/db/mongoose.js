var mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://user:user@localhost:27017/TodoApp')

module.exports = { mongoose }

