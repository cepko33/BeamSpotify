const Sequelize = require('sequelize');
const database = process.env.IS_TEST ? 'beam_test' : 'beam';
const sequelize = new Sequelize(database, 'postgres', 'BeamSeemsCool', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  //logging: process.env.IS_TEST ? false : console.log
});

console.log(database, process.env.IS_TEST);

const models = require('./models.js');

/*
sequelize.authenticate().then((obj) => {
  console.log('success');
}).catch((err) => {
  console.error(err);
}).finally(() => {
  process.exit();
})
*/

module.exports = sequelize;
