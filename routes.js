var data = require('./data')

module.exports = {
  index: index,
  list: list,
  luminary: luminary,
  create: create,
  add: add,
  edit: edit,
  update: update,
  addPhoto: addPhoto
}

function index (req, res) {
  var model = {
    layout: 'main',
    title: 'Home',
    isHome: true
  }
  res.render('index', model)
}

function list (req, res) {
  var model = {
    layout: 'main',
    title: 'List'
  }
  data.getAllLuminaries().then(function (luminaries) {
    model.luminaries = luminaries
    res.render('list', model)
  })
}

function luminary (req, res) {
  var id = req.query.id
  if (!id) {
    return res.sendStatus(404)
  }
  data.getLuminaryById(id).then(function (results) {
    var model = {
      layout: 'main',
      title: 'Luminary',
      luminary: getLuminary(results),
      photos: getPhotos(results)
    }
    res.render('luminary', model)
  })
}

function getLuminary (data) {
  return {
    id: data[0].id,
    firstName: data[0].firstName,
    lastName: data[0].lastName
  }
}

function getPhotos (data) {
  return data.map(function (photo) {
    return {
      id: photo.photoId,
      photoUrl: photo.imageUrl
    }
  })
}

function create (req, res) {
  var model = {
    layout: 'main',
    title: 'Create'
  }
  res.render('create', model)
}

function add (req, res) {
  var firstName = req.body.firstName
  var lastName = req.body.lastName
  data.addLuminary(firstName, lastName)
    .then(function () {
      res.redirect('/list')
    })
    .catch(function (err) {
      res.status(500).send(err)
    })
}

function edit (req, res) {
  var id = req.query.id
  if (!id) {
    return res.sendStatus(404)
  }
  data.getLuminaryById(id)
    .then(function (results) {
      if (!results) {
        return res.sendStatus(404)
      }
      var model = {
        layout: 'main',
        title: 'Edit',
        luminary: getLuminary(results),
        photos: getPhotos(results)
      }
      return res.render('edit', model)
    })
    .catch(function (err) {
      res.status(500).send(err)
    })
}

function update (req, res) {
  var id = req.body.id
  var first = req.body.firstName
  var last = req.body.lastName
  if (!id) {
    return res.sendStatus(500)
  }
  data.updateLuminary({
    firstName: first,
    lastName: last,
    id: id
  })
    .then(function () {
      return res.redirect('/luminary?id=' + id)
    })
    .catch(function (err) {
      res.status(500).send(err)
    })
}

function addPhoto (req, res) {
  var id = req.body.id
  var photoUrl = req.body.photoUrl
  data.addNewPhoto(id, photoUrl)
    .then(function () {
      return res.redirect('/luminary?id=' + id)
    })
    .catch(function (err) {
      res.status(500).send(err)
    })
}
