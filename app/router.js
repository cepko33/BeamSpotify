const root = require('./root.js');
const ingest = require('./ingest.js');
const top = require('./top.js');

module.exports.initRoutes = (app) => {
  app.get('/', root.get)
  app.post('/ingest', ingest.post);
  app.get('/top', top.get);
}
