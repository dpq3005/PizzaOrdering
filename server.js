const Hapi = require('@hapi/hapi');
const dotenv = require('dotenv');
const connectDB = require('./db');
const routes = require('./Backend/src/controller/route/index');
const Path = require('path');
const Inert = require('@hapi/inert');

const PORT = process.env.PORT || 5000;

dotenv.config({ path: './Backend/config/config.env' });


const server = Hapi.server({
  port: PORT,
  host: 'localhost',
  routes: {
    cors: {
      origin: ['*'],
      credentials: true,
      exposedHeaders: ['x-auth-token']
    },
    files: {
      relativeTo: Path.join(__dirname, 'client/build')
    },
    validate: {
      failAction: (request, h, err) => {
        return err;
      }
    }

  }
});
server.state('token', {
  ttl: process.env.JWT_COOKIE_EXPIRE,
  isSecure: true,
  isHttpOnly: true,
  encoding: 'base64json',
  clearInvalid: true,
  strictHeader: true
});

server.route(routes);
server.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: '.',
      redirectToSlash: true
    }
  }
});

const init = async () => {
  await server.register(Inert);
  if (process.env.NODE_ENV === 'production') {

    server.route({
      method: 'GET',
      path: '/{path*}',
      handler: function (request, h) {

        return h.file(Path.resolve(__dirname, 'client', 'build', 'index.html'));
      }
    });
  }
  await server.start();
  console.info('INFO: Server running on %s/documentation', server.info.uri);
  connectDB();


};






// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error:${err.message}`);
  //Close server & exit process
  process.exit();
});

init();


module.exports = { Hapi };




