const Validator = require('jsonschema').Validator
const Promise = require('bluebird');

const dataSchema = {
  id: '/spotifyData',
  type: 'object',
  properties: {
    user_id: {type: 'number'},
    timestamp: {type: 'string', format: 'date-time'},
    songs: {type: 'array', items: { $ref: '/song' }}
  },
}

const songSchema = {
  id: '/song',
  type: 'object',
  properties: {
    title: {type: 'string'},
    artist: {type: 'string'},
  },
}

//const v = new Validator();
//v.addSchema(songSchema, songSchema.id);

module.exports.get = async (req, res) => {
  const {
    User,
    Song,
    Artist,
    Listen,
  } = req.app.models;

  const sequelize = req.app.sequelize;
  const Sequelize = sequelize.Sequelize;


  /*
  if (!v.validate(req.body, dataSchema).valid) {
    return res.status(400).send({error: 'Invalid data schema'});
  }
  */

  let [popularArtists, queryData] = await sequelize.query(`
    SELECT
    id,
    name,
    (
      SELECT COUNT(*)
      FROM (
        SELECT id
        FROM listens
        WHERE listens."artistId" = artists.id
      ) AS temp
    ) AS count
    FROM artists
    ORDER BY count DESC
  `)

  res.send(popularArtists);
}
