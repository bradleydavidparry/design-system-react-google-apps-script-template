import React, { useContext, useState, useEffect } from "react";
import AppContext from "../../views/AppContext";
// import OrgChart from "@unicef/react-org-chart";
import ClassComponentOrgChart from "./ClassComponentOrgChart";
import {
  DataList,
  InsetText,
  Hint,
  PhaseBanner,
  Details,
} from "../../../govuk";
import { Link } from "react-router-dom";

function recursiveAddChild(
  object,
  personId,
  lmObject,
  infoObject,
  colourCharacteristic,
  colourObject
) {
  return {
    id: personId,
    person: {
      id: personId,
      department: infoObject[personId].Group,
      avatar: infoObject[personId].ImageURL
        ? infoObject[personId].ImageURL
        : "https://i.stack.imgur.com/dr5qp.jpgs",
      name: infoObject[personId].FullName,
      title: infoObject[personId].JobTitle,
      payband:
        infoObject[personId].OnTDA === "Yes"
          ? `${infoObject[personId].TDAGrade} TDA`
          : infoObject[personId].Payband,
      totalReports: lmObject[personId] ? lmObject[personId].length : 0,
      hasImage: true,
      colour: colourObject[infoObject[personId][colourCharacteristic]],
    },
    hasChild: !!lmObject[personId],
    hasParent: false,
    isHighlight: false,
    hasImage: true,
    children: lmObject[personId]
      ? lmObject[personId].map((childId) =>
          recursiveAddChild(
            object,
            childId,
            lmObject,
            infoObject,
            colourCharacteristic,
            colourObject
          )
        )
      : [],
  };
}

function createTree(
  data,
  currentOrgChartName,
  colourCharacteristic,
  colourObject
) {
  const nameToId = data.reduce((object, person) => {
    object[person.FullName] = person.ID;
    return object;
  }, {});
  const currentOrgChartId = nameToId[currentOrgChartName];
  const infoObject = data.reduce((object, person) => {
    object[person.ID] = person;
    return object;
  }, {});
  const lmObject = data.reduce((object, person) => {
    object[nameToId[person.LM]] ||= [];
    object[nameToId[person.LM]].push(person.ID);
    return object;
  }, {});

  const tree = recursiveAddChild(
    {},
    currentOrgChartId,
    lmObject,
    infoObject,
    colourCharacteristic,
    colourObject
  );

  return tree;
}

function AccessibleOrgChart(props) {
  const { tree } = props;
  // if (tree.children.length === 0)
  //   return (
  //     <>{`${tree.person.name} - ${tree.person.payband} - ${tree.person.title} - ${tree.person.department}`}</>
  //   );
  return (
    <Details
      summaryChildren={`${tree.person.name} - ${tree.person.payband} - ${tree.person.title} - ${tree.person.department}`}
    >
      {tree.children?.map((child, i) => {
        return (
          <AccessibleOrgChart key={`${tree.person.name}${i}`} tree={child} />
        );
      })}
    </Details>
  );
}

