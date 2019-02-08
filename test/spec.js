const request = require('supertest')
const assert = require('chai').assert;

process.env.PORT = 15234;
process.env.DB = 'beam_test';
process.env.IS_TEST = true;

describe('starting express', () => {
  let server;
  let user, artist, song, listen;

  const {
    init,
    app
  } = require('../index.js');


  beforeEach((done) => {
    init().then(serverObj => {
      server = serverObj;
      ({user, artist, song, listen} = app.sequelize.models);
      done();
    });
  });

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

  it('Ingests some listens', (done) => {
    request(server)
      .post('/ingest')
      .send({
        user_id: 523,
        timestamp: new Date(),
        songs: [
          {
            title: 'No Sentiment',
            artist: 'Cloud Nothings',
          },
          {
            title: 'No Future / No Past',
            artist: 'Cloud Nothings',
          },
          {
            title: 'It\'s Halloween',
            artist: 'The Shaggs',
          },
        ]
      })
      .set('Accept', 'application/json')
      .end((err, res) => {
        console.log(err, res.body);
        done();
      });
  });

})

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
