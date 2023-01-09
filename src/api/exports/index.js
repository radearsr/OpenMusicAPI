const ExportsHander = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "exports",
  version: "1.0.0",
  register: async (server, { playlistsService, producerService, validator }) => {
    const exportsHandler = new ExportsHander(playlistsService, producerService, validator);
    server.route(routes(exportsHandler));
  },
};
