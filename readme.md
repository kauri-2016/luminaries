# Database-driven web views

## Initial steps

* Create the app and set stuff up:

  ```sh
  git init
  nvm use 6
  npm init
  npm i tape --save-dev
  npm i knex sqlite3 pg --save
  npm i express express-handlebars body-parser --save
  npm i node-inspector node-dev --save-dev
  echo "node_modules" > .gitignore
  echo "*.sqlite3" >> .gitignore
  echo "6" > .nvmrc
  git add .
  git commit -m "Initial commit"
  ```

* Add scripts in `package.json` to run knex:

  ```js
  "scripts": {
    "debug": "node-inspector & node-dev --debug index.js"
    "db:config:make": "knex init",
    "migrate:make": "knex migrate:make",
    "migrate:latest": "knex migrate:latest",
    "migrate:rollback": "knex migrate:rollback",
    "seed:make": "knex seed:make",
    "seed:run": "knex seed:run",
    "start": "node index.js",
    "test": "tape test/**/*.js"
  },
  ```


## Create the server

* Add an `index.js` file with these contents:

  ```js
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

  app.listen(PORT, function () {
    console.log('Listening on port', PORT)
  })
  ```

* Add a `routes.js` file with these contents:

  ```js
  module.exports = {
    index: index
  }

  function index (req, res) {
    var model = {
      isHome: true,
      title: 'Home',
      layout: 'main'
    }
    res.render('index', model)
  }
  ```


## Create the main layout and index view

* Create a `views/layouts/main.hbs` layout:

  ```sh
    mkdir views/layouts
  ```

  ```xml
  <!DOCTYPE>
  <html>
  <head>
    <title>Luminaries {{title}}</title>
  </head>
  <body>
    {{{body}}}

    {{#unless isHome}}
    <p><a href="/">Home</a></p>
    {{/unless}}
  </body>
  </html>
  ```

* Create a `views/index.hbs` file with these contents:

  ```xml
  <h1>Luminaries {{title}}</h1>
  <p><a href="/create">Add a new luminary</a></p>
  <p><a href="/list">View luminaries</a></p>
  ```

* Start the server with `npm start` and check out http://localhost:3000.

* Stage and commit changes.


## Add data storage

* Create `knexfile.js` by running `npm run db:config:make`.

* Create a `luminaries` table by running `npm run migrate:make create-luminaries`.

* Edit the migration file accordingly:

  ```js
  exports.up = function (knex, Promise) {
    console.log('Creating luminaries table')
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
  ```

* Apply the migration file by running `npm run migrate:latest`.

* Open `dev.sqlite3` in the SQLite Manager tool and verify schema. Show _All files_ to see the file in the file browser.

* Create a new seed by running `npm run seed:make test-luminaries`.

* Open `seeds/test-luminaries.js`, change the table to `luminaries` and add some objects with `firstName` and `lastName` properties. For example, Ada Lovelace, Albert Einstein and Haskell Curry.

* Apply the seed data by running `npm run seed:run`.

* Refresh the `luminaries` table and verify the data was inserted.


## Show the list of luminaries

* Create the view `views/list.hbs`:

  ```xml
  <h1>Luminaries {{title}}</h1>
  <ul>
    {{#each luminaries}}
    <li>{{firstName}} {{lastName}}</li>
    {{/each}}
  </ul>
  ```

* Add the route in `index.js`:

  ```js
  ...
  app.get('/list', routes.list)
  ...
  ```

* Create a route in `routes.js` and render the view (without data):

  ```js
  module.exports = {
    index: index,
    list: list
  }

  ...

  function list (req, res) {
    var model = {
      title: 'List',
      layout: 'main'
    }
    res.render('list', model)
  }
  ```

* Run the server and verify the view is available.

* Create a `data` module that returns the list of luminaries:

  ```js
  var knex = require('knex')
  var config = require('./knexfile')

  module.exports = {
    getAllLuminaries: getAllLuminaries
  }

  function getConnection () {
    return knex(config.development)
  }

  function getAllLuminaries () {
    var connection = getConnection()
    var luminaries = connection('luminaries').select()
    return luminaries
  }
  ```

* Update the route to return data from the database:

  ```js
  var data = require('./data')
  ...
  function list (req, res) {
    var model = {
      title: 'List',
      layout: 'main'
    }
    data.getAllLuminaries().then(function (luminaries) {
      model.luminaries = luminaries
      res.render('list', model)
    })
  }
  ```

* Stage and commit the changes.


## Create and link to a luminary page

* Link each item in the `list.hbs` to a view that shows only one luminary:

  ```xml
  <ul>
    {{#each luminaries}}
    <li><a href="/luminary?id={{id}}">{{firstName}} {{lastName}}</a></li>
    {{/each}}
  </ul>
  ```

* Create a `/luminary` route in `routes.js` to show a single luminary:

  ```js
  module.exports = {
    ...
    luminary: luminary
  }

  function luminary (req, res) {
    var id = req.query.id
    if (!id) {
      return res.sendStatus(404)
    }
    data.getLuminaryById(id).then(function (theLuminary) {
      if (!luminary) {
        res.sendStatus(404)
      }
      var model = {
        layout: 'main',
        title: 'Luminary'
        luminary: theLuminary
      }
      res.render('luminary', model)
    }) 
  }
  ```

* Create the `getLuminaryById` function in `data.js`:

  ```js
  module.exports = {
    getAllLuminaries: getAllLuminaries,
    getLuminaryById: getLuminaryById
  }

  ...

  function getLuminaryById (id) {
    var connection = getConnection()
    var luminary = connection('luminaries').where('id', '=', id).first()
    return luminary
  }
  ```

