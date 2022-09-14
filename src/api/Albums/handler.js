
class AlbumHandler {
  constructor(service) {
    this._service = service;
  }

  postAlbumHandler(request, h) {
    try {
      console.log(request.payload);
      const { name, year } = request.payload;
      const albumId = this._service.addAlbum({name, year});
      
      const response = h.response({
        status: "success",
        albumId,
      });
      response.code(201);
      console.log(albumId);
      
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error,
      });
      response.code(400);
      return response;
    }
  }
}

module.exports = AlbumHandler;