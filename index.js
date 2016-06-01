var express = require('express')
var hbs = require('express-handlebars')
var path = require('path')

var routes = require('./routes')
var PORT = process.env.PORT || 3000

var app = express()

app.engine('hbs', hbs({extname: 'hbs'}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', routes.index)

app.listen(PORT, function () {
  console.log('Listening on port', PORT)
})
