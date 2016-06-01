exports.seed = function (knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('luminaries').del(),

    // Inserts seed entries
    knex('luminaries').insert({firstName: 'Albert', lastName: 'Einstein'}),
    knex('luminaries').insert({firstName: 'Nicola', lastName: 'Tesla'}),
    knex('luminaries').insert({firstName: 'Haskell', lastName: 'Curry'})
  )
}
