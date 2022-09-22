const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const AuthorizationError = require("../exceptions/AuthorizationError");

class PlaylistsService{

  constructor() {
    this._pool = new Pool;
  }

  async addPlaylist({name, owner}) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    const [{ id: newPlaylistId }] = result.rows;

    if (!newPlaylistId) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return newPlaylistId;
  }

  async getPlaylists(owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE owner = $1",
      values: [owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan")
    }
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal menghapus playlist. Id tidak ditemukan");
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Resource yang anda minta tidak ditemukan");
    }

    const [{ owner: playlistOwner }] = result.rows;

    if (playlistOwner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async addPlaylistSong(playlist_id, song_id) {
    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id",
      values: [id, playlist_id, song_id],
    };

    const result = await this._pool.query(query);

    const [{ id: playlistSongId }] = result.rows;

    if (!playlistSongId) {
      throw new InvariantError("Gagal menambahakan songId");
    }

    return playlistSongId;
  }

  async getPlaylistSongs(playlistId, owner) {
    const queryPlaylist = {
      text: "SELECT * FROM playlists WHERE owner = $1 AND id = $2",
      values: [playlistId, owner]
    }
    console.log("OWNER", owner);
    const result = await this._pool.query(queryPlaylist);
    console.log("Result", result);
    return result;
  }
}

module.exports = PlaylistsService;
