const { Pool } = require("pg");
const { nanoid } = require("nanoid");

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    console.log(name, year);
    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year]
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      console.log("Gagal menambahkan album baru.")
    }
    console.log(result);
  }
}

module.exports = AlbumsService;
