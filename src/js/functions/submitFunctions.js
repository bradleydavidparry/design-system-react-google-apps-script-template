import {
  formatDateTime,
  formatDate,
  // getFirstNameFromGdsEmail,
} from "./utilities";
import getEmailObject from "./emailObject";
import { convertDatesForSingleRow } from "./dataProcessing";
import { checkUserAccess } from "./utilities";
import processFormData from "./processFormData";

const checkErrors = (inputs) => {
  const {
    splitFields,
    normalise,
    schema,
    formData,
    isRevealConditionMet,
    setErrors,
    userType,
  } = inputs;

  const newErrors = {};

  splitFields.forEach((field) => {
    var normalisedFieldName = normalise(field);
    if (
      schema[field].Required &&
      (checkUserAccess(schema[field].Update, userType) ||
        checkUserAccess(schema[field].Create, userType)) &&
      !["Record List", "Comment"].includes(schema[field].Type) &&
      !formData[normalisedFieldName] &&
      formData[normalisedFieldName] !== 0 &&
      isRevealConditionMet(schema[field].RevealCondition)
    ) {
      newErrors[normalisedFieldName] = `Please enter a value for ${field}`;
    }
  });

  setErrors(newErrors);
  return newErrors;
};

const updateData = (inputs, goBack) => {
  const {
    normalise,
    schema,
    formData,
    user,
    dataObject,
    Schemas,
    setDataObject,
    extractSheetName,
    DataSheetName,
    record,
    history,
  } = inputs;

  const updateObject = Object.keys(formData).reduce(
    (object, key) => {
      if (!formData.ID || record[key] !== formData[key]) {
        object[key] = formData[key];
      }
      return object;
    },
    { ID: formData.ID }
  );

  const updateTime = formatDateTime(new Date());

  for (let field in schema) {
    let normalisedFieldName = normalise(field);
    if (
      schema[field].TimeStamp &&
      updateObject[normalisedFieldName] &&
      updateObject[normalisedFieldName] !== record[normalisedFieldName]
    ) {
      updateObject[`${normalisedFieldName}UpdatedAt`] = updateTime;
      updateObject[`${normalisedFieldName}UpdatedBy`] = user;
    }
    if (schema[field].Type === "Date" && updateObject[normalisedFieldName]) {
      updateObject[normalisedFieldName] = formatDate(
        updateObject[normalisedFieldName]
      );
    }
    if (
      schema[field].Type === "DateTime" &&
      updateObject[normalisedFieldName]
    ) {
      updateObject[normalisedFieldName] = formatDateTime(
        updateObject[normalisedFieldName]
      );
    }
  }

  if (!updateObject.ID) {
    updateObject.CreatedBy = user;
    updateObject.CreatedAt = updateTime;

    for (let field in schema) {
      let normalisedFieldName = normalise(field);
      if (schema[field].DefaultValue && !updateObject[normalisedFieldName]) {
        updateObject[normalisedFieldName] = schema[field].DefaultValue;
      }
    }
  }

  updateObject.UpdatedBy = user;
  updateObject.UpdatedAt = updateTime;

  const sheetName = extractSheetName(DataSheetName, updateObject);

  const emailObject = getEmailObject(sheetName, updateObject, record);

  console.log({ sheetName, updateObject, emailObject });

  google.script.run
    .withSuccessHandler((id) => {
      const splitSchemas = Schemas.split("#");
      const newDataObject = { ...dataObject };
      newDataObject[splitSchemas[0]].data = newDataObject[
        splitSchemas[0]
      ].data.filter((row) => row.ID != id);
      const dateFields = Object.values(schema)
        .filter((field) => ["Date", "DateTime"].includes(field.Type))
        .map((field) => normalise(field.Field));
      const newRecord = convertDatesForSingleRow(
        { ...record, ...updateObject, ID: id },
        dateFields
      );

      newDataObject[splitSchemas[0]].data.push(newRecord);
      setDataObject(newDataObject);
      goBack && history.goBack();
    })
    .withFailureHandler((err) => {
      console.log(err);
    })
    .updateDataGs({ sheetName, updateObject, emailObject });
};

const submit = (inputs, goBack = true) => {
  const { setSubmitting } = inputs;
  setSubmitting(true);
  const newErrors = checkErrors(inputs);
  if (Object.keys(newErrors).length > 0) {
    setSubmitting(false);
  } else {
    updateData(inputs, goBack);
  }
};

