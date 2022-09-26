const mapDBToModel = ({
  album_id, ...args
}) => ({
  ...args,
  albumId: album_id,
});

const mapAlbumDetail = ({
  cover, ...args
}) => ({
  ...args,
  coverUrl: cover,
})

module.exports = { mapDBToModel, mapAlbumDetail };
