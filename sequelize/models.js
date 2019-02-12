const Sequelize = require('sequelize');
const Promise = require('bluebird');

module.exports = (sequelize) => {
  const User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, unique: true, allowNull: false, primaryKey: true },
  });

  const Artist = sequelize.define('artist', {
    name: { type: Sequelize.STRING, unique: true, allowNull: false },
  });

  const Song = sequelize.define('song', {
    name: { type: Sequelize.STRING, allowNull: false },
  });

  Artist.hasMany(Song);
  Song.belongsTo(Artist, {foreignKey: {allowNull: false}});

  const Listen = sequelize.define('listen', {
    timestamp: { type: Sequelize.DATE },
  });

  User.hasMany(Listen);
  Song.hasMany(Listen);
  Artist.hasMany(Listen);
  Listen.belongsTo(User, {foreignKey: {allowNull: false}});
  Listen.belongsTo(Song, {foreignKey: {allowNull: false}});
  Listen.belongsTo(Artist, {foreignKey: {allowNull: false}});

  const models = [ User, Artist, Song, Listen, ];

  // Make sure DB is up to date with current model definitions
  // in case of the Test DB, totally drop and rebuild tables
  const sync = () => {
    if (process.env.IS_TEST)  {
      return Promise.mapSeries(models, model => model.sync({force: true, match: /_test$/ }))
    } else {
      return Promise.mapSeries(models, model => model.sync())
    }
  }

  return {
    User,
    Artist,
    Song,
    Listen,
    sync,
  }
}
