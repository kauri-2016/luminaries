# Database-driven web views

## Initial steps

* Create the app and set stuff up.

  ```sh
  git init
  nvm use 6
  npm init
  npm i tape --save-dev
  npm i knex sqlite3 pg --save
  npm i express express-handlebars --save
  npm i node-inspector node-dev --save-dev
  echo "node_modules" > .gitignore
  echo "*.sqlite3" >> .gitignore
  echo "6" > .nvmrc
  git add .
  git commit -m "Initial commit"
  ```

* Add scripts in `package.json` to run knex.

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
  var path = require('path')

  var routes = require('./routes')
  var PORT = process.env.PORT || 3000

  var app = express()

  app.engine('hbs', hbs({extname: 'hbs'}))
  app.set('view engine', 'hbs')
  app.set('views', path.join(__dirname, 'views'))

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
    var model = {title: 'Home'}
    res.render('index', model)
  }
  ```

* Create a `views/index.hbs` file with these contents:

  ```xml
  <!DOCTYPE>
  <html>
  <head>
    <title>Luminaries {{title}}</title>
  </head>
  <body>
    <h1>Luminaries {{title}}</h1>
    <p><a href="/add">Add a new luminary</a></p>
    <p><a href="/list">View luminaries</a></p>
  </body>
  </html>
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

* Open `seeds/test-luminaries.js`, change the table to `luminaries` and add some objects with `firstName` and `lastName` properties.

* Apply the seed data by running `npm run seed:run`.

* Refresh the `luminaries` table and verify the data was inserted.


## Show the list of luminaries

* Create the view `views/list.hbs`:

  ```xml
  <!DOCTYPE>
  <html>
  <head>
    <title>Luminaries {{title}}</title>
  </head>
  <body>
    <h1>Luminaries {{title}}</h1>
    <ul>
      {{#each luminaries}}
      <li>{{firstName}} {{lastName}}</li>
      {{/each}}
    </ul>
  </body>
  </html>
  ```

* Add the route in `index.js`.

  ```js
  ...
  app.get('/list', routes.list)
  ...
  ```

* Create a route in `routes.js` and render the view (without data).

  ```js
  module.exports = {
    index: index,
    list: list
  }

  ...

  function list (req, res) {
    var model = {title: 'List'}
    res.render('list', model)
  }
  ```

* Run the server and verify the view is available.

* Create a `data` module that returns the list of luminaries.

  ```js
  var knex = require('knex')
  var config = require('./knexfile')

  module.exports = {
    getAllLuminaries: getAllLuminaries
  }

  function getAllLuminaries () {
    var luminaries = knex(config.development)('luminaries')
    return luminaries.select()
  }
  ```

* Update the route to return data from the database.

  ```js
  var data = require('./data')
  ...
  function list (req, res) {
    var model = {title: 'List'}
    data.getAllLuminaries().then(function (luminaries) {
      model.luminaries = luminaries
      res.render('list', model)
    })
  }
  ```

* Stage and commit the changes.

* Link each item in the `list.hbs` to a view that shows only one luminary.

  ```xml
  <ul>
    {{#each luminaries}}
    <li><a href="/luminary?id={{id}}">{{firstName}} {{lastName}}</a></li>
    {{/each}}
  </ul>
  ```

* Create a `/luminary` route in `routes.js` to show a single luminary.

  ```js
  module.exports = {
    ...
    luminary: luminary
  }

  function luminary (req, res) {
    
  }
  ```





