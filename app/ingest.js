const Validator = require('jsonschema').Validator
const Promise = require('bluebird');

// Schema for the full ingest data structure
const dataSchema = {
  id: '/spotifyData',
  type: 'object',
  properties: {
    user_id: {type: 'number'},
    timestamp: {type: 'string', format: 'date-time'},
    songs: {type: 'array', items: { $ref: '/song' }}
  },
}

// Schema for each element in the list of songs
const songSchema = {
  id: '/song',
  type: 'object',
  properties: {
    title: {type: 'string'},
    artist: {type: 'string'},
  },
}

const v = new Validator();
v.addSchema(songSchema, songSchema.id);

module.exports.post = async (req, res) => {
  const {
    User,
    Song,
    Artist,
    Listen,
  } = req.app.models;


  if (!v.validate(req.body, dataSchema).valid) {
    return res.status(400).send({error: 'Invalid data schema'});
  }

  const {
    user_id,
    timestamp,
    songs,
  } = req.body;

  const [foundUser, userCreated] = await User.findOrCreate({where: {id: user_id}})

  // For each song in the array, find/create the artist then find/create the song
  // and finally add a Listen associated to the user/artist/song
  await Promise.all(Promise.mapSeries(songs, async (song) => {
    const {
      title,
      artist
    } = song;

    const [foundArtist, artistCreated] = await Artist.findOrCreate({where: {name: artist}})
    const [foundSong, songCreated] = await Song.findOrCreate({
      where: {
        name: title,
        artistId: foundArtist.get('id')
      }
    });

    const newListen = await Listen.create({
      timestamp,
      userId: foundUser.get('id'),
      songId: foundSong.get('id'),
      artistId: foundArtist.get('id'),
    })

  }))

  res.send(200, req.body);
  /*
  let dataSchema = {
    user_id: Int,
    timestamp: Date,
    songs: [
      {
        title: String,
        artist: String,
        genre: String,
        album: String,
        date_released: Date,
        playlist: String ,
        total_streams: Int
        ,global_streams: Int,
        us_streams: Int
      }
    ]
  };
  */
}
