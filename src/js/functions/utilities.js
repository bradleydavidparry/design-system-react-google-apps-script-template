function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(
      (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
    ).toString();
    let j = i.length > 3 ? i.length % 3 : 0;

    return (
      negativeSign +
      "£" +
      (j ? i.substr(0, j) + thousands : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
      (decimalCount
        ? decimal +
          Math.abs(amount - i)
            .toFixed(decimalCount)
            .slice(2)
        : "")
    );
  } catch (e) {
    console.log(e);
  }
}

function formatDateTime(date) {
  if (!date) return "";
  date = new Date(date);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;

  var day = date.getDate();
  day = day < 10 ? "0" + day : day;
  var month = date.getMonth() + 1;
  month = month < 10 ? "0" + month : month;

  return day + "/" + month + "/" + date.getFullYear() + " " + strTime;
}

function formatDate(date) {
  if (!date) return "";
  date = new Date(date);
  var day = date.getDate();
  day = day < 10 ? "0" + day : day;
  var month = date.getMonth() + 1;
  month = month < 10 ? "0" + month : month;
  return day + "/" + month + "/" + date.getFullYear();
}

function normalise(text) {
  return text.replace(/\W+/g, "").replace(/^\d+/, "");
}

function emailToName(email) {
  return email
    .replace("@digital.cabinet-office.gov.uk", "")
    .replace(/\./g, " ")
    .replace(/(^|\s)\S/g, function (t) {
      return t.toUpperCase();
    });
}

function checkUserAccess(
  userTypesAccessString,
  userTypeListString,
  autopassMaster = true
) {
  if (userTypeListString === "Master" && autopassMaster) return true;
  if (!userTypesAccessString) return false;
  const userTypes = userTypeListString.split("#");
  return userTypes.some((type) => userTypesAccessString.includes(type));
}

export {
  formatMoney,
  formatDate,
  formatDateTime,
  normalise,
  emailToName,
  checkUserAccess,
};