function createNewVacancySubmit(inputs) {
  inputs.formData.FTE = Number(
    Number(inputs.formData.Hoursperweek) / 37
  ).toFixed(2);
  inputs.formData.Status = "E) Approved - Ready To Launch";
  inputs.formData.RequirementFilled = "No";
  inputs.formData.RollingCampaign = "No";
  inputs.formData.Recruiter = "Unassigned";

  let statusTimeline = new Map();
  statusTimeline.set(0, [
    "E) Approved - Ready To Launch",
    formatDateTime(new Date()),
  ]);
  inputs.formData.StatusTimeline = JSON.stringify([...statusTimeline]);

  if (inputs.formData.EmploymentStatus) {
    inputs.DataSheetName = "CS Vacancies";
    inputs.Schemas = "CS Vacancies Schema";

    inputs.formData.ForecastAnnualSalary =
      inputs.lookups.rateCard[inputs.formData.Payband];

    submit(inputs, !inputs.formData.LengthofContractRequest ? true : false);
  }

  if (inputs.formData.LengthofContractRequest) {
    inputs.DataSheetName = "Contractor Vacancies";
    inputs.Schemas = "Contractor Vacancies Schema";

    inputs.formData.Status = "1 - Contracting Review";

    let statusTimeline = new Map();
    statusTimeline.set(0, [
      "1 - Contracting Review",
      formatDateTime(new Date()),
    ]);
    inputs.formData.StatusTimeline = JSON.stringify([...statusTimeline]);

    inputs.formData.NeworExtension = "New";

    inputs.formData.BusinessUnitSCSApproval = "Pending";
    inputs.formData.HRBPGDSWeeklyReviewMeeting = "Pending";
    inputs.formData.COFinanceBPApproval = "Pending";
    inputs.formData.CabinetOfficeApproval = "Pending";
    inputs.formData.MinisterialApproval = "Pending";
    inputs.formData.FinalOutcome = "Pending";

    inputs.formData.FTE = 1;

    submit(inputs);
  }
}

function onboardCivilServant(inputs) {
  const { dataObject, setDataObject, setSubmitting, record, schema, lookups } =
    inputs;
  let { formData } = inputs;
  setSubmitting(true);

  if (formData.FullNameInternalCandidate) {
    delete record.JobTitle;
    delete record.Payband;
    delete record.EmploymentStatus;
    delete record.FTE;
    delete record.RoleID;
    delete record.BasicSalary;
    delete record.RRAAllowanceAnnual;
    delete record.MiscellaneousAllowanceAnnual;
    delete record.DDaTAllowanceAnnual;
    delete record.EarlyTalentType;
    delete record.Location;
    delete record.ContractStartDate;
    delete record.ContractEndDate;
    delete record.DDaTCapabilityLevel;
    delete record.VacancyID;
    delete record.JobFamily;
  }

  formData = processFormData(
    schema,
    formData,
    "Onboard Civil Servant",
    dataObject,
    lookups
  );

  const parsedStatusTimeline = new Map(JSON.parse(formData.StatusTimeline));

  parsedStatusTimeline.set(parsedStatusTimeline.size, [
    "T) Ready To Start",
    formatDateTime(new Date()),
  ]);

  parsedStatusTimeline.set(parsedStatusTimeline.size, [
    "U) In Post",
    formatDateTime(new Date(formData.ContractStartDate)),
  ]);

  formData.StatusTimeline = JSON.stringify([...parsedStatusTimeline]);

  const newErrors = checkErrors(inputs);
  if (Object.keys(newErrors).length > 0) {
    setSubmitting(false);
  } else {
    google.script.run
      .withSuccessHandler(() => {
        const newDataObject = { ...dataObject };
        newDataObject["CS Vacancies Schema"].data = newDataObject[
          "CS Vacancies Schema"
        ].data.map((row) => {
          if (row.ID === formData.VacancyID) {
            row.RequirementFilled = "Yes";
          }
          return row;
        });
        setDataObject(newDataObject);

        updateData(inputs, true);
      })
      .withFailureHandler((e) => {
        console.log(e);
      })
      .updateDataGs({
        sheetName: "CS Vacancies",
        updateObject: {
          ID: formData.VacancyID,
          RequirementFilled: "Yes",
          StatusTimeline: formData.StatusTimeline,
          ContractStartDate: formatDate(formData.ContractStartDate),
        },
      });
  }
}

