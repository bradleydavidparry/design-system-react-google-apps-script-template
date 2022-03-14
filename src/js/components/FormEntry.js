import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import InternalMoves from "./custom/InternalMoves";
import SubTeamSelect from "./custom/SubTeamSelect";
import {
  Button,
  Input,
  Textarea,
  Select,
  Radios,
  DateInput,
  Checkboxes,
  Table,
  Label,
  DataList,
} from "../../govuk/index";
import FormatValue from "../functions/FormatValue";
import {
  normalise,
  checkUserAccess,
  parseFilterString,
} from "../functions/utilities";
import { lookupViewValue } from "../functions/dataProcessing";
import HtmlTemplates from "./HtmlTemplates";
import "../../css/autocomplete.css";

function FormEntry(props) {
  const {
    Type,
    Hint: hint,
    Options,
    OptionsSchema,
    Update,
    Create,
    RevealCondition,
    canEditView,
    fieldName,
    formData,
    updateFormData,
    userType,
    errors,
    recordId,
    schema,
    dataObject,
    history,
    isRevealConditionMet,
    viewName,
    submitting,
    lookups,
  } = props;

  const normalisedFieldName = normalise(fieldName);
  const revealConditionMet = RevealCondition
    ? isRevealConditionMet(RevealCondition)
    : true;

  useEffect(() => {
    if (!revealConditionMet) {
      const newFormData = { ...formData };
      newFormData[normalisedFieldName] = "";
      updateFormData(newFormData);
    }
  }, [revealConditionMet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData };
    newFormData[name] = value;
    updateFormData(newFormData);
  };

  const handleCheckboxChange = (e, fieldName) => {
    const { value, checked } = e.target;
    const newFormData = { ...formData };
    let selectionsList = newFormData[fieldName]
      ? newFormData[fieldName].split("#")
      : [];
    if (checked) {
      selectionsList.push(value);
    } else {
      selectionsList.splice(selectionsList.indexOf(value), 1);
    }
    newFormData[fieldName] = selectionsList.join("#");
    updateFormData(newFormData);
  };

  const handleDateChange = (e, fieldName) => {
    const { name, value } = e.target;
    const period = name.replace(`${fieldName}-`);

    const valueList = [
      document.getElementById(`${fieldName}-year`).value,
      document.getElementById(`${fieldName}-month`).value,
      document.getElementById(`${fieldName}-day`).value,
    ];

    const periodList = ["year", "month", "day"];

    valueList[periodList.indexOf(period)] = value;

    const newFormData = { ...formData };

    newFormData[fieldName] = valueList.every((period) => period)
      ? new Date(valueList.join("-"))
      : "";
    updateFormData(newFormData);
  };

  function extractOptionsFromSchema(
    value,
    identifier,
    data,
    viewName,
    schemaName,
    filterObject
  ) {
    if (
      viewName === "Create New Vacancy" &&
      schemaName === "Workforce Plan Schema"
    ) {
      return [""].concat(
        data
          .filter((row) => {
            return row.AvailableForCSVacancy === "Yes";
          })
          .map((row) => ({ value: row[value], children: row[identifier] }))
      );
    }
    return [""].concat(
      data
        .filter((row) => {
          for (let filterField in filterObject.include) {
            if (!filterObject.include[filterField].includes(row[filterField]))
              return false;
          }

          for (let filterField in filterObject.exclude) {
            if (filterObject.exclude[filterField].includes(row[filterField]))
              return false;
          }
          return true;
        })
        .map((row) => {
          return { value: row[value], children: row[identifier] };
        })
    );
  }

  const returnFormEntry = () => {
    if (
      Type === "Record List" ||
      (canEditView &&
        ((recordId !== "add_new" && checkUserAccess(Update, userType)) ||
          (recordId === "add_new" && checkUserAccess(Create, userType))))
    ) {
      if (revealConditionMet) {
        let processedOptions;
        if (OptionsSchema) {
          const [sourceSchemaName, value, identifier, , filterString] =
            OptionsSchema.split("#").slice(1);
          const filterObject = parseFilterString(filterString);
          processedOptions = extractOptionsFromSchema(
            value,
            normalise(identifier),
            dataObject[sourceSchemaName].data,
            viewName,
            sourceSchemaName,
            filterObject
          );
        } else {
          processedOptions = Options;
        }

        const commonProps = {
          disabled: submitting,
        };

        //Custom field
        switch (fieldName) {
          case "Internal Moves":
            return (
              <InternalMoves
                name={normalisedFieldName}
                internalMovesString={
                  formData[normalisedFieldName]
                    ? formData[normalisedFieldName]
                    : {}
                }
                formData={formData}
                updateFormData={updateFormData}
              />
            );
          case "Sub Team ID":
            return (
              <SubTeamSelect
                formData={formData}
                updateFormData={updateFormData}
              />
            );
          default:
            break;
        }

        switch (Type) {
          case "HTML":
            return <HtmlTemplates fieldName={fieldName} />;
          case "Comment":
            return (
              <h3 key={fieldName} style={{ marginBottom: "15px" }}>
                {fieldName}
              </h3>
            );
          case "Text":
            return (
              <Input
                {...commonProps}
                id={normalisedFieldName}
                hint={hint ? { children: hint } : null}
                label={{
                  children: fieldName,
                }}
                name={normalisedFieldName}
                key={fieldName}
                type="text"
                value={
                  formData[normalisedFieldName]
                    ? formData[normalisedFieldName]
                    : ""
                }
                onChange={handleChange}
                errorMessage={
                  errors[normalisedFieldName]
                    ? { children: "This is a required field" }
                    : null
                }
              />
            );
          case "Data List":
            function suggest(query, populateResults) {
              const results = processedOptions.map((option) =>
                option.children ? option.children : option
              );
              const loweCaseQuery = query.toLowerCase();
              const filteredResults = results.filter(
                (result) => result.toLowerCase().indexOf(loweCaseQuery) !== -1
              );
              populateResults(filteredResults);
            }

            const dataListHandleChange = (value) => {
              const name = normalisedFieldName;
              handleChange({ target: { value, name } });
            };

            return (
              <DataList
                {...commonProps}
                id={normalisedFieldName}
                label={{
                  children: fieldName,
                }}
                source={suggest}
                onConfirm={dataListHandleChange}
                name={normalisedFieldName}
                hint={hint ? { children: hint } : null}
                displayMenu={"overlay"}
                confirmOnBlur={false}
                errorMessage={
                  errors[normalisedFieldName]
                    ? { children: "This is a required field" }
                    : null
                }
                defaultValue={
                  formData[normalisedFieldName]
                    ? formData[normalisedFieldName]
                    : ""
                }
                showAllValues={true}
              />
            );
          case "Number":
            return (
              <Input
                {...commonProps}
                id={normalisedFieldName}
                hint={hint ? { children: hint } : null}
                label={{
                  children: fieldName,
                }}
                name={normalisedFieldName}
                key={fieldName}
                type="number"
                value={
                  formData[normalisedFieldName] ||
                  formData[normalisedFieldName] === 0
                    ? formData[normalisedFieldName]
                    : ""
                }
                onChange={handleChange}
                errorMessage={
                  errors[normalisedFieldName]
                    ? { children: "This is a required field" }
                    : null
                }
              />
            );
          case "Currency":
            return (
              <Input
                {...commonProps}
                id={normalisedFieldName}
                hint={hint ? { children: hint } : null}
                label={{
                  children: fieldName,
                }}
                name={normalisedFieldName}
                key={fieldName}
                type="number"
                prefix={{
                  children: "£",
                }}
                value={
                  formData[normalisedFieldName] ||
                  formData[normalisedFieldName] === 0
                    ? formData[normalisedFieldName]
                    : ""
                }
                onChange={handleChange}
                errorMessage={
                  errors[normalisedFieldName]
                    ? { children: "This is a required field" }
                    : null
                }
              />
            );
          case "Text Area":
            return (
              <Textarea
                {...commonProps}
                id={normalisedFieldName}
                hint={hint ? { children: hint } : null}
                label={{
                  children: fieldName,
                }}
                name={normalisedFieldName}
                key={fieldName}
                value={
                  formData[normalisedFieldName]
                    ? formData[normalisedFieldName]
                    : ""
                }
                onChange={handleChange}
                errorMessage={
                  errors[normalisedFieldName]
                    ? { children: "This is a required field" }
                    : null
                }
              />
            );
          case "Select":
            return (
              <Select
                {...commonProps}
                id={normalisedFieldName}
                errorMessage={
                  errors[normalisedFieldName]
                    ? { children: "This is a required field" }
                    : null
                }
                hint={hint ? { children: hint } : null}
                items={processedOptions
                  .map((option) =>
                    option.children
                      ? option
                      : { children: option, value: option }
                  )
                  .sort((a, b) =>
                    a.children === b.children
                      ? 0
                      : a.children > b.children
                      ? 1
                      : -1
                  )}
                label={{
                  children: fieldName,
                }}
                value={
                  formData[normalisedFieldName]
                    ? formData[normalisedFieldName]
                    : ""
                }
                onChange={handleChange}
                name={normalisedFieldName}
                key={fieldName}
              />
            );
          case "Radio":
            return (
              <Radios
                {...commonProps}
                id={normalisedFieldName}
                fieldset={{
                  legend: {
                    children: fieldName,
                  },
                }}
                formGroup={{
                  className: "govuk-radios--small",
                }}
                items={processedOptions.map((option) => ({
                  children: option,
                  value: option,
                  disabled: submitting,
                }))}
                name={normalisedFieldName}
                value={
                  formData[normalisedFieldName]
                    ? formData[normalisedFieldName]
                    : ""
                }
                onChange={handleChange}
                key={fieldName}
                errorMessage={
                  errors[normalisedFieldName]
                    ? { children: "This is a required field" }
                    : null
                }
              />
            );
          case "Checkbox":
            return (
              <Checkboxes
                {...commonProps}
                id={normalisedFieldName}
                fieldset={{
                  legend: {
                    children: fieldName,
                  },
                }}
                hint={hint ? { children: hint } : null}
                items={processedOptions
                  .filter((option) => option)
                  .map((option) => ({
                    children: option,
                    value: option,
                    name: option,
                    disabled: submitting,
                    checked: formData[normalisedFieldName]
                      ? formData[normalisedFieldName]
                          .split("#")
                          .includes(option)
                      : false,
                  }))}
                name={normalisedFieldName}
                onChange={(e) => handleCheckboxChange(e, normalisedFieldName)}
                errorMessage={
                  errors[normalisedFieldName]
                    ? { children: "This is a required field" }
                    : null
                }
              />
            );
          case "Date":
            const date = formData[normalisedFieldName]
              ? new Date(formData[normalisedFieldName])
              : "";
            const [day, month, year] = date
              ? [date.getDate(), date.getMonth() + 1, date.getFullYear()]
              : ["", "", ""];
            return (
              <DateInput
                {...commonProps}
                fieldset={{
                  legend: {
                    children: fieldName,
                  },
                }}
                hint={hint ? { children: hint } : null}
                namePrefix={normalisedFieldName}
                id={normalisedFieldName}
                day={day}
                month={month}
                year={year}
                onChange={(e) => handleDateChange(e, normalisedFieldName)}
                errorMessage={
                  errors[normalisedFieldName]
                    ? { children: "This is a required field" }
                    : null
                }
              />
            );
          case "Record List":
            if (recordId === "add_new") return null;
            const optionsString = schema[fieldName].Options;
            const [
              schemaName,
              filterColumn,
              path,
              create,
              createPath,
              ...fields
            ] = optionsString.slice(1);
            const normalisedFilterColumn = normalise(filterColumn);
            const listData = dataObject[schemaName].data.filter(
              (row) => row[normalisedFilterColumn] == recordId
            );

            const onClickSubTableButton = () => {
              updateFormData({});

              //TEST
              const splitCreate = create.split("=");
              let query;
              const additionalFieldsToSendToForm = splitCreate[1]
                ? JSON.parse(splitCreate[1])
                : null;

              if (additionalFieldsToSendToForm) {
                const queryObject = additionalFieldsToSendToForm.reduce(
                  (object, field) => {
                    if (typeof field === "string") {
                      object[normalise(field)] = formData[normalise(field)];
                    } else {
                      const [fieldName, value] = field;
                      object[normalise(fieldName)] = value;
                    }
                    return object;
                  },
                  {}
                );
                query = new URLSearchParams({
                  ...queryObject,
                }).toString();
              }
              //END TEST

              history.push(
                `${createPath}?${normalisedFilterColumn}=${formData.ID}${
                  query ? `&${query}` : ``
                }`
              );
            };

            return (
              <div className="govuk-form-group">
                {listData.length === 0 && create.includes("Create") ? (
                  <Label>{fieldName}</Label>
                ) : null}
                {listData.length > 0 ? (
                  <Table
                    firstCellIsHeader
                    caption={fieldName}
                    captionClassName="govuk-heading-m"
                    head={fields.concat(["", ""]).map((heading) => {
                      return { children: heading };
                    })}
                    rows={listData.map((row) => ({
                      cells: fields
                        .map((heading) => {
                          const input = dataObject[schemaName].schema[heading]
                            ?.OptionsSchema
                            ? lookupViewValue(
                                row[normalise(heading)],
                                dataObject[schemaName].schema[heading]
                                  ?.OptionsSchema,
                                lookups
                              )
                            : row[normalise(heading)];

                          return {
                            children: (
                              <FormatValue
                                input={input}
                                type={
                                  dataObject[schemaName].schema[heading]?.Type
                                }
                                heading={heading}
                              />
                            ),
                          };
                        })
                        .concat({
                          children: (
                            <Link
                              className={"govuk-link"}
                              to={`${path}${row.ID}`}
                            >
                              View
                            </Link>
                          ),
                        }),
                    }))}
                  />
                ) : null}
                {create.includes("Create") ? (
                  <Button onClick={onClickSubTableButton}>
                    Create New {fieldName.substring(0, fieldName.length - 1)}
                  </Button>
                ) : null}
              </div>
            );
          default:
            return (
              <Input
                {...commonProps}
                id={normalisedFieldName}
                hint={hint ? { children: hint } : null}
                label={{
                  children: fieldName,
                }}
                name={normalisedFieldName}
                key={fieldName}
                type="text"
                value={
                  formData[normalisedFieldName]
                    ? formData[normalisedFieldName]
                    : ""
                }
                onChange={handleChange}
                errorMessage={
                  errors[normalisedFieldName]
                    ? { children: "This is a required field" }
                    : null
                }
              />
            );
        }
      }
    } else {
      if (!formData[normalisedFieldName] && formData[normalisedFieldName] !== 0)
        return null;
      if (schema[fieldName].OptionsSchema) {
        const [, schemaName, id, primaryField, path, , ...fields] =
          schema[fieldName].OptionsSchema.split("#");
        const filterField =
          schema[fieldName].Type === "Data List" ? normalise(primaryField) : id;
        const value = dataObject[schemaName].data.filter(
          (row) => row[filterField] === formData[normalisedFieldName]
        );
        if (value.length === 0) return null;
        return (
          <Table
            firstCellIsHeader
            caption={fieldName}
            captionClassName="govuk-heading-m"
            head={[primaryField, ...fields].concat(["", ""]).map((heading) => {
              return { children: heading };
            })}
            rows={value.map((row) => ({
              cells: [primaryField, ...fields]
                .map((heading) => {
                  const input = dataObject[schemaName].schema[heading]
                    ?.OptionsSchema
                    ? lookupViewValue(
                        row[normalise(heading)],
                        dataObject[schemaName].schema[heading]?.OptionsSchema,
                        lookups
                      )
                    : row[normalise(heading)];

                  return {
                    children: (
                      <FormatValue
                        input={input}
                        type={dataObject[schemaName].schema[heading]?.Type}
                        heading={heading}
                      />
                    ),
                  };
                })
                .concat({
                  children: (
                    <Link className={"govuk-link"} to={`${path}${row.ID}`}>
                      View
                    </Link>
                  ),
                }),
            }))}
          />
        );
      }
      return (
        <div className="govuk-form-group">
          <Label>{fieldName}</Label>
          <p id="FullName" name="FullName">
            <FormatValue
              input={formData[normalisedFieldName]}
              type={schema[fieldName].Type}
              heading={fieldName}
            />
          </p>
        </div>
      );
    }
  };

  return <>{returnFormEntry()}</>;
}

export default FormEntry;

// function areEqual(prevProps, nextProps) {
//     return Object.values(prevProps.formData).join() === Object.values(nextProps.formData).join();
// }

// export default React.memo(FormEntry,areEqual);
