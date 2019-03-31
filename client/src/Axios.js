const axios = require('axios');

const defaultString = (process.env.NODE_ENV === 'production')
  ? 'https://dcider.herokuapp.com/api'
  : 'http://localhost:3000/api';

const instance = axios.create({
  baseURL: defaultString
});

export default instance;