function approveWorkforcePlanChanges(inputs) {
  const { dataObject, formData, setDataObject, setSubmitting } = inputs;
  setSubmitting(true);
  google.script.run
    .withSuccessHandler(() => {
      const newDataObject = { ...dataObject };
      newDataObject["Workforce Plan Schema"].data = newDataObject[
        "Workforce Plan Schema"
      ].data.map((row) => {
        if (row.ID === formData.RoleID) {
          row.Team = formData.NewTeam;
          row.Group = formData.NewGroup;
          row.Payband = formData.NewPayband;
          row.ReportsTo = formData.NewReportsTo;
          row.JobTitle = formData.JobTitle;
        }
        return row;
      });
      setDataObject(newDataObject);
      submit(inputs);
    })
    .withFailureHandler((e) => {
      console.log(e);
    })
    .updateDataGs({
      sheetName: "Workforce Plan",
      updateObject: {
        ID: formData.RoleID,
        Team: formData.NewTeam,
        Group: formData.NewGroup,
        Payband: formData.NewPayband,
        ReportsTo: formData.NewReportsTo,
        JobTitle: formData.JobTitle,
      },
    });
}

function updateVacancy(inputs) {
  const parsedStatusTimeline = new Map(
    JSON.parse(inputs.formData.StatusTimeline)
  );
  const lastStatusUpdateArray = Array.from(parsedStatusTimeline.values()).pop();
  if (
    inputs.formData.Status !==
    (lastStatusUpdateArray && lastStatusUpdateArray[0]
      ? lastStatusUpdateArray[0]
      : "")
  ) {
    parsedStatusTimeline.set(parsedStatusTimeline.size, [
      inputs.formData.Status,
      formatDateTime(new Date()),
    ]);
  }
  inputs.formData.StatusTimeline = JSON.stringify([...parsedStatusTimeline]);
  submit(inputs);
}

function getContractorOriginalStartDate(name, contractStartDate, dataObject) {
  const previousContracts = dataObject["Contractors Schema"].data.filter(
    (row) => row.FullName === name
  );
  if (previousContracts.length === 0) return contractStartDate;
  return previousContracts
    .map((row) => row.OriginalStartDate)
    .sort((a, b) => a - b)[0];
}

function onboardContractorVacancy(inputs) {
  const { dataObject, formData, setDataObject, setSubmitting } = inputs;

  formData.OriginalStartDate = getContractorOriginalStartDate(
    formData.FullName,
    formData.ContractStartDate,
    dataObject
  );

  if (formData.VacancyID) {
    setSubmitting(true);
    const newErrors = checkErrors(inputs);
    if (Object.keys(newErrors).length > 0) {
      setSubmitting(false);
    } else {
      google.script.run
        .withSuccessHandler(() => {
          const newDataObject = { ...dataObject };
          newDataObject["Contractor Vacancies Schema"].data = newDataObject[
            "Contractor Vacancies Schema"
          ].data.map((row) => {
            if (row.ID === formData.VacancyID) {
              row.RequirementFilled = "Yes";
              row.Status = "5 - Complete";
            }
            return row;
          });
          setDataObject(newDataObject);
          updateData(inputs, true);
        })
        .withFailureHandler((e) => {
          console.log(e);
        })
        .updateDataGs({
          sheetName: "Contractor Vacancies",
          updateObject: {
            ID: formData.VacancyID,
            RequirementFilled: "Yes",
            Status: "5 - Complete",
          },
        });
    }
  } else {
    submit(inputs);
  }
}

function TEMPCreateNewVacancy(inputs) {
  let statusTimeline = new Map();
  statusTimeline.set(0, [
    "E) Approved - Ready To Launch",
    formatDateTime(new Date()),
  ]);
  inputs.formData.StatusTimeline = JSON.stringify([...statusTimeline]);
  submit(inputs);
}

function submitBusinessManagerView(inputs) {
  const amendedFirstMoveDateObject = JSON.parse(inputs.formData.InternalMoves);
  amendedFirstMoveDateObject["0"]["Date"] = 0;
  inputs.formData.InternalMoves = JSON.stringify(amendedFirstMoveDateObject);
  submit(inputs);
}

