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
      text: "INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id",
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
      text: "SELECT pl.id, pl.name, usr.username FROM playlists AS pl LEFT JOIN collaborations AS clb ON pl.id = clb.playlist_id LEFT JOIN users AS usr ON pl.owner = usr.id WHERE (clb.playlist_id = $1 AND clb.user_id = $2) OR (pl.id = $1 AND pl.owner = $2)",
      values: [playlistId, owner],
    };
    const resultDetailPlaylist = await this._pool.query(queryPlaylist);
    const [ detailplaylists ] = resultDetailPlaylist.rows;

    const querySongs = {
      text: "SELECT so.id, so.title, so.performer FROM songs AS so LEFT JOIN playlistsongs AS pls ON so.id = pls.song_id WHERE pls.playlist_id = $1 ORDER BY so.id;",
      values: [playlistId],
    };

    const { rows } = await this._pool.query(querySongs);

    const resultPlaylistSongs = Object.assign({}, detailplaylists, {songs: rows});

    return resultPlaylistSongs;
  }

  async deletePlaylistSongById(playlistId, songId) {
    const query =  {
      text:"DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
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

  async recordPlaylistSongsActivities(action, playlistId, songId, userId) {
    const id = `acivities-${nanoid(16)}`;
    const timeActivities = new Date().toISOString();
    new Date().toISOString();
    const query = {
      text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
      values: [id, playlistId, userId, songId, action, timeActivities],
    };

    const result = await this._pool.query(query);
    const [{ id: activitiesId }] = result.rows;

    if (!activitiesId) {
      throw new InvariantError("Gagal melakukan record aktivitas");
    }
  }

  async getPlaylistSongsActivities(playlistId) {
    const query = {
      text: "SELECT usr.username, so.title, plsa.action, plsa.time FROM playlist_song_activities AS plsa LEFT JOIN users AS usr ON plsa.user_id = usr.id LEFT JOIN songs AS so ON plsa.song_id = so.id WHERE plsa.playlist_id = $1",
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    const { rows: activities } = result;

    if (!activities.length) {
      throw new NotFoundError("Belum ada aktifitas pada playlist musik ini")
    }

    return activities;
  }
}

module.exports = PlaylistsService;