export default function GdsOrgChart(props) {
  const { dataObject } = useContext(AppContext);
  const [currentOrgChartName, setCurrentOrgChartName] = useState("Tom Read");
  const [colourCharacteristic, setColourCharacteristic] = useState("Payband");

  const currentlyEmployedCivilServants = dataObject["CS Schema"].data
    .filter(
      (person) =>
        person.CurrentlyEmployed === "Yes" && person.OnLoanSecOut === "No"
    )
    .map((person) => {
      person.LM = person.InternalDataLineManager;
      return person;
    });

  const currentlyContractedContractors = dataObject["Contractors Schema"].data
    .filter((person) => person.CurrentlyContracted === "Yes")
    .map((person) => {
      person.LM = person.LineManagerClient;
      person.Payband = "Contractor";
      return person;
    });

  const allVacancies = dataObject["CS Vacancies Schema"].data
    .filter(
      (person) =>
        person.RequirementFilled === "No" &&
        person.Status !== "D) Role Withdrawn"
    )
    .map((person) => {
      person.LM = person.HiringManagerLineManager;
      person.FullName = person.ID;
      return person;
    });

  const allPeople = [
    ...currentlyEmployedCivilServants,
    ...currentlyContractedContractors,
    ...allVacancies,
  ];

  const colours = [
    "#4e79a7",
    "#f28e2c",
    "#e15759",
    "#76b7b2",
    "#59a14f",
    "#edc949",
    "#af7aa1",
    "#ff9da7",
    "#9c755f",
    "#bab0ab",
    "#fabebe",
  ];

  // const colours = [
  //   "#e6194b",
  //   "#3cb44b",
  //   "#ffe119",
  //   "#4363d8",
  //   "#f58231",
  //   "#911eb4",
  //   "#46f0f0",
  //   "#f032e6",
  //   "#bcf60c",
  //   "#fabebe",
  //   "#008080",
  //   "#e6beff",
  //   "#9a6324",
  //   "#fffac8",
  //   "#800000",
  //   "#aaffc3",
  //   "#808000",
  //   "#ffd8b1",
  //   "#000075",
  //   "#808080",
  // ];

  const colourObject = allPeople
    .reduce((array, row) => {
      !array.includes(row[colourCharacteristic]) &&
        array.push(row[colourCharacteristic]);
      return array;
    }, [])
    .sort()
    .reduce((object, characteristicValue, i) => {
      object[characteristicValue] = colours[i] ? colours[i] : "#efefef";
      return object;
    }, {});

  const [tree, setTree] = useState(
    createTree(
      allPeople,
      currentOrgChartName,
      colourCharacteristic,
      colourObject
    )
  );

  function suggest(query, populateResults) {
    const results = currentlyEmployedCivilServants.map(
      (person) => person.FullName
    );
    const loweCaseQuery = query.toLowerCase();
    const filteredResults = results.filter(
      (result) => result?.toLowerCase().indexOf(loweCaseQuery) !== -1
    );
    populateResults(filteredResults);
  }

  const dataListHandleChange = (value) => {
    setCurrentOrgChartName(value);
  };

  useEffect(() => {
    setTree(
      createTree(
        currentlyEmployedCivilServants,
        currentOrgChartName,
        colourCharacteristic,
        colourObject
      )
    );
  }, [currentOrgChartName]);

  return (
    <>
      <PhaseBanner
        tag={{
          children: "under construction",
        }}
      >
        This feature is a work in progress.
      </PhaseBanner>
      <br />
      <p>
        This org chart currently includes employed civil servants only and is
        generated by the 'Internal Data Line Manager' field which business
        managers can update in the{" "}
        <Link to="/civil-servants/business-manager-view">
          Business Manager View
        </Link>
        .
      </p>
      <InsetText>
        <p>
          This org chart does <strong>not</strong> show the SOP line management
          structure, and updating the 'Internal Data Line Manager' field will{" "}
          <strong>not</strong> update SOP.
        </p>
        <br />
        <p>
          <strong>
            Line managers are responsible for keeping the line management
            structure on SOP accurate, as per Cabinet Office HR policy.
          </strong>
        </p>
      </InsetText>
      <Hint>
        Click on an individual with line reports to expand and collapse them.
        The image and PDF exports might struggle with very large trees.
      </Hint>
      <DataList
        label={{
          children: "Select Person",
        }}
        source={suggest}
        onConfirm={dataListHandleChange}
        displayMenu={"overlay"}
        confirmOnBlur={false}
        value={currentOrgChartName}
        showAllValues={true}
        defaultValue={currentOrgChartName}
      />
      <ClassComponentOrgChart tree={tree} colorObject={colourObject} />
      <div className="govuk-grid-row" style={{ marginTop: "30px" }}>
        <div className="govuk-grid-column-full">
          <h3>Accessible Org Chart</h3>
        </div>
      </div>
      <div className="govuk-grid-row" style={{ marginTop: "30px" }}>
        <div className="govuk-grid-column-full">
          <AccessibleOrgChart tree={tree} />
        </div>
      </div>
    </>
  );
}
