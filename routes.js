var data = require('./data')

module.exports = {
  index: index,
  list: list
}

function index (req, res) {
  var model = {title: 'Home'}
  res.render('index', model)
}

function list (req, res) {
  var model = {title: 'List'}
  data.getAllLuminaries().then(function (luminaries) {
    model.luminaries = luminaries
    res.render('list', model)
  })
}
