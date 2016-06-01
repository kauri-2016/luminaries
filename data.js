var knex = require('knex')
var config = require('./knexfile')

module.exports = {
  getAllLuminaries: getAllLuminaries
}

function getAllLuminaries () {
  var luminaries = knex(config.development)('luminaries')
  return luminaries.select()
}
