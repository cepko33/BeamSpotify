const express = require('express');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3333;

const app = express();

const init = async () => {
  const sequelize = require('./sequelize/connection.js');
  const models = require('./sequelize/models.js')(sequelize);

  await sequelize.authenticate();
  await models.sync();

  app.sequelize = sequelize;
  app.models = models;
  app.use(bodyParser.json());

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
