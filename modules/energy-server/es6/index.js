import restify from 'restify';
import restifyJwt from 'restify-jwt';
import getToken from './get-token';
import { insertBareEnergyFile, saveBareEnergyFiles } from './energy-files';
const secret = 'very';
const jwtIssuer = 'energy';
import { drainConnectionPool } from './model';

const catchErrs = fn => async (req, res, next) => {
  try {
    await fn(req, res);
    next();
  } catch(err) {
    next(err);
  }
};

export default function makeServer({publicRoutes = ['/energy/save']} = {}) {
  const server = restify.createServer();

  const arePublicRoutes = {
    path: ['/token'].concat(publicRoutes)
  };
  const authorize = restifyJwt({secret}).unless(arePublicRoutes);

  server.use(restify.authorizationParser());
  server.use(authorize);
  server.get('/energy/save', catchErrs(saveBareEnergyFiles));
  server.get('/token', getToken(secret, jwtIssuer));
  server.post(
    {
      url: '/energy/insert-bare-files',
      streamer: {
        pattern: '*'
      }
    },
    ...insertBareEnergyFile()
  );

  return server;
}

makeServer.drainConnectionPool = drainConnectionPool;
