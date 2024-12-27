import express, { Application } from 'express';
import dotenv from 'dotenv';
import HenryAPIServer from './server';

export const createApp = () => {
    const server: HenryAPIServer = new HenryAPIServer({ routePrefix: '/api' });
    return server.app;
};
