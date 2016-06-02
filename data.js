var knex = require('knex')
var config = require('./knexfile')

module.exports = {
  getAllLuminaries: getAllLuminaries,
  getLuminaryById: getLuminaryById,
  addLuminary: addLuminary,
  updateLuminary: updateLuminary,
  addNewPhoto: addNewPhoto
}

function getConnection () {
  return knex(config.development)
}

function getAllLuminaries () {
  var connection = getConnection()
  var luminaries = connection('luminaries').select()
  return luminaries
}

function getLuminaryById (id) {
  var connection = getConnection()
  var luminary = connection('luminaries')
    .leftJoin('photos', 'luminaries.id', 'photos.luminary_id')
    .select('luminaries.id as id', 'firstName', 'lastName', 'photos.id as photoId', 'imageUrl')
    .where('luminaries.id', '=', id)
  return luminary
}

function addLuminary (firstName, lastName) {
  var connection = getConnection()
  return connection('luminaries')
    .insert({
      firstName: firstName,
      lastName: lastName
    })
}

function updateLuminary (luminary) {
  var connection = getConnection()
  return connection('luminaries')
    .where('id', '=', luminary.id)
    .update(luminary)
}

function addNewPhoto (id, photoUrl) {
  var connection = getConnection()
  return connection('photos')
    .insert({
      imageUrl: photoUrl,
      luminary_id: id
    })
}
