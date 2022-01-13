function doGet(e) {
  var template = HtmlService.createTemplateFromFile("index");

  var user = Session.getActiveUser().getEmail();

  if (user !== "bradley.parry@digital.cabinet-office.gov.uk") {
    var sheet = SpreadsheetApp.openById(trackingSheetId).getSheetByName(
      "Central Governance Tool"
    );
    sheet.appendRow([
      user.replace("@digital.cabinet-office.gov.uk", "").replace(".", " "),
      new Date(),
    ]);
  }

  return template
    .evaluate()
    .setTitle("GDS Business Operations Tool")
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setFaviconUrl(
      "https://jobs.mindtheproduct.com/wp-content/uploads/company_logos/2017/03/gds-logo.png"
    );
}

function getStructureData() {
  var db = open(currentSpreadsheetId);
  var validation = getRows(open(validationSpreadsheetId), "Validation");

  const user = Session.getActiveUser().getEmail();
  const permissionData = getRows(db, "Permissions", [], { UserEmail: user });
  let userType = permissionData[0]
    ? permissionData[0].RoleType + "#GDS User"
    : "GDS User";
  const accessibleMode = permissionData[0]
    ? permissionData[0].AccessibleMode
    : true;
  const views = getRows(db, "Views");
  const splitUserTypes = userType.split("#");
  const primaryUserType = splitUserTypes[0];
  const defaultSection = getRows(
    db,
    "User Types",
    [],
    { UserType: primaryUserType },
    1
  );
  const currentUserData = getRows(
    db,
    "Civil Servants",
    ["Team", "Community", "FullName"],
    { Email: user }
  )?.[0];

  return JSON.stringify({
    views,
    user,
    userType: splitUserTypes.join("#"),
    defaultSection,
    validation,
    accessibleMode,
    currentUserData,
  });
}

function checkUserAccess(userTypesAccessString, userTypeListString) {
  if (userTypeListString.includes("Master")) return true;
  const userTypes = userTypeListString.split("#");
  return userTypes.some((type) => userTypesAccessString.includes(type));
}

