export default lastUpdated => {
  let diff = (Date.now() - lastUpdated) / 1000;
  if (diff < 60) return `${diff.toFixed(0)} sec ago`;
  diff /= 60;
  if (diff < 60) return `${diff.toFixed(0)} min ago`;
  diff /= 60;
  if (diff < 24) return `${diff.toFixed(0)} hr ago`;
  diff /= 24;
  if (diff < 24) return `${diff.toFixed(0)} days ago`;
  diff /= 30;
  if (diff < 30) return `${diff.toFixed(0)} months ago`;
  diff /= 12;
  if (diff < 12) return `${diff.toFixed(0)} years ago`;
  return 'more than 12 years ago';
};
