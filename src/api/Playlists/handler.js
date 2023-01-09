class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({ name, owner: credentialId });

    const response = h.response({
      status: "success",
      message: "Playlist berhasil ditambahkan",
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;

    const playlists = await this._playlistsService.getPlaylists(credentialId);

    return {
      status: "success",
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;

    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);

    await this._playlistsService.deletePlaylistById(id);

    return {
      status: "success",
      message: "Berhasil menghapus playlist",
    };
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload);
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    await this._songsService.getSongById(songId);

    await this._playlistsService.addPlaylistSong(playlistId, songId);

    await this._playlistsService.recordPlaylistSongsActivities(
      "add",
      playlistId,
      credentialId,
      songId,
    );

    const response = h.response({
      status: "success",
      message: "Berhasil menambahkan music ke playlist",
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsByOwnerHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlistSongs = await this._playlistsService.getPlaylistSongs(playlistId, credentialId);

    return {
      status: "success",
      data: {
        playlist: playlistSongs,
      },
    };
  }

  async deletePlaylistSongById(request) {
    this._validator.validatePlaylistSongsPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    await this._playlistsService.deletePlaylistSongById(playlistId, songId);

    await this._playlistsService.recordPlaylistSongsActivities(
      "delete",
      playlistId,
      credentialId,
      songId,
    );

    return {
      status: "success",
      message: "Berhasil menghapus musik playlist",
    };
  }

  async getPlaylistSongsActivitiesHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._playlistsService.getPlaylistSongsActivities(playlistId);

    return {
      status: "success",
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