function submitRAndRSection(inputs) {
  if (
    inputs.formData.IsthisaBonusorVouchernomination === "Bonus" &&
    inputs.formData.DateActioned &&
    inputs.formData.LetterSent
  ) {
    inputs.formData.PaperworkProcessed = "Yes";
  }
  if (
    inputs.formData.IsthisaBonusorVouchernomination === "Voucher" &&
    inputs.formData.DateActioned
  ) {
    inputs.formData.PaperworkProcessed = "Yes";
  }
  submit(inputs);
}

function submitHrApprovals(inputs) {
  setSubmitting(true);
  const { formData } = inputs;
  const csUpdateObject = { ID: formData.PersonId };
  if (formData.HRApproved === "Approved") {
    const { Whattypeofapprovalrequestisthis } = formData;
    switch (Whattypeofapprovalrequestisthis) {
      case "Career break":
        csUpdateObject.TypeofAbsence = "Career Break";
        // csUpdateObject.LeaveStartDate = formData.RequestedenddateofTDA;
        break;
      case "FTA Extension":
        break;
      case "Permanency":
        csUpdateObject.EmploymentStatus = "Permanent";
        csUpdateObject.ContractEndDate = "";
        break;
      case "Recruitment & Retention Allowance":
        csUpdateObject.RRAannual = formData.Amountofallowancerequested;
        csUpdateObject.RRAStartDate =
          formData.Dateyouarerequestingtheallowancetostart;
        csUpdateObject.RRAEndDate =
          formData.Dateyouarerequestingtheallowancetoend;
        break;
      case "Temporary Duties Allowance":
        csUpdateObject.TDAannual = formData.TDAAmount;
        csUpdateObject.TDAstartdate = formData.RequestedstartdateofTDA;
        csUpdateObject.TDAenddate = formData.RequestedenddateofTDA;
        break;
      case "Loan or Secondment":
        break;
      default:
        break;
    }
  }

  //HERE

  const { dataObject, setDataObject, setSubmitting, record, schema, lookups } =
    inputs;

  formData = processFormData(
    schema,
    formData,
    "Onboard Civil Servant",
    dataObject,
    lookups
  );

  const newErrors = checkErrors(inputs);
  if (Object.keys(newErrors).length > 0) {
    setSubmitting(false);
  } else {
    google.script.run
      .withSuccessHandler(() => {
        const newDataObject = { ...dataObject };
        newDataObject["CS Vacancies Schema"].data = newDataObject[
          "CS Vacancies Schema"
        ].data.map((row) => {
          if (row.ID === formData.VacancyID) {
            row.RequirementFilled = "Yes";
          }
          return row;
        });
        setDataObject(newDataObject);

        updateData(inputs, true);
      })
      .withFailureHandler((e) => {
        console.log(e);
      })
      .updateDataGs({
        sheetName: "CS Vacancies",
        updateObject: {
          ID: formData.VacancyID,
          RequirementFilled: "Yes",
          StatusTimeline: formData.StatusTimeline,
          ContractStartDate: formatDate(formData.ContractStartDate),
        },
      });
  }

  //HERE

  submit(inputs);
}

function getSubmitFunction(viewName) {
  switch (viewName) {
    case "Submit New R&R Request":
    case "R&R Pending Approval":
    case "R&R Ready For Processing":
    case "R&R Completed Requests":
      return submitRAndRSection;
    case "Business Manager View":
      return submitBusinessManagerView;
    case "Requested Changes":
      return approveWorkforcePlanChanges;
    case "Create New Vacancy":
    case "Request New Vacancy":
    case "Create New Contracting Requirement":
      return createNewVacancySubmit;
    case "Onboard Civil Servant":
      return onboardCivilServant;
    case "Live CS Vacancies":
    case "Complete CS Vacancies":
    case "Vetting and Onboarding":
    case "Withdrawn CS Vacancies":
    case "All Contracting Requirements":
    case "Planning":
    case "Approvals":
    case "Recruitment and Procurement":
    case "Onboarding":
    case "Complete":
    case "On Hold":
    case "Cancelled":
      return updateVacancy;
    case "TEMP Create New Vacancy":
      return TEMPCreateNewVacancy;
    case "Add New Contingent Worker or Contractor":
      return onboardContractorVacancy;
    case "HR Approvals For HR Approval":
      return submitHrApprovals;
    default:
      return submit;
  }
}

export { getSubmitFunction };