function getViewData(schemasToFetch) {
  var db = open(currentSpreadsheetId);
  const user = Session.getActiveUser().getEmail();

  const userPermissions = getRows(db, "Permissions", [], { UserEmail: user });
  let { Group, Team, RoleType } = userPermissions[0]
    ? userPermissions[0]
    : { Group: "null", Team: "null", RoleType: "" };

  RoleType = RoleType + "#GDS User";

  const userData = getRows(db, "Civil Servants", ["FullName"], {
    Email: user,
  })?.[0];

  const FullName = userData ? userData.FullName : null;

  var validation = getRows(open(validationSpreadsheetId), "Validation");
  const returnObject = { validation };

  for (let schemaName of schemasToFetch) {
    let schema;
    let columns;
    switch (schemaName) {
      case "Diversity":
        returnObject[schemaName] = {
          data: getRows(
            open("1K4EsZ7aimUP_R3db_hO5ohP2jE99BElhEEkljDik-ZQ"),
            "SOP FY"
          ),
          schema: [],
        };
        break;
      case "New Vacancy Business Case":
        returnObject[schemaName] = {
          data: [],
          schema: getRows(db, schemaName),
        };
        break;
      case "CS Vacancies Schema":
        returnObject[schemaName] = {
          data: getRows(db, "CS Vacancies").filter(
            (row) =>
              row.HiringManagerLineManager === FullName ||
              ((Group === "All" || Group.includes(row.Group)) &&
                (Team === "All" || Team.includes(row.Team)))
          ),
          schema: getRows(db, schemaName),
        };
        break;
      case "Contractor Vacancies Schema":
        schema = getRows(db, schemaName);
        columns = [...schema]
          .filter((row) =>
            checkUserAccess(`${row.Create}${row.Read}${row.Update}`, RoleType)
          )
          .map((row) => normalize_(row.Field));
        returnObject[schemaName] = {
          data: getRows(db, "Contractor Vacancies", [
            "ID",
            ...columns,
            "CreatedBy",
            "CreatedAt",
            "UpdatedBy",
            "UpdatedAt",
          ]).filter(
            (row) =>
              row.ManagerRequestorName === FullName ||
              ((Group === "All" || Group.includes(row.Group)) &&
                (Team === "All" || Team.includes(row.Team)))
          ),
          schema,
        };
        break;
      case "CS Schema":
        schema = getRows(db, schemaName);
        columns = [...schema]
          .filter((row) =>
            checkUserAccess(`${row.Create}${row.Read}${row.Update}`, RoleType)
          )
          .map((row) => normalize_(row.Field));
        returnObject[schemaName] = {
          data: getRows(db, "Civil Servants", [
            "ID",
            ...columns,
            "CreatedBy",
            "CreatedAt",
            "UpdatedBy",
            "UpdatedAt",
          ]) /*.filter(
            (row) =>
              (Group === "All" || Group.includes(row.Group)) &&
              (Team === "All" || Team.includes(row.Team))
          )*/,
          schema: schema,
        };
        break;
      case "SOP Schema":
        schema = getRows(db, schemaName);
        columns = [...schema]
          .filter((row) =>
            checkUserAccess(`${row.Create}${row.Read}${row.Update}`, RoleType)
          )
          .map((row) => normalize_(row.Field));
        returnObject[schemaName] = {
          data: getRows(db, "SOP", ["ID", ...columns]),
          schema: schema,
        };
        break;
      case "Contractors Schema":
        schema = getRows(db, schemaName);
        columns = [...schema]
          .filter((row) =>
            checkUserAccess(`${row.Create}${row.Read}${row.Update}`, RoleType)
          )
          .map((row) => normalize_(row.Field));
        returnObject[schemaName] = {
          data: getRows(db, "Contractors", [
            "ID",
            ...columns,
            "CreatedBy",
            "CreatedAt",
            "UpdatedBy",
            "UpdatedAt",
          ]).filter(
            (row) =>
              row.LineManagerClient === FullName ||
              ((Group === "All" || Group.includes(row.Group)) &&
                (Team === "All" || Team.includes(row.Team)))
          ),
          schema: schema,
        };
        break;
      case "L&D Schema":
        returnObject[schemaName] = {
          data: getRows(db, "L&D Requests").filter(
            (row) =>
              ((Group === "All" || Group.includes(row.BusinessUnit)) &&
                (Team === "All" || Team.includes(row.Team))) ||
              user === row.CreatedBy
          ),
          schema: getRows(db, schemaName),
        };
        break;
      case "R&R Schema":
        const rAndRSpreadsheet = open(rAndRId);
        returnObject[schemaName] = {
          data: getRows(rAndRSpreadsheet, "R&R Requests").filter(
            (row) =>
              ((Group === "All" || Group.includes(row.BusinessUnit)) &&
                (Team === "All" || Team.includes(row.Team))) ||
              user === row.CreatedBy
          ),
          schema: getRows(rAndRSpreadsheet, schemaName),
          budget: getRows(rAndRSpreadsheet, "Budget Data"),
        };
        break;
      case "Org Design Schema":
        const orgDesignSheet = open(orgDesignId);
        returnObject[schemaName] = {
          data: getRows(orgDesignSheet, "New Current Pay Mapping").concat(
            getRows(orgDesignSheet, "New Roles")
          ),
          schema: [],
        };
        break;
      case "Workforce Plan Schema":
        returnObject[schemaName] = {
          data: getRows(db, "Workforce Plan").filter(
            (row) =>
              (Group === "All" || Group.includes(row.Group)) &&
              (Team === "All" || Team.includes(row.Team))
          ),
          schema: getRows(db, schemaName),
        };
        break;
      case "Workforce Plan Changes Schema":
        returnObject[schemaName] = {
          data: getRows(db, "Workforce Plan Changes").filter(
            (row) =>
              (Group === "All" || Group.includes(row.Group)) &&
              (Team === "All" || Team.includes(row.Team))
          ),
          schema: getRows(db, schemaName),
        };
        break;
      case "Deliverables Schema":
        returnObject[schemaName] = {
          data: getRows(db, "Deliverables").filter(
            (row) =>
              (Group === "All" || Group.includes(row.Group)) &&
              (Team === "All" || Team.includes(row.Team))
          ),
          schema: getRows(db, schemaName),
        };
        break;
      case "Commissioning Schema":
        returnObject[schemaName] = {
          data: getRows(open(commercialPipeline), "GDS Data").filter(
            (row) =>
              (Group === "All" || Group.includes(row.BusinessArea)) &&
              (Team === "All" || Team.includes(row.BusinessTeam))
          ),
          schema: getRows(db, schemaName),
        };
        break;
      default:
        break;
    }
  }
  return JSON.stringify(returnObject);
}

