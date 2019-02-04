const express = require('express');
const mongoose = require('mongoose');
const app = express();

const user = require('./routes/user');
const xlist = require('./routes/xlist');

mongoose.connect('mongodb://localhost:27017/Dcider', { useNewUrlParser: true })
  .then(() => console.log('connected to mongodb..'))
  .catch((err) => {
    console.log('Error while connecting to mongodb : \n' + err);
    process.exit(1);
  });

app.use(express.json());

/*
app.get('/', (req, res) => {
  console.log('request received!');
  res.send('Hello world!');
});*/
app.use('/api/users', user);
app.use('/api/xlist', xlist);

const server = app.listen(5000, () => { console.log('listening on port 5000...') });