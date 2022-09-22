const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const AuthorizationError = require("../exceptions/AuthorizationError");
const { mapDBToResponse } = require("../utils");

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

    const playlists = result.rows.map(mapDBToResponse);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan")
    }
    return playlists;
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
      text: "SELECT pl.id, pl.name, usr.username FROM playlists AS pl LEFT JOIN users AS usr ON pl.owner = usr.id WHERE pl.owner = $1 AND pl.id = $2",
      values: [owner, playlistId],
    };
    const resultDetailPlaylist = await this._pool.query(queryPlaylist);
    const [ detailplaylists ] = resultDetailPlaylist.rows;

    const querySongs = {
      text: "SELECT so.id, so.title, so.performer FROM songs AS so LEFT JOIN playlist_songs AS pls ON so.id = pls.song_id WHERE pls.playlist_id = $1 order by so.id;",
      values: [playlistId],
    };

    const { rows } = await this._pool.query(querySongs);

    const resultPlaylistSongs = Object.assign({}, detailplaylists, {songs: rows});

    return resultPlaylistSongs;
  }

  async deletePlaylistSongById(playlistId, songId) {
    const query =  {
      text:"DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal menghapus musik dalam playlist. ID musik tidak ditemukan");
    }
  }
}

module.exports = PlaylistsService;
