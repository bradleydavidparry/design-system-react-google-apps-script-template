import keyBy from "lodash/keyBy";
import groupBy from "lodash/groupBy";
//import forEach from 'lodash/forEach';
//import keys from 'lodash/keys';
//import reduce from 'lodash/reduce';
import { normalise, checkUserAccess } from "./utilities";

function extractOptionsFromSchema(
  value,
  identifier,
  data,
  viewName,
  schemaName
) {
  return [""].concat(
    data.map((row) => ({ value: row[value], children: row[identifier] }))
  );
}

function extractOptionsFromValidation(validation, columnHeader) {
  const normalisedColumnHeader = normalise(columnHeader);
  const options = [""];
  let i = 0;
  while (validation[i] && validation[i][normalisedColumnHeader]) {
    options.push(validation[i][normalisedColumnHeader]);
    i++;
  }
  return options;
}

function createLookupObject(validation) {
  let i = 0;
  const returnObject = { team: {} };
  while (validation[i] && validation[i]["CostCentreName"]) {
    returnObject.team[validation[i]["CostCentreName"]] = {
      group: validation[i]["GroupName"],
      costCentre: validation[i]["CostCentre"],
      programme: validation[i]["Programme"],
      defaultSubTeam: validation[i]["SubTeamIDLookup"],
    };
    i++;
  }
  return returnObject;
}

function processStructureData(object, dict) {
  const {
    views,
    user,
    userType,
    defaultSection,
    validation,
    accessibleMode,
    currentUserData,
  } = JSON.parse(object);
  const {
    setSections,
    setUserType,
    setUser,
    setDefaultSection,
    setLoading,
    setLookups,
    setAccessibleMode,
    setCurrentUserData,
  } = dict;

  const filteredViews = views.filter(
    (view) =>
      view.Active && checkUserAccess(view["UserTypesWhoCanAccess"], userType)
  );

  let defaultSectionName = defaultSection[0]?.DefaultSection
    ? dict.linkifyName(defaultSection[0]?.DefaultSection)
    : null;
  const lookupObject = createLookupObject(validation);

  setSections(groupBy(filteredViews, "Section"));
  setUserType(userType);
  setUser(user);
  setDefaultSection(defaultSectionName);
  setLookups(lookupObject);
  setAccessibleMode(accessibleMode);
  setCurrentUserData(currentUserData);
  setLoading(false);
}

function processViewData(object, dict) {
  const { dataObject, setDataObject } = dict;
  const parsedObject = JSON.parse(object);
  let { validation } = parsedObject;

  delete parsedObject.validation;

  const newDataObject = { ...dataObject, ...parsedObject };

  for (let schemaName in parsedObject) {
    newDataObject[schemaName].schema = processSchemaData(
      newDataObject[schemaName].schema,
      validation
    );
    newDataObject[schemaName].data = convertDatesInDataList(
      newDataObject[schemaName]
    );
  }

  setDataObject(newDataObject);
}

function convertDatesInDataList({ schema, data }) {
  const dateFields = Object.values(schema)
    .filter((field) => ["Date", "DateTime"].includes(field.Type))
    .map((field) => normalise(field.Field));
  return data.map((row) => convertDatesForSingleRow(row, dateFields));
}

function convertDatesForSingleRow(row, dateFields) {
  dateFields.forEach((field) => {
    if (typeof row[field] !== "object") {
      if (!row[field]) {
        row[field] = "";
      } else if (row[field]?.includes("T")) {
        row[field] = new Date(row[field]);
      } else {
        const [dateSting, timeString] = row[field].split(" ");
        const [dd, mm, yyyy] = dateSting.split("/");
        row[field] = new Date(
          [mm, dd, yyyy].join("/") + (timeString ? ` ${timeString}` : "")
        );
      }
    }
  });
  return row;
}

function customDataProcessing(schemaName, dataObject) {
  switch (schemaName) {
    case "Workforce Plan Schema":
      const csByRoleId = groupBy(dataObject["CS Schema"].data, "RoleID");
      const contractorsByRoleId = groupBy(
        dataObject["Contractors Schema"].data,
        "RoleID"
      );
      const csVacsByRoleID = groupBy(
        dataObject["CS Vacancies Schema"].data,
        "RoleID"
      );
      const conVacsByRoleID = groupBy(
        dataObject["Contractor Vacancies Schema"].data,
        "RoleID"
      );
      const changeReqsByRoleID = groupBy(
        dataObject["Workforce Plan Changes Schema"].data,
        "RoleID"
      );

      dataObject[schemaName].data = dataObject[schemaName].data.map((row) => {
        row.CurrentCivilServant = csByRoleId[row.ID]?.filter(
          (cs) => cs.CurrentlyEmployed === "Yes"
        );
        row.CurrentContractor = contractorsByRoleId[row.ID]?.filter(
          (con) => con.CurrentlyEmployed === "Yes"
        );
        row.CurrentCsVacancy = csVacsByRoleID[row.ID]?.filter(
          (csvac) => csvac.RequirementFilled === "No"
        );
        row.CurrentContractorVacancy = conVacsByRoleID[row.ID]?.filter(
          (convac) => convac.RequirementFilled === "No"
        );
        row.ChangeRequestsOutstanding = changeReqsByRoleID[row.ID]?.filter(
          (reqs) => reqs.ApprovalStatus === "For Review"
        )[0];

        row.InterimAndCivilServant =
          row.CurrentCivilServant && row.CurrentContractor ? "Yes" : "No";
        row.FilledVacant =
          row.CurrentCivilServant || row.CurrentContractor
            ? "Filled"
            : "Vacant";

        row.CurrentStatus = "";
        row.CurrentlyFilledBy = "";

        row.Count = 1;

        if (row.CurrentCivilServant) {
          row.CurrentStatus += "CS In Post";
          row.CurrentlyFilledBy += row.CurrentCivilServant[0]?.FullName
            ? row.CurrentCivilServant[0]?.FullName
            : "";
          if (row.CurrentCivilServant[0]?.LastDateofService) {
            row.CurrentStatus += " - Leaving";
          }
        }

        if (row.CurrentCsVacancy) {
          row.CurrentStatus += " (Currently Recruiting CS)";
        }

        if (row.CurrentContractor) {
          if (row.CurrentStatus.includes("CS")) {
            row.CurrentStatus = row.CurrentStatus.replace(
              "CS",
              "CS & Contractor"
            );
          } else {
            row.CurrentStatus += " Contractor In Post";
          }
          row.CurrentlyFilledBy += row.CurrentContractor[0]?.FullName
            ? ` ${row.CurrentContractor[0]?.FullName}`
            : "";
        }

        if (row.CurrentContractorVacancy) {
          row.CurrentStatus += " (Currently Recruiting Contractor)";
        }

        row.CurrentStatus = row.CurrentStatus ? row.CurrentStatus : "Vacant";

        row.AvailableForCSVacancy =
          (!row.CurrentCivilServant ||
            row.CurrentCivilServant[0]?.LastDateofService) &&
          !row.CurrentCsVacancy &&
          !row.ChangeRequestsOutstanding
            ? "Yes"
            : "No";
        return row;
      });
      return dataObject[schemaName].data;
    default:
      return dataObject[schemaName].data;
  }
}