* Create the `luminary.hbs` view:

  ```xml
  <h1>Luminary</h1>
  <p>Name: {{luminary.firstName}} {{luminary.lastName}}</p>
  ```

* Stage and commit your changes.


## Add a new luminary

* Create a new `/create` POST route in `index.js` and `routes.js` for showing a form for adding a luminary:

  ```js
  get.post('/create', routes.create)
  ```

  ```js
  module.exports = {
    ...
    create: create
  }

  ...

  function create (req, res) {
    var model = {
      layout: 'main',
      title: 'Create'
    }
    res.render('create', model)
  }
  ```
 
* Create a new `views/create.hbs` for the form:

  ```xml
  <h1>Add luminary</h1>
  <form action="/add" method="post">
    <input type="text" name="firstName" />
    <input type="text" name="lastName" />
    <button type="submit">Add luminary</button>
  </form>
  ```

* Start up the server and ensure the view is visible.

* Create a new `/add` route for POSTing to in `index.js` and `routes.js`:

  ```js
  app.post('/add', routes.add)
  ```

  ```js
  module.exports = {
    ...
    add: add
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
  ```

* Add the `addLuminary` function to `data.js`:

  ```js
  module.exports = {
    ...
    add: add
  }

  function add (firstName, lastName) {
    var connection = getConnection()
    return connection('luminaries')
      .insert({
        firstName: firstName,
        lastName: lastName
      })
  }
  ```

* Start the server and verify you can add new luminaries.

* Stage and commit your changes.


## Add an edit form to change luminaries

* Add an `/edit` route to `index.js` and `routes.js`:

  ```js
  app.get('/edit', routes.edit)
  ```

  ```js
  module.exports = {
    ...
    edit: edit
  }

  function edit (req, res) {
    var id = req.query.id
    if (!id) {
      return res.sendStatus(404)
    }
    data.getLuminaryById(id)
      .then(function (luminary) {
        if (!luminary) {
          return res.sendStatus(404)
        }
        var model = {
          layout: 'main',
          title: 'Edit',
          luminary: luminary
        }
        return res.render('edit', model)
      })
      .catch(function (err) {
        res.status(500).send(err)
      })
  }
  ```

* Add a `views/edit.hbs` to show the form for editing:

  ```xml
  <h1>Edit luminary</h1>
  <form action="/update" method="post">
    <input type="text" name="firstName" value="{{luminary.firstName}}" />
    <input type="text" name="lastName" value="{{luminary.lastName}}" />
    <input type="hidden" name="id" value="{{luminary.lastName}}" />
    <button>Save luminary</button>
  </form>
  ```

* Edit the `views/luminary.hbs` to add an edit button:

  ```xml
  <p>
    <a href="/edit?id={{id}}">Edit</a>
  </p>
  ```

* Add an `/update` route in `index.js` and `routes.js`:

  ```js
  app.post('/update', routes.update)
  ```

  ```js
  module.exports = {
    ...
    update: update
  }

  ...

  function update (req, res) {
    var id = req.body.id
    var first = req.body.firstName
    var last = req.body.lastName
    if (!id) {
      return res.sendStatus(404)
    }
    data.updateLuminary({
      firstName: first,
      lastName: last,
      id: id
    })
    .then(function (luminary) {
      return res.redirect('/luminary?id=' + id)
    })
    .catch(function (err) {
      res.status(500).send(err)
    })
  }
  ```

* Add the `updateLuminary` method to `data.js`:

  ```js
  module.exports = {
    ...
    updateLuminary: updateLuminary
  }

  ...

  function updateLuminary (luminary) {
    var connection = getConnection()
    return connection('luminaries')
      .where('id', '=', luminary.id)
      .update(luminary)
  }
  ```

* Start the server and ensure you can edit luminaries.

* Stage and commit your changes.


## Add a photos table

* Create a migration for a new `photos` table by running `npm run migrate:make create-photos-table`.

* Edit the new migration file:

  ```js
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
  ```

* Run the migration with `npm run migrate:latest`.


## Add the ability to add new photos

* Edit the form on `views/edit.hbs` to allow for adding photos:

  ```xml
  <form action="/add-photo" method="post">
    <input type="text" name="photoUrl">
    <input type="hidden" name="id" value="{{luminary.id}}">
    <button>Add photo</button>
  </form>

  {{#each luminary.photos}}
  <p>
    <form action="/delete-photo" method="post">
      <a href="{{imageUrl}}">{{imageUrl}}</a>
      <button type="text" name="id" value="{{id}}">Delete</button>
    </form>
  </p>
  {{/each}}
  ```

* Edit `views/luminary.hbs` to show the images:

  ```xml
  ...

  {{#each luminary.photos}}
  <img src="{{imageUrl}}" class="photo">
  {{/each}}
  ```

* Add an `/add-photo` route to `index.js` and `route.js`:

  ```js
  app.post('/add-photo', routes.addPhoto)
  ```

  ```js
  modules.exports = {
    ...
    addPhoto: addPhoto
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
  ```

* Add the `addPhoto` function to `data.js`:

  ```js
  module.exports = {
    ...
    addNewPhotos: addNewPhotos
  }

function addNewPhotos (id, photoUrl) {
  var connection = getConnection()
  connection('photos')
  .insert({
    imageUrl: photoUrl,
    luminary_id: id
  })
}
  ```

* Add the `join` to the `getLuminariesById` function:

  ```js
  var luminary = connection('luminaries')
    .join('photos', 'luminaries.id', 'photos.luminary_id')
    .where('id', '=', 'id').first()
  return luminary
  ```

