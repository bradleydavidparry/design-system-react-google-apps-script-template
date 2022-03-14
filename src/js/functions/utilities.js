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

function formatDateInput(date) {
  if (!date) return "";
  date = new Date(date);
  var day = date.getDate();
  day = day < 10 ? "0" + day : day;
  var month = date.getMonth() + 1;
  month = month < 10 ? "0" + month : month;
  return date.getFullYear() + "-" + month + "-" + day;
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
  if (userTypeListString?.includes("Master") && autopassMaster) return true;
  if (!userTypesAccessString) return false;
  const userTypes = userTypeListString?.split("#");
  return userTypes.some((type) => userTypesAccessString?.includes(type));
}

function parseFilterString(inputString) {
  if (!inputString) return {};

  const splitString = inputString.includes("||")
    ? inputString.split("||")
    : inputString.split("#");

  return splitString.reduce(
    (object, substring) => {
      if (substring.includes("!=")) {
        const [field, listString] = substring.split("!=");
        object.exclude[normalise(field)] = JSON.parse(listString);
      } else {
        const [field, listString] = substring.split("=");
        object.include[normalise(field)] = JSON.parse(listString);
      }
      return object;
    },
    { include: {}, exclude: {} }
  );
}

function networkdays(startDate, endDate) {
  var startDate =
    typeof startDate == "object" ? startDate : new Date(startDate);
  var endDate = typeof endDate == "object" ? endDate : new Date(endDate);
  if (endDate > startDate) {
    var days = Math.ceil(
      (endDate.setHours(23, 59, 59, 999) - startDate.setHours(0, 0, 0, 1)) /
        (86400 * 1000)
    );
    var weeks = Math.floor(
      Math.ceil(
        (endDate.setHours(23, 59, 59, 999) - startDate.setHours(0, 0, 0, 1)) /
          (86400 * 1000)
      ) / 7
    );

    days = days - weeks * 2;
    days = startDate.getDay() - endDate.getDay() > 1 ? days - 2 : days;
    days = startDate.getDay() == 0 && endDate.getDay() != 6 ? days - 1 : days;
    days = endDate.getDay() == 6 && startDate.getDay() != 0 ? days - 1 : days;

    return days;
  }
  return null;
}

function lightenDarkenColor(col, amt) {
  var usePound = false;
  if (col[0] === "#") {
    col = col.slice(1);
    usePound = true;
  }

  var num = parseInt(col, 16);

  var r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  var b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  var g = (num & 0x0000ff) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

function properCase(string) {
  return string.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function getFirstNameFromGdsEmail(email) {
  return properCase(email.split(".")[0]);
}

export {
  formatMoney,
  formatDate,
  formatDateTime,
  normalise,
  emailToName,
  checkUserAccess,
  formatDateInput,
  parseFilterString,
  networkdays,
  lightenDarkenColor,
  properCase,
  getFirstNameFromGdsEmail,
};
