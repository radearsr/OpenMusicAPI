const ClientError = require("../../exceptions/ClientError")

class UsersHandler{
  constructor(service, validate) {
    this._service = service;
    this._validate = validate;
  };

  async postUserHandler(request, h) {
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
  }
}

module.exports = UsersHandler;