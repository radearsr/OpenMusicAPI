const ClientError = require("../../exceptions/ClientError")

class UsersHandler{
  constructor(service, validate) {
    this._service = service;
    this._validate = validate;
  };

  async postUserHandler(request, h) {
    try {
      this._validate.validateUserPayload(request.payload);
      const { username, password, fullname } = request.payload;
      const userId = await this._service.addUser({ username, password, fullname });
      
      const response = h.response({
        status: "success",
        data: {
          userId,
        },
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
}

module.exports = UsersHandler;