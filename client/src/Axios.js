const axios = require('axios');

const instance = axios.create({
  baseURL: 'http://localhost:3000/api/'
});

export default instance;