import React, { useContext } from "react";
import ReactPivotTable from "./custom/ReactPivotTable";
import OnboardButton from "./custom/OnboardButton";
import CreateExtensionButton from "./custom/CreateExtensionButton";
import WorkforcePlanSubRecord from "./custom/WorkforcePlanSubRecord";
import { normalise } from "../functions/utilities";
import AppContext from "../views/AppContext";

export default function ViewComponent(props) {
  const { Name, data, schema, type } = props;
  const { userType } = useContext(AppContext);
  let excludeCols, schemaValues, tableProperties;

  const getAboveToolbarComponent = (viewName) => {
    switch (viewName) {
      case "CS Analysis":
        excludeCols = [
          "ID",
          "Created At",
          "Created By",
          "Annualleavedays",
          "UpdatedBy",
          "UpdatedAt",
        ];
        schemaValues = Object.values(schema);
        tableProperties = {
          rows: ["Group", "Payband"],
          cols: ["Location"],
          aggregatorName: "Sum",
          vals: ["FTE"],
          unusedOrientationCutoff: Infinity,
          hiddenFromAggregators: schemaValues
            .filter((row) => !["Number", "Currency"].includes(row.Type))
            .map((row) => normalise(row.Field))
            .concat(excludeCols),
          hiddenFromDragDrop: schemaValues
            .filter((row) => !["Select"].includes(row.Type))
            .map((row) => normalise(row.Field))
            .concat(excludeCols),
          valueFilter: {
            CurrentlyEmployed: { No: true },
            Group: { CDDO: true, CDIO: true },
          },
          rendererName: "Table",
        };
        return (
          <ReactPivotTable
            data={data}
            showUi={true}
            tableProperties={tableProperties}
          />
        );
      case "WFP Analysis":
        excludeCols = [
          "ID",
          "Created At",
          "Created By",
          "Annualleavedays",
          "UpdatedBy",
          "UpdatedAt",
          "CurrentCivilServant",
          "CurrentContractor",
          "CurrentContractorVacancy",
          "CurrentCsVacancy",
          "ChangeRequestsOutstanding",
        ];
        schemaValues = Object.values(schema);
        tableProperties = {
          rows: ["Group", "Team", "Payband"],
          cols: ["AvailableForCSVacancy", "FilledVacant", "CurrentStatus"],
          aggregatorName: "Count",
          vals: [],
          unusedOrientationCutoff: Infinity,
          hiddenFromAggregators: schemaValues
            .filter((row) => !["Number", "Currency"].includes(row.Type))
            .map((row) => normalise(row.Field))
            .concat(excludeCols),
          hiddenFromDragDrop: schemaValues
            .filter((row) => !["Select"].includes(row.Type))
            .map((row) => normalise(row.Field))
            .concat(excludeCols),
          valueFilter: {
            CurrentlyEmployed: { No: true },
            Group: { CDDO: true, CDIO: true },
          },
          rendererName: "Table",
        };
        return (
          <ReactPivotTable
            data={data}
            showUi={true}
            tableProperties={tableProperties}
          />
        );
      default:
        return null;
    }
  };

  const getBelowToolbarComponent = (viewName) => {
    switch (viewName) {
      case "Live CS Vacancies":
        excludeCols = [
          "ID",
          "Created At",
          "Created By",
          "Annualleavedays",
          "UpdatedBy",
          "UpdatedAt",
        ];
        schemaValues = Object.values(schema);
        tableProperties = {
          rows: ["Recruiter"],
          cols: ["Status"],
          aggregatorName: "Count",
          vals: [],
          unusedOrientationCutoff: Infinity,
          hiddenFromAggregators: schemaValues
            .filter((row) => !["Number", "Currency"].includes(row.Type))
            .map((row) => normalise(row.Field))
            .concat(excludeCols),
          hiddenFromDragDrop: schemaValues
            .filter((row) => !["Select"].includes(row.Type))
            .map((row) => normalise(row.Field))
            .concat(excludeCols),
          valueFilter: {},
          rendererName: "Table",
        };
        return (
          <ReactPivotTable
            data={data}
            showUi={false}
            tableProperties={tableProperties}
          />
        );
      default:
        return null;
    }
  };

  const getBelowRecordComponent = (viewName) => {
    switch (viewName) {
      case "Workforce Plan":
      case "Roles Available To Hire":
        return <WorkforcePlanSubRecord data={data} userType={userType} />;
      case "Live CS Vacancies":
        return <OnboardButton formData={data} userType={userType} />;
      case "Contractors Main Database":
        return <CreateExtensionButton formData={data} userType={userType} />;
      default:
        return null;
    }
  };

  const getCustomComponent = (type) => {
    switch (type) {
      case "above_toolbar":
        return getAboveToolbarComponent(Name);
      case "below_toolbar":
        return getBelowToolbarComponent(Name);
      case "below_record":
        return getBelowRecordComponent(Name);
      default:
        return null;
    }
  };

  return <>{getCustomComponent(type)}</>;
}
