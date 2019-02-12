const express = require('express');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3333;

const app = express();

// Main app process
const init = async () => {
  const sequelize = require('./sequelize/connection.js');
  const models = require('./sequelize/models.js')(sequelize);

  await sequelize.authenticate();
  await models.sync();

  // Add sequelize and models to main app object
  app.sequelize = sequelize;
  app.models = models;
  // Make sure Express knows how to parse JSON body
  app.use(bodyParser.json());

  // Import all of the routes
  const router = require('./app/router.js').initRoutes(app);

  return app.listen(PORT, () => {
    if (!process.env.IS_TEST) {
      console.log(`Listening on ${PORT}!`);
    }
  });
}

// Autostart if not imported
if (require.main === module) {
    init();
} else {
    console.log('required as a module');
}

module.exports = {
  init,
  app
};
