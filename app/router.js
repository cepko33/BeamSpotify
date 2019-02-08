const root = require('./root.js');
const ingest = require('./ingest.js');

module.exports.initRoutes = (app) => {
  app.get('/', root.get)
  app.post('/ingest', ingest.post);
}
