const request = require('supertest')
const assert = require('chai').assert;
const Promise = require('bluebird');
const moment = require('moment');

// Enforcing some default env vars for running test suite
process.env.PORT = 15234;
process.env.DB = 'beam_test';
process.env.IS_TEST = true;

describe('starting express', () => {
  let server;

  let user, artist, song, listen;

  const {
    init,
    app,
  } = require('../index.js');

  // Start a new server instance before each test
  beforeEach((done) => {
    init().then(serverInstance => {
      server = serverInstance;
      // Helpful model imports
      ({
        user,
        artist,
        song,
        listen,
      } = app.sequelize.models);
      done();
    });
  });

  // Test is done so close the server process
  afterEach(() => {
    server.close();
  });

  it('gets the root', (done) => {
    request(server).get('/')
      .expect(200, done);
  });

  it('inserts a User with sequelize', async () => {
    const id = 12345;
    await user.create({id});
    let foundUser = await user.find({where: {id}});
    assert.isOk(foundUser, 'user exists');
  });

  it('inserts an Artist and a Song, then searches via association', async () => {
    const artistName = "The Shaggs";
    const songName = "It's Halloween";

    let shaggs = await artist.create({
      name: artistName,
      songs: [{
        name: songName,
      }]
    }, {
      include: [song]
    });

    let [shouldBeHalloween] = await song.findAll({
      include: [{
        model: artist,
        where: {name: artistName}
      }]
    });

    assert(shouldBeHalloween.get('name'), songName);
  })

  it('Creates a listen from a user', async () => {
    await listen.create({
      timestamp: new Date(),
      song: {
        name: 'No Sentiment',
        artist: {
          name: 'Cloud Nothings',
        }
      },
      user: {
        id: 12345
      }
    }, {
      include: [user, {model: song, include: [artist]}]
    });
  })

  it('Ingests some listens then searches for the top artists', async () => {
    let generateIngest = (json) => {
      return request(server)
        .post('/ingest')
        .send(json)
        .set('Accept', 'application/json')
    }

    // Ingest the whole inputJSON below
    await Promise.all(inputJSON.map(generateIngest)).catch(err => {
      console.error(err);
    });

    // Get all top artists
    let top = await request(server)
      .get('/top').catch((err) => console.error(err))

    console.log(top.body);

    // Get all top artists with plays after 09/09
    top = await request(server)
      .get(`/top?beforeDate=${moment('09/09/2019').toString()}`)
      .catch((err) => console.error(err))

    console.log(top.body);

    // Get all top artists with plays before 09/09
    top = await request(server)
      .get(`/top?afterDate=${moment('09/09/2019').toString()}`)
      .catch((err) => console.error(err))

    console.log(top.body);
  });
});


const inputJSON = [
  { user_id: 423,
    timestamp: new Date('08/31/2019'),
    songs: [
      { title: 'No Sentiment', artist: 'Cloud Nothings', },
      { title: 'Faceshopping', artist: 'SOPHIE', },
      { title: 'Dressed For Space', artist: 'TR/ST', },
    ]
  },
  { user_id: 332,
    timestamp: new Date('09/01/2019'),
    songs: [
      { title: 'No Sentiment', artist: 'Cloud Nothings', },
      { title: 'Faceshopping', artist: 'SOPHIE', },
      { title: 'Dressed For Space', artist: 'TR/ST', },
    ]
  },
  { user_id: 222,
    timestamp: new Date('09/03/2019'),
    songs: [
      { title: 'No Sentiment', artist: 'Cloud Nothings', },
      { title: 'No Future / No Past', artist: 'Cloud Nothings', },
      { title: 'It\'s Halloween', artist: 'The Shaggs', },
    ]
  },
  { user_id: 523,
    timestamp: new Date('09/21/2019'),
    songs: [
      { title: 'No Sentiment', artist: 'Cloud Nothings', },
      { title: 'No Future / No Past', artist: 'Cloud Nothings', },
      { title: 'It\'s Halloween', artist: 'The Shaggs', },
    ]
  },
  { user_id: 513,
    timestamp: new Date('09/24/2019'),
    songs: [
      { title: 'My Friend The Forest', artist: 'Nils Frahm', },
      { title: 'Momentum', artist: 'Nils Frahm', },
      { title: 'Sun Lips', artist: 'Black Moth Super Rainbow', },
      { title: 'Old Yes', artist: 'Black Moth Super Rainbow', },
      { title: 'Dressed For Space', artist: 'TR/ST', },
    ]
  }
];
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
      playlist: String,
      total_streams: Int,
      global_streams: Int,
      us_streams: Int
    }
  ]
};
*/
