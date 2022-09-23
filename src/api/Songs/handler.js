const ErrorClient = require("../../exceptions/ClientError");

class SongsHandler{
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const {
        title,
        year,
        genre,
        performer,
        duration = null,
        albumId = null
      } = request.payload;

      const songId = await this._service.addSong(
        title,
        year,
        genre,
        performer,
        duration,
        albumId
      );

      const response = h.response({
        status: "success",
        data: {
          songId
        }
      });

      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ErrorClient) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongsHandler(request) {
    try {
      const { title, performer } = request.query;
      
      const songs = await this._service.getSongs(title, performer);
      return {
        status: "success",
        data: {
          songs,
        },
      };
    } catch (error) {
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami."
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
  
      const song = await this._service.getSongById(id);

      return {
        status: "success",
        data: {
          song,
        },
      };
    } catch (error) {
      if (error instanceof ErrorClient) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagal pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
  
      const { id } = request.params;

      await this._service.editSongById(id, request.payload);

      return {
        status: "success",
        message: "Musik berhasil diperbarui"
      };
    } catch (error) {
      if (error instanceof ErrorClient) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  } 

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
  
      await this._service.deleteSongById(id);
  
      return {
        status: "success",
        message: "Musik berhasil dihapus",
      };
    } catch (error) {
      if (error instanceof ErrorClient) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagal pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = SongsHandler;