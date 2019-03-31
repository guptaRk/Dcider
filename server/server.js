import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import user from './routes/user';
import xlist from './routes/xlist';
import room from './routes/room';
import pollItem from './routes/pollItem';

// Configure environment variables for server
dotenv.config();

const app = express();
const Fawn = require('fawn');

const mongodbConnectionString = process.env.MONGO_URI;

mongoose.connect(mongodbConnectionString, { useNewUrlParser: true })
  .then(() => console.log('connected to mongodb..'))
  .catch((err) => {
    console.log('Error while connecting to mongodb : \n', err);
    process.exit(1);
  });

Fawn.init(mongoose);

app.use(express.json());

app.use('/api/users', user);
app.use('/api/xlist', xlist);
app.use('/api/room', room);
app.use('/api/pollItem', pollItem);

if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../../client/build/')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

const port = process.env.port || 5000;

app.listen(port, console.log('listening on port 5000...'));