exports.up = function (knex, Promise) {
  return knex.schema.createTableIfNotExists('photos', function (table) {
    console.log('Creating photos table')
    table.increments('id').primary()
    table.string('imageUrl')
    table.integer('luminary_id').references('luminaries.id')
    console.log('Created photos table')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('photos', function () {
    console.log('Dropped photos table')
  })
}
