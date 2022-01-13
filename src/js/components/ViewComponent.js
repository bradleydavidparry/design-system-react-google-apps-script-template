import React, { useContext } from "react";
import ReactPivotTable from "./custom/ReactPivotTable";
import OnboardButton from "./custom/OnboardButton";
import OnboardContractorButton from "./custom/OnboardContractorButton";
import CreateExtensionButton from "./custom/CreateExtensionButton";
import WorkforcePlanSubRecord from "./custom/WorkforcePlanSubRecord";
import GdsOrgChart from "./custom/GdsOrgChart";
import BudgetTable from "./custom/BudgetTable";
import OrgDesignOrgChart from "./custom/OrgDesignOrgChart";
import HomePage from "./custom/HomePage";
import { normalise } from "../functions/utilities";
import AppContext from "../views/AppContext";

export default function ViewComponent(props) {
  const { Name, data, schema, type } = props;
  const { userType, dataObject } = useContext(AppContext);
  let excludeCols, schemaValues, tableProperties;

  const getAboveToolbarComponent = (viewName) => {
    switch (viewName) {
      case "Welcome to the GDS Business Operations Tool":
        return <HomePage />;
      case "Org Structure":
        return <OrgDesignOrgChart />;
      case "GDS":
        return <GdsOrgChart />;
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
      case "Contractors Analysis":
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
          rows: ["Group", "Team"],
          cols: [],
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
      case "Contractor Recruitment Analysis":
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
          rows: ["Group", "Team"],
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
      case "CS Vacancy Analysis":
        excludeCols = [
          "ID",
          "Created At",
          "Created By",
          "UpdatedBy",
          "UpdatedAt",
        ];
        schemaValues = Object.values(schema);
        tableProperties = {
          rows: ["Group", "Team"],
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
            showUi={true}
            tableProperties={tableProperties}
          />
        );
      case "Recruitment Plan":
        const dataWithStartMonthAdded = data.map((row) => {
          const dateForAdvertToGoLive = new Date(row.Dateforadverttogolive);
          const dateStringList = dateForAdvertToGoLive
            .toDateString()
            .split(" ");
          row.GoingLiveMonth = `${dateStringList[1]} ${dateStringList[3]}`;
          return row;
        });
        excludeCols = [
          "ID",
          "Created At",
          "Created By",
          "UpdatedBy",
          "UpdatedAt",
        ];
        schemaValues = Object.values(schema);

        tableProperties = {
          rows: ["Group"],
          cols: ["GoingLiveMonth"],
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
          rendererName: "Table",
          sorters: {
            GoingLiveMonth: (a, b) =>
              new Date(a).getTime() === new Date(b).getTime()
                ? 0
                : new Date(a).getTime() > new Date(b).getTime()
                ? 1
                : -1,
          },
          valueFilter: {
            RequirementFilled: { Yes: true },
            Status: { "D) Role Withdrawn": true },
          },
        };

        const secondTableProps = { ...tableProperties, rows: ["JobFamily"] };

        return (
          <>
            <ReactPivotTable
              data={dataWithStartMonthAdded}
              showUi={false}
              tableProperties={tableProperties}
            />
            <ReactPivotTable
              data={dataWithStartMonthAdded}
              showUi={false}
              tableProperties={secondTableProps}
            />
          </>
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
            Active: { No: true },
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
      case "Diversity Pivot":
        excludeCols = [];
        schemaValues = Object.values(schema);
        tableProperties = {
          rows: [],
          cols: [],
          aggregatorName: "Count",
          vals: [],
          unusedOrientationCutoff: Infinity,
          hiddenFromAggregators: [],
          hiddenFromDragDrop: [],
          valueFilter: { SiP: { N: true } },
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
      case "R&R Pending Approval":
        const { budget, data: rAndRData } = dataObject["R&R Schema"];
        return (
          <BudgetTable
            type={"R&R"}
            budget={budget}
            data={rAndRData}
            userType={userType}
          />
        );
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
      case "All Contracting Requirements":
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
          rows: ["Group"],
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
      case "Vetting and Onboarding":
        return <OnboardButton formData={data} userType={userType} />;
      case "All Contracting Requirements":
      case "Contracting Review":
      case "Approvals":
      case "Recruitment and Procurement":
      case "Onboarding":
        return <OnboardContractorButton formData={data} userType={userType} />;
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
