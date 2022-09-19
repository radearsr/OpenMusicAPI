require("dotenv").config();
const Hapi = require("@hapi/hapi");

const albums = require("./api/Albums");
const AlbumsService = require("./services/AlbumService");
const AlbumsValidator = require("./validator/Albums");

const songs = require("./api/Songs");
const SongsService = require("./services/SongsService");
const SongsValidator = require("./validator/Songs");

const users = require("./api/Users");
const UsersService = require("./services/UsersService");
const UsersValidator = require("./validator/Users");

const authentications = require("./api/Authentications");
const AuthenticationsService = require("./services/AuthenticationsService");
const tokenManager = require("./tokenize/TokenManager");
const AuthenticationsValidator = require("./validator/Authentications");

const ClientError = require("./exceptions/ClientError");

const init = async () => {

  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: tokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => { 
    const { response } = request;
    if (response instanceof ClientError) { 
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode); 
      return newResponse; 
    }
    return response.continue || response;
  });

  await server.start(); 
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();