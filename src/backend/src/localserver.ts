// src/index.ts
import dotenv from 'dotenv';
import HenryAPIServer from './server';

dotenv.config();
const server: HenryAPIServer = new HenryAPIServer({ routePrefix: '/api' });
server.start();
