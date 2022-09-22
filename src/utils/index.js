const mapDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id, 
});

const mapDBToResponse  = ({
  id,
  name,
  owner,
}) => ({
  id,
  name,
  username: owner,
});

module.exports = { mapDBToModel, mapDBToResponse };