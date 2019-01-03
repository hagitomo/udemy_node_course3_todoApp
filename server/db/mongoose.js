var mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI || 'mongodb://user:user@localhost:27017/TodoApp', {useNewUrlParser: true})

module.exports = { mongoose }