function updateDataGs({ sheetName, updateObject, emailObject }) {
  let sheetId, updateCondition;
  switch (sheetName) {
    case "GDS Data":
      sheetId = commercialPipeline;
      updateCondition = { WPNumber: updateObject.ID };
      break;
    case "R&R Requests":
      sheetId = rAndRId;
      updateCondition = { ID: updateObject.ID };
      break;
    default:
      sheetId = currentSpreadsheetId;
      updateCondition = { ID: updateObject.ID };
      break;
  }

  var db = open(sheetId);
  if (updateObject.ID) {
    const updateAllowed = checkIfUpdateAllowed(sheetName, updateObject);
    if (updateAllowed) {
      updateRow(db, sheetName, updateObject, updateCondition);
      if (emailObject) {
        sendEmail(emailObject);
      }
    } else {
      throw new Error("Update not permitted");
    }
  } else {
    const properties = PropertiesService.getScriptProperties();
    let id = properties.getProperty(sheetName);
    let code = properties.getProperty(`${sheetName} Code`);
    if (!id) {
      properties.setProperty(sheetName, "1");
      id = "1";
    }
    id = id.toString();
    updateObject.ID = code.slice(0, code.length - id.length) + id;
    properties.setProperty(sheetName, Number(Number(id) + 1).toFixed(0) + "");
    insertRow(db, sheetName, updateObject);
  }
  return updateObject.ID.toString();
}

function checkIfUpdateAllowed(sheetName, updateObject) {
  var user = Session.getActiveUser().getEmail();
  const currentDb = open(currentSpreadsheetId);
  const userPermissions = getRows(currentDb, "Permissions", [], {
    UserEmail: user,
  });
  let { RoleType } = userPermissions[0] ? userPermissions[0] : { RoleType: "" };

  RoleType = RoleType + "#GDS User";

  if (RoleType !== "#GDS User") return true;

  const sheetToSchema = {
    "Civil Servants": { schemaName: "CS Schema" },
    Contractors: { schemaName: "Contractors Schema" },
    "CS Vacancies": { schemaName: "CS Vacancies Schema" },
    "Contractor Vacancies": { schemaName: "Contractor Vacancies Schema" },
    "L&D Requests": { schemaName: "L&D Schema" },
    Deliverables: { schemaName: "Deliverables Schema" },
    "Workforce Plan Changes": { schemaName: "Workforce Plan Changes Schema" },
    "Workforce Plan": { schemaName: "Workforce Plan Changes" },
    "Commissioning Data": { schemaName: "Commissioning Schema" },
    "R&R Requests": {
      schemaName: "R&R Schema",
      url: "https://docs.google.com/spreadsheets/d/1MXOA-UJTse7xPBvnMxp1wXG9TXcssUdJCzNlz55UrF4/edit#gid=932100350",
    },
  };

  const schemaDb = sheetToSchema[sheetName]?.url
    ? open(sheetToSchema[sheetName].url)
    : currentDb;
  const schema = getRows(schemaDb, sheetToSchema[sheetName].schemaName);
  const editObject = schema.reduce((object, row) => {
    object[normalize_(row.Field)] = row.Update;
    return object;
  }, {});

  const userTypeList = RoleType.split("#").filter((type) => type);

  return Object.keys(updateObject).every((key) => {
    if (
      ["UpdatedAt", "UpdatedBy", "ID"].includes(key) ||
      key.includes("UpdatedAt") ||
      key.includes("UpdatedBy")
    )
      return true;
    return userTypeList.some((roleType) => {
      return editObject[key].includes(roleType);
    });
  });
}

