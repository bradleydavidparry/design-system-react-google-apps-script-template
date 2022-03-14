import React, { useState, useContext, useEffect } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { Button, Fieldset, ErrorSummary } from "../../govuk/index";
import FormEntry from "./FormEntry";
import { normalise } from "../functions/utilities";
import { getSubmitFunction } from "../functions/submitFunctions";
import { processFormData } from "../functions/dataProcessing";
import { submitButtonReveal } from "../functions/submitButtonReveal";
import AppContext from "../views/AppContext";
import ViewComponent from "./ViewComponent";

const getCurrentRecord = (data, recordId, query, schema, splitFields) => {
  if (recordId !== "add_new")
    return data.filter((row) => row.ID == recordId)[0];
  const defaultValues = splitFields.reduce((object, field) => {
    if (schema[field]?.DefaultValue) {
      object[normalise(field)] = schema[field].DefaultValue;
    }
    return object;
  }, {});
  return { ...defaultValues, ...query };
};

function useQuery() {
  const query = new URLSearchParams(useLocation().search);
  const object = {};
  for (var pair of query.entries()) {
    object[pair[0]] = pair[1];
  }
  return object;
}

export default function Record(props) {
  let history = useHistory();
  const {
    Fields,
    DataSheetName,
    edittingPossible,
    creatingPossible,
    Schemas,
    viewName,
    fullWidthView,
  } = props;
  const { userType, dataObject, setDataObject, user, lookups } =
    useContext(AppContext);

  const { data, schema } = dataObject[Schemas.split("#")[0]];

  let query = useQuery();
  const splitFields =
    Fields === "All"
      ? Object.keys(schema).filter(
          (field) =>
            field.indexOf("Created At") === -1 &&
            field.indexOf("Created By") === -1 &&
            field.indexOf("Updated At") === -1 &&
            field.indexOf("Updated By") === -1
        )
      : Fields.split("#");

  let { recordId } = useParams();
  const record = getCurrentRecord(data, recordId, query, schema, splitFields);
  const [formData, setFormData] = useState({ ...record });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const record = getCurrentRecord(data, recordId, query, schema, splitFields);
    setFormData({ ...record });
  }, [data, recordId]);

  const updateFormData = (newFormData) => {
    newFormData = processFormData(
      schema,
      newFormData,
      viewName,
      dataObject,
      lookups
    );
    setFormData(newFormData);
  };

  function parseRevealCondition(revealConditionString) {
    return revealConditionString
      .split("||")
      .reduce((object, conditionString) => {
        const [field, listString] = conditionString.split("=");
        const parsedList = JSON.parse(listString);
        object[field] = parsedList;
        return object;
      }, {});
  }

  function isRevealConditionMet(revealConditionString) {
    if (!revealConditionString) return true;
    const revealConditionObject = parseRevealCondition(revealConditionString);
    return Object.keys(revealConditionObject).some((key) =>
      revealConditionObject[key].includes(formData[normalise(key)])
    );
  }

  function extractSheetName(DataSheetName, updateObject) {
    if (DataSheetName.indexOf("#") === -1) return DataSheetName;
    const [conditionField, conditionsString] = DataSheetName.split("#");
    const conditionObject = conditionsString
      .split("||")
      .reduce((object, conditionString) => {
        const [valueListString, sheetName] = conditionString.split("=>");
        const listString = JSON.parse(valueListString);
        listString.forEach((value) => {
          object[value] = sheetName;
        });
        return object;
      }, {});
    return conditionObject[updateObject[normalise(conditionField)]];
  }

  const canEditView =
    (recordId !== "add_new" && edittingPossible) ||
    (recordId === "add_new" && creatingPossible);
  const showSubmitButton = submitButtonReveal(viewName, formData);

  const submitFunction = getSubmitFunction(viewName);

  return (
    <div className="govuk-grid-row">
      <div
        className={
          fullWidthView
            ? "govuk-grid-column-two-thirds"
            : "govuk-grid-column-full"
        }
      >
        <Fieldset>
          {splitFields.map((fieldName) => {
            const FormEntryProps = {
              ...schema[fieldName],
              canEditView,
              fieldName,
              userType,
              formData,
              updateFormData,
              errors,
              recordId,
              schema,
              viewName,
              dataObject,
              history,
              key: fieldName,
              lookups,
              parseRevealCondition,
              isRevealConditionMet,
              submitting,
            };
            return <FormEntry {...FormEntryProps} />;
          })}
          {Object.keys(errors).length > 0 ? (
            <ErrorSummary
              errorList={Object.keys(errors).map((error, index) => ({
                children: Object.values(errors)[index],
                href: `#${error}`,
              }))}
              titleChildren="There is a problem"
            />
          ) : null}
          {canEditView && showSubmitButton ? (
            <Button
              onClick={() =>
                submitFunction({
                  setSubmitting,
                  splitFields,
                  normalise,
                  schema,
                  formData,
                  isRevealConditionMet,
                  setErrors,
                  user,
                  userType,
                  dataObject,
                  Schemas,
                  setDataObject,
                  extractSheetName,
                  DataSheetName,
                  record,
                  history,
                  lookups,
                })
              }
              disabled={submitting}
              className={
                formData.ID ? "govuk-button--secondary" : "govuk-button"
              }
            >
              {formData.ID ? "Update" : "Create"}
            </Button>
          ) : null}
        </Fieldset>
        <ViewComponent
          Name={viewName}
          data={formData}
          schema={schema}
          type={"below_record"}
        />
      </div>
    </div>
  );
}
