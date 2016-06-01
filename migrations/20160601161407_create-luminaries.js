exports.up = function (knex, Promise) {
  console.log('Create luminaries table')
  return knex.schema.createTableIfNotExists('luminaries', function (table) {
    table.increments('id')
    table.string('firstName')
    table.string('lastName')
  })
}

exports.down = function (knex, Promise) {
  console.log('Dropping luminaries table')
  return knex.schema.dropTableIfExists('luminaries').then(function () {
    console.log('luminaries table was dropped')
  })
}
