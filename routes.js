module.exports = {
  index: index
}

function index (req, res) {
  var model = {title: 'Home'}
  res.render('index', model)
}