function createPermissionsDict() {
  return getRows(open(currentSpreadsheetId), "Permissions").reduce(
    (object, user) => {
      object[user["UserEmail"]] = user["RoleType"];
      return object;
    },
    {}
  );
}

function setSheetCodes() {
  const properties = PropertiesService.getScriptProperties();
  const codeObject = {
    "Civil Servants": "CS10000",
    Contractors: "CN00000",
    "CS Vacancies": "CSVAC0000",
    "Contractor Vacancies": "CNVAC0000",
    "L&D Requests": "LD00000",
    "R&R Requests": "RR00000",
    Deliverables: "D00000",
    "Workforce Plan Changes": "WPC00000",
    "Workforce Plan": "GDS00000",
    "GDS Data": "COM00000", //Commissioning
  };

  for (const sheetName in codeObject) {
    properties.setProperty(`${sheetName} Code`, codeObject[sheetName]);
  }
}

function buildAllDatabases() {
  const schemaObject = {
    //"CS Schema": {sheetName: "Civil Servants"},
    //"Contractors Schema": {sheetName: "Contractors"},
    //"CS Vacancies Schema" : {sheetName: "CS Vacancies"},
    //"Contractor Vacancies Schema": {sheetName: "Contractor Vacancies"},
    //"L&D Schema": {sheetName: "L&D Requests"},
    //"Deliverables Schema": {sheetName: "Deliverables"},
    //"Workforce Plan Changes Schema": {sheetName: "Workforce Plan Changes"},
    //"Commissioning Schema": {sheetName: "Commissioning Data"},
    //"R&R Schema": {sheetName: "R&R Requests", url: "https://docs.google.com/spreadsheets/d/1MXOA-UJTse7xPBvnMxp1wXG9TXcssUdJCzNlz55UrF4/edit#gid=932100350"},
  };

  for (var schema in schemaObject) {
    buildDatabase(
      schema,
      schemaObject[schema].sheetName,
      schemaObject[schema].url
    );
  }
}

function buildDatabase(
  schemaSheetName,
  dataSheetName,
  schemaAndDataSpreadsheetUrl
) {
  var ss = schemaAndDataSpreadsheetUrl
    ? SpreadsheetApp.openByUrl(schemaAndDataSpreadsheetUrl)
    : SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(dataSheetName);
  var currentTitles = dataSheet.getDataRange().getValues()[0];
  var [schemaTitles, ...schemaData] = ss
    .getSheetByName(schemaSheetName)
    .getDataRange()
    .getValues();
  var fieldColumn = schemaTitles.indexOf("Field");
  var typeColumn = schemaTitles.indexOf("Type");
  var timestampColumn = schemaTitles.indexOf("Time Stamp");

  const schemaFields = ["ID"]
    .concat(
      schemaData.reduce((list, row) => {
        if (!["Comment", "Record List"].includes(row[typeColumn])) {
          list.push(row[fieldColumn]);
          if (row[timestampColumn] === true) {
            list.push(`${row[fieldColumn]} Updated At`);
            list.push(`${row[fieldColumn]} Updated By`);
          }
        }
        return list;
      }, [])
    )
    .concat(["Created By", "Created At", "Updated By", "Updated At"]);

  const fieldsToAdd = schemaFields.filter(
    (field) => !currentTitles.includes(field)
  );

  if (fieldsToAdd.length > 0) {
    dataSheet
      .getRange(1, dataSheet.getLastColumn() + 1, 1, fieldsToAdd.length)
      .setValues([fieldsToAdd]);
  }
}
