var express = require('express')
var hbs = require('express-handlebars')
var bodyParser = require('body-parser')
var path = require('path')

var routes = require('./routes')
var PORT = process.env.PORT || 3000

var app = express()

app.engine('hbs', hbs({extname: 'hbs'}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', routes.index)
app.get('/list', routes.list)
app.get('/luminary', routes.luminary)
app.get('/create', routes.create)
app.post('/add', routes.add)
app.get('/edit', routes.edit)
app.post('/update', routes.update)
app.post('/add-photo', routes.addPhoto)

app.listen(PORT, function () {
  console.log('Listening on port', PORT)
})
