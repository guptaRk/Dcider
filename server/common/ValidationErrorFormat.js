module.exports = function (err) {
  let error = {};
  const keys = Object.keys(err.errors);
  console.log(keys);
  for (let i of keys) {
    error[i] = err.errors[i].message;
  }
  return error;
}