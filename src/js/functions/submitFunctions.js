import { formatDateTime, formatDate } from "./utilities";
import { convertDatesForSingleRow } from "./dataProcessing";

const submit = (inputs) => {
  const {
    setSubmitting,
    splitFields,
    normalise,
    schema,
    formData,
    isRevealConditionMet,
    setErrors,
    user,
    dataObject,
    Schemas,
    setDataObject,
    extractSheetName,
    DataSheetName,
    record,
    history,
  } = inputs;

  setSubmitting(true);
  const newErrors = {};
  splitFields.forEach((field) => {
    var normalisedFieldName = normalise(field);
    if (
      schema[field].Required &&
      !["Record List", "Comment"].includes(schema[field].Type) &&
      !formData[normalisedFieldName] &&
      isRevealConditionMet(schema[field].RevealCondition)
    ) {
      newErrors[normalisedFieldName] = `Please enter a value for ${field}`;
    }
  });

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    setSubmitting(false);
  } else {
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
        //if(recordId === "add_new") setFormData({});
        setDataObject(newDataObject);
        //setSubmitting(false);
        history.goBack();
      })
      .withFailureHandler((err) => {
        console.log(err);
      })
      .updateData({ sheetName, updateObject });
  }
};

function createNewVacancySubmit(inputs) {
  inputs.formData.FTE = Number(
    Number(inputs.formData.Hoursperweek) / 37
  ).toFixed(2);
  inputs.formData.Status = "E) Approved - Ready To Launch";
  inputs.formData.RequirementFilled = "No";
  inputs.formData.CapitalRole = "No";
  inputs.formData.RollingCampaign = "No";
  inputs.formData.Recruiter = "Unassigned";
  if (inputs.formData.Doyouneedtohirepermanentlyonly === "Yes") {
    inputs.DataSheetName = "CS Vacancies";
    inputs.Schemas = "CS Vacancies Schema";
  } else {
    inputs.DataSheetName = "Contractor Vacancies";
    inputs.Schemas = "Contractor Vacancies Schema";
  }
  submit(inputs);
}

function onboardCivilServant(inputs) {
  const { dataObject, formData, setDataObject, setSubmitting } = inputs;
  setSubmitting(true);
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
      submit(inputs);
    })
    .updateData({
      sheetName: "CS Vacancies",
      updateObject: { ID: formData.VacancyID, RequirementFilled: "Yes" },
    });
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
    .updateData({
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

function getSubmitFunction(viewName) {
  switch (viewName) {
    case "Requested Changes":
      return approveWorkforcePlanChanges;
    case "Create New Vacancy":
      return createNewVacancySubmit;
    case "Onboard Civil Servant":
      return onboardCivilServant;
    default:
      return submit;
  }
}

export { getSubmitFunction };
