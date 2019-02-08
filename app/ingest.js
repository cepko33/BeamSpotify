module.exports.post = (req, res) => {
  const {
    User,
    Song,
    Artist,
    Listen,
  } = req.app.models;

  console.log(req.body);

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
