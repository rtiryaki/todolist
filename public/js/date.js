exports.getDate = function () {
  const event = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const day = event.toLocaleDateString("tr-TR", options);
  return day;
};
