var knex = require('knex')
var config = require('./knexfile')

module.exports = {
  getAllLuminaries: getAllLuminaries,
  getLuminaryById: getLuminaryById,
  addLuminary: addLuminary,
  updateLuminary: updateLuminary
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
  var luminary = connection('luminaries').where('id', '=', id).first()
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
