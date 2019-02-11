const Validator = require('jsonschema').Validator
const Promise = require('bluebird');
const moment = require('moment');

/*
const dataSchema = {
  id: '/dateParams',
  type: 'object',
  properties: {
    beforeDate: {type: 'string', format: 'date-time'},
    afterDate: {type: 'string', format: 'date-time'},
  },
}

const v = new Validator();
*/
//v.addSchema(songSchema, songSchema.id);

module.exports.get = async (req, res) => {
  const {
    User,
    Song,
    Artist,
    Listen,
  } = req.app.models;

  let {
    beforeDate,
    afterDate,
  } = req.query;

  let whereConditions;
  let bind = {};

  const sequelize = req.app.sequelize;
  const Sequelize = sequelize.Sequelize;

  if (beforeDate || afterDate) {
    whereConditions = `
      ${beforeDate ? 'AND listens.timestamp <= $beforeDate' : ''}
      ${afterDate ? 'AND listens.timestamp >= $afterDate' : ''}
    `;

    if (beforeDate) {
      bind.beforeDate = moment(beforeDate).toString();
    }
    if (afterDate) {
      bind.afterDate = moment(afterDate).toString();
    }
  }

  let [popularArtists, queryData] = await sequelize.query(`
    SELECT
    id,
    name,
    (
      SELECT COUNT(*)
      FROM (
        SELECT id
        FROM listens
        WHERE listens."artistId" = artists."id"
        ${afterDate ? `AND listens."timestamp" > '${bind.afterDate}'` : ''}
        ${beforeDate ? `AND listens."timestamp" < '${bind.beforeDate}'` : ''}
      ) AS count
    ) AS count
    FROM artists
    ORDER BY count DESC
  `,
  ).catch(err => {
    console.error(err);
    return res.send(500);
  })

  res.send(popularArtists);
}
