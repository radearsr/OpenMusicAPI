const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { mapAlbumDetail } = require("../../utils/index");

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menambahkan album baru.");
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };

    const querySongs = {
      text: "SELECT id, title, performer FROM songs WHERE album_id = $1",
      values: [id],
    };

    const resultAlbum = await this._pool.query(queryAlbum);
    const resultSongs = await this._pool.query(querySongs);

    if (!resultAlbum.rowCount) {
      throw new NotFoundError("Album tidak ditemukan. Id tidak ditemukan");
    }

    const { rows: resultDetailsAlbum } = resultAlbum;
    const [detailsAlbum] = resultDetailsAlbum.map(mapAlbumDetail);
    const { rows } = resultSongs;

    const result = Object.assign(detailsAlbum, { songs: rows });

    return result;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal menghapus album. Id tidak ditemukan");
    }
  }

  async addAlbumCover(id, linkCover) {
    const query = {
      text: "UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id",
      values: [linkCover, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Gagal menambahkan cover ke album");
    }
  }

  async addLikeAlbum(albumId, userId) {
    const id = `likes-${nanoid(16)}`
    const query = {
      text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menyukai album");
    }

    return "menambahkan suka";
  }

  async deleteLikeAlbum(albumId, userId) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id",
      values: [userId, albumId],
    };
   
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal membatalkan suka. Id album tidak ditemukan.");
    }

    return "membatalkan suka";
  }

  async checkLikeAlbum(albumId, userId) {
    try {
      await this.deleteLikeAlbum(albumId, userId);
    } catch {
      try {
        await this.addLikeAlbum(albumId, userId);
      } catch(error) {
        throw error
      }
    }
  }

  async getLikesCount(albumId) {
    const query = {
      text: "SELECT * FROM user_album_likes WHERE album_id = $1",
      values: [albumId],
    };
    
    const result = await this._pool.query(query);

    return result.rowCount;
  }

}

module.exports = AlbumsService;
