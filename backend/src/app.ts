import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import basicAuth from 'express-basic-auth';

/***  Routers ***/
import user from './routes/user';
import trainer from './routes/trainer';
import planned_activities from './routes/planned_activity';
import stub from './routes/stub';
import auth from './routes/auth';
import activity from './routes/activity';
import admin from './routes/admin';
import statistics from './routes/statistics';
import notifications from "./routes/notifications";
/****************/

/*** Middlewares ***/
import ErrorHandler  from './middlewares/errorHandling';
/******************/

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());


// allow different origin for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['http://tse.info.uqam.ca', 'http://backend:5001'] : 'http://localhost:5173',
  credentials: true,
}));

/**** Routes ****/
app.use('/admin', basicAuth({
  users: { 
    [process.env.ADMIN_NAME ?? 'admin' as string]: process.env.ADMIN_PASSWORD ?? 'defaultPassword', 
  }
}), admin);
app.use('/auth', auth);
app.use('/user', user);
app.use('/trainer', trainer);
app.use('/plannedactivities', planned_activities);
app.use('/', stub);
app.use('/activity', activity);
app.use('/statistics', statistics);
app.use('/notifications', notifications);

// Statics assets
app.use('/uploads', express.static('uploads'));

// Needs to be last
app.use(ErrorHandler);
/****************/

export default app;
