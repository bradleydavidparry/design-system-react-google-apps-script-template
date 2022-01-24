import React, { useContext, useState, useEffect } from "react";
import AppContext from "../../views/AppContext";
// import OrgChart from "@unicef/react-org-chart";
import ClassComponentOrgChart from "./ClassComponentOrgChart";
import { DataList, Select } from "../../../govuk";
import { normalise } from "../../functions/utilities";

function recursiveAddChild(
  object,
  personId,
  lmObject,
  infoObject,
  colourCharacteristic,
  colourObject,
  heirachyField
) {
  return {
    id: personId,
    heirachyField,
    person: {
      id: personId,
      department: infoObject[personId].Group,
      avatar: infoObject[personId].ImageURL
        ? infoObject[personId].ImageURL
        : "https://i.stack.imgur.com/dr5qp.jpgs",
      name: infoObject[personId].FullName,
      title: infoObject[personId].JobTitle,
      payband: infoObject[personId].Payband,
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
  colourObject,
  heirachyField
) {
  const normalisedHeirarchyField = normalise(heirachyField);

  const modifiedData = data.map((row) => {
    row.NewSubTeam ||= row.SubTeam;
    row.NewLineManager ||= row.InternalDataLineManager;
    row.ActivityManager ||= row.InternalDataLineManager;
    return row;
  });

  const nameToId = modifiedData.reduce((object, person) => {
    object[person.FullName] = person.ID;
    return object;
  }, {});
  const currentOrgChartId = nameToId[currentOrgChartName];
  const infoObject = modifiedData.reduce((object, person) => {
    object[person.ID] = person;
    return object;
  }, {});
  const lmObject = modifiedData.reduce((object, person) => {
    object[nameToId[person[normalisedHeirarchyField]]] ||= [];
    object[nameToId[person[normalisedHeirarchyField]]].push(person.ID);
    return object;
  }, {});

  const tree = recursiveAddChild(
    {},
    currentOrgChartId,
    lmObject,
    infoObject,
    colourCharacteristic,
    colourObject,
    heirachyField
  );

  return tree;
}

export default function OrgDesignOrgChart(props) {
  const { dataObject } = useContext(AppContext);
  const [currentOrgChartName, setCurrentOrgChartName] = useState("Tom Read");
  const [colourCharacteristic, setColourCharacteristic] = useState("Payband");
  const [hierarchyField, setHierarchyField] = useState("New Line Manager");

  const currentlyEmployedCivilServants = dataObject["Org Design Schema"].data;
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
  ];

  const colourObject = currentlyEmployedCivilServants
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
      currentlyEmployedCivilServants,
      currentOrgChartName,
      colourCharacteristic,
      colourObject,
      hierarchyField
    )
  );

  function suggest(query, populateResults) {
    const results = currentlyEmployedCivilServants.map(
      (person) => person.FullName
    );
    const loweCaseQuery = query.toLowerCase();
    const filteredResults = results.filter((result) => {
      return result?.toLowerCase().indexOf(loweCaseQuery) !== -1;
    });
    populateResults(filteredResults);
  }

  const dataListHandleChange = (value) => {
    setCurrentOrgChartName(value);
  };

  const handleHierarchyChange = (e) => {
    const { value } = e.target;
    setHierarchyField(value);
  };

  useEffect(() => {
    setTree(
      createTree(
        currentlyEmployedCivilServants,
        currentOrgChartName,
        colourCharacteristic,
        colourObject,
        hierarchyField
      )
    );
  }, [currentOrgChartName, hierarchyField]);

  return (
    <>
      <Select
        items={[
          {
            children: "New Line Manager",
            value: "New Line Manager",
          },
          {
            children: "Activity Manager",
            value: "Activity Manager",
          },
        ]}
        label={{
          children: "Hierarchy select",
        }}
        value={hierarchyField}
        onChange={handleHierarchyChange}
      />
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
    </>
  );
}