function processSchemaData(schema, validation) {
  schema = schema
    .map((row) => {
      if (row.Options?.includes("VAL")) {
        row.Options = extractOptionsFromValidation(
          validation,
          row.Options.slice(4)
        );
      } else if (row.Options?.includes("SCHEMA")) {
        row.OptionsSchema = row.Options;
      } else if (row.Options?.includes("SUBTABLE")) {
        row.Options = row.Options?.split("#");
      } else {
        row.Options = [""].concat(row.Options?.split("#"));
      }

      if (row.TimeStamp) {
        schema.push({ Field: `${row.Field} Updated At`, Type: "DateTime" });
        schema.push({ Field: `${row.Field} Updated By`, Type: "EmailToName" });
      }

      return row;
    })
    .concat([
      { Field: `Created At`, Type: "DateTime" },
      { Field: `Created By`, Type: "EmailToName" },
    ]);

  return keyBy(schema, "Field");
}

function defaultProcessDataAndSchema(
  dataObject,
  splitSchemas,
  lookups,
  viewName
) {
  const defaultSchema = splitSchemas[0];
  const newLookups = { ...lookups };

  for (let schemaName of splitSchemas) {
    newLookups[schemaName] = dataObject[schemaName].data.reduce(
      (object, row) => {
        object[row.ID] = row;
        return object;
      },
      {}
    );
  }

  dataObject[defaultSchema].data = customDataProcessing(
    defaultSchema,
    dataObject
  );

  return [
    dataObject[defaultSchema].data,
    dataObject[defaultSchema].schema,
    newLookups,
  ];
}

function processDataAndSchema(viewName, dataObject, splitSchemas, lookups) {
  switch (viewName) {
    default:
      return defaultProcessDataAndSchema(
        dataObject,
        splitSchemas,
        lookups,
        viewName
      );
  }
}

function processFormData(schema, newFormData, lookups, viewName) {
  if (schema["Group"]) {
    newFormData.Group = lookups.team[newFormData.Team]
      ? lookups.team[newFormData.Team].group
      : "";
  }
  if (schema["Cost Centre"]) {
    newFormData.CostCentre = lookups.team[newFormData.Team]
      ? lookups.team[newFormData.Team].costCentre
      : "";
  }

  switch (viewName) {
    case "Create New Vacancy":
      if (newFormData.RoleID) {
        newFormData.JobTitle =
          lookups["Workforce Plan Schema"][newFormData.RoleID].JobTitle;
        newFormData.Payband =
          lookups["Workforce Plan Schema"][newFormData.RoleID].Payband;
        newFormData.Group =
          lookups["Workforce Plan Schema"][newFormData.RoleID].Group;
        newFormData.Team =
          lookups["Workforce Plan Schema"][newFormData.RoleID].Team;
      }
      break;
    case "Request Role Change":
      newFormData.NewGroup = lookups.team[newFormData.NewTeam]
        ? lookups.team[newFormData.NewTeam].group
        : "";
      break;
    case "Onboard Civil Servant":
    case "Add New Civil Servant":
      newFormData.InternalMoves = JSON.stringify({
        0: {
          CC: newFormData.CostCentre,
          Date: 0,
          Capital: "No",
          "Sub Team": lookups.team[newFormData.Team]
            ? lookups.team[newFormData.Team].defaultSubTeam
            : "",
        },
      });
      break;
    default:
      break;
  }

  return newFormData;
}

function lookupViewValue(value, optionsSchema, lookups) {
  if (!value) return "";
  const [schemaName, , lookupField] = optionsSchema.split("#").slice(1);
  return lookups[schemaName][value][lookupField];
}

export {
  processStructureData,
  processViewData,
  extractOptionsFromSchema,
  processDataAndSchema,
  processFormData,
  lookupViewValue,
  convertDatesForSingleRow,
};
