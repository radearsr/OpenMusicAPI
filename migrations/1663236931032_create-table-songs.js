exports.up = (pgm) => {
  pgm.createTable("songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    title: {
      type: "TEXT",
      notNull: true,
    },
    year: {
      type: "INT",
      notNull: true,
    },
    genre: {
      type: "TEXT",
      notNull: true,
    },
    performer: {
      type: "TEXT",
      notNull: true,
    },
    duration: {
      type: "INT",
      notNull: false,
    },
    album_id: {
      type: "VARCHAR(50)",
      notNull: false,
    },
  });

  pgm.addConstraint("songs", "fk_album_song.album_id_album.id", "FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE");
};

exports.down = (pgm) => {
  pgm.dropTable("songs");
};
