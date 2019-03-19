export default email => {
  const regex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  return regex.test(email);
};

export const name = givenName => {
  const regex = /^([a-zA-Z])([a-zA-Z_0-9]){0,255}$/;
  return regex.test(givenName);
};

export const userid = uid => {
  const regex = /^([a-zA-Z0-9_]){0,255}$/;
  return regex.test(uid);
};

export const password = pass => {
  if (
    !pass ||
    pass instanceof Object ||
    pass.length < 5 ||
    pass.length > 40
  )
    return false;
  return true;
};

export const userName = givenName => {
  const regex = /^([a-zA-Z])([a-zA-Z ]){3,255}/;
  return regex.test(givenName);
};

export const keyValue = given => {
  const regex = /^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/;
  return regex.test(given);
};

export const description = desc => {
  if (desc instanceof Object || desc.length > 500) return false;
  return true;
};

export const checkIfArrayIsUnique = (arr) => {
  return arr.length === new Set(arr).size;
}
