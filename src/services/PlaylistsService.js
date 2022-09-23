const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const AuthorizationError = require("../exceptions/AuthorizationError");

class PlaylistsService{
  constructor(collaborationsService) {
    this._pool = new Pool;
    this._collaborationsService = collaborationsService;
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
      text: "SELECT pl.id, pl.name, usr.username FROM playlists AS pl LEFT JOIN collaborations AS clb ON pl.id = clb.playlist_id LEFT JOIN users AS usr ON usr.id = pl.owner WHERE clb.user_id=$1 OR pl.owner=$1 ORDER BY pl.id",
      values: [owner],
    };

    const result = await this._pool.query(query);

    const {rows: playlists} = result;

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
      text: "SELECT dtplaylist.id, dtplaylist.name, dtplaylist.username FROM (SELECT pl.id, pl.name, usr.username FROM playlists AS pl LEFT JOIN collaborations AS clb ON pl.id = clb.playlist_id LEFT JOIN users AS usr ON pl.owner = usr.id WHERE (clb.playlist_id = $1 AND clb.user_id = $2) OR (pl.id = $1 AND pl.owner = $2)) AS dtplaylist",
      values: [playlistId, owner],
    };
    const resultDetailPlaylist = await this._pool.query(queryPlaylist);
    const [ detailplaylists ] = resultDetailPlaylist.rows;

    const querySongs = {
      text: "SELECT so.id, so.title, so.performer FROM songs AS so LEFT JOIN playlist_songs AS pls ON so.id = pls.song_id WHERE pls.playlist_id = $1 ORDER BY so.id;",
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

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
