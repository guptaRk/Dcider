module.exports = function (err) {
  let error = {};
  if (!err) return null;
  console.log(err);
  for (let i of err.details) {
    error[i.path[0]] = i.message;
  }
  return error;
}