const Promise = require('bluebird');
const moment = require('moment');

/*
 * Get the top artists by playcount
 * Accepts `beforeDate` and `afterDate` timestamp query parameters
 */
module.exports.get = async (req, res) => {
  const {
    beforeDate,
    afterDate,
  } = req.query;

  let whereConditions;
  let bind = {};

  const sequelize = req.app.sequelize;
  const Sequelize = sequelize.Sequelize;

  // Add bindable date strings for the SQL template
  if (beforeDate) {
    bind.beforeDate = moment(beforeDate).toString();
  }

  if (afterDate) {
    bind.afterDate = moment(afterDate).toString();
  }

  // Use a nested SELECT COUNT query to count the
  // number of Listens each Artist is associated with
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
    LIMIT 5
  `,
  ).catch(err => {
    console.error(err);
    return res.send(500);
  })

  res.send(popularArtists);
}
