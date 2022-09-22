const ClientError = require("../../exceptions/ClientError");

class PlaylistsHandler{
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      
      const playlistId = await this._playlistsService.addPlaylist({ name, owner: credentialId });

      const response = h.response({
        status: "success",
        message: "Playlist berhasil ditambahkan",
        data: {
          playlistId,
        }
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
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

  async getPlaylistsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;

      const playlists = await this._playlistsService.getPlaylists(credentialId);
      
      return {
        status: "success",
        data: {
          playlists,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response  = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server"
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;

      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(id, credentialId);

      await this._playlistsService.deletePlaylistById(id);

      return{
        status: "success",
        message: "Berhasil menghapus playlist",
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePlaylistSongsPayload(request.payload);

      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const { songId } = request.payload;


      await this._songsService.getSongById(songId);
      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      

      await this._playlistsService.addPlaylistSong(playlistId, songId);

      const response = h.response({
        status: "success",
        message: "Berhasil menambahkan music ke playlist",
      });
      response.code(201)
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: "fail",
        message: "Maaf, terjadi kegagalan pada server kami",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistSongsByOwnerHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

      const playlistSongs = await this._playlistsService.getPlaylistSongs(playlistId, credentialId);

      return {
        status: "success",
        data: {
          playlist: playlistSongs,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
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

  async deletePlaylistSongById(request, h) {
    try {
      this._validator.validatePlaylistSongsPayload(request.payload);

      const { id: playlistId } = request.params;
      const { songId } = request.payload;

      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

      await this._playlistsService.deletePlaylistSongById(playlistId, songId);

      return {
        status: "success",
        message: "Berhasil menghapus musik playlist",
      };
    } catch (error) {
      if (error instanceof ClientError) {
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

}

module.exports = PlaylistsHandler;