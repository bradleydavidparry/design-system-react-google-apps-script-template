import React, { useContext, useState } from "react";
import { Select, Label, Button, Hint, GroupSelect } from "../../../govuk";
import AppContext from "../../views/AppContext";
import { formatDate, formatDateInput } from "../../functions/utilities";

const InternalMovesRow = (props) => {
  const {
    CC,
    "Sub Team": subTeam,
    Date: date,
    Capital,
    selectOptions,
    move,
    formData,
    updateFormData,
    ccToTeam,
    subTeamObject,
  } = props;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData };
    const newInternalMoves = JSON.parse(newFormData.InternalMoves);

    // newInternalMoves[move][name] = value;
    // newInternalMoves[move]["Sub Team"] = ccToTeam[newInternalMoves[move]["CC"]]
    //   ? ccToTeam[newInternalMoves[move]["CC"]].defaultSubTeam
    //   : "";

    switch (name) {
      case "Capital":
        newInternalMoves[move][name] = value;
        break;
      default:
        newInternalMoves[move][name] = value;
        newInternalMoves[move]["CC"] = ccToTeam[subTeamObject[value].costCentre]
          ? ccToTeam[subTeamObject[value].costCentre].costCentre
          : "";
        break;
    }

    newFormData.InternalMoves = JSON.stringify(newInternalMoves);
    updateFormData(newFormData);
  };

  const deleteMove = () => {
    const newFormData = { ...formData };
    const newInternalMoves = JSON.parse(newFormData.InternalMoves);
    delete newInternalMoves[move];
    newFormData.InternalMoves = JSON.stringify(newInternalMoves);
    updateFormData(newFormData);
  };

  return (
    <div
      className={"govuk-grid-row"}
      style={{
        backgroundColor: "#cccccc",
        borderRadius: "10px",
        paddingTop: "5px",
        paddingBottom: "5px",
        marginBottom: "15px",
      }}
    >
      <div className="govuk-grid-column-full">
        <div className={"govuk-grid-row"}>
          <div className="govuk-grid-column-one-third">
            <Label>Date</Label>
            {formatDate(new Date(date))}
          </div>
          <div className="govuk-grid-column-two-thirds">
            <GroupSelect
              items={selectOptions}
              value={subTeam}
              onChange={handleChange}
              name={"Sub Team"}
              label={{
                children: "Sub Team",
              }}
            />
          </div>
        </div>
        <div className={"govuk-grid-row"}>
          <div className="govuk-grid-column-two-thirds">
            <Select
              name={"Capital"}
              items={[
                { value: "No", children: "No" },
                { value: "Yes", children: "Yes" },
              ]}
              value={Capital}
              onChange={handleChange}
              label={{
                children: "Capital",
              }}
            />
          </div>
          <div className="govuk-grid-column-one-third">
            {move === "0" ? null : (
              <Button className="govuk-button--secondary" onClick={deleteMove}>
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AddNewRow = (props) => {
  const {
    selectOptions,
    minDate,
    formData,
    updateFormData,
    ccToTeam,
    subTeamObject,
  } = props;

  const [addMoveObject, setAddMoveObject] = useState({
    CC: "",
    Date: "",
    Capital: "No",
    "Sub Team": "",
  });

  const addMove = () => {
    const newFormData = { ...formData };
    const newInternalMoves = JSON.parse(newFormData.InternalMoves);
    const nextMove = Number(Object.keys(newInternalMoves).at(-1)) + 1;
    newInternalMoves[nextMove] = addMoveObject;
    newFormData.InternalMoves = JSON.stringify(newInternalMoves);
    updateFormData(newFormData);
    setAddMoveObject({
      CC: "",
      Date: "",
      Capital: "No",
      "Sub Team": "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newAddMoveObject = { ...addMoveObject };

    // newAddMoveObject[name] = value;
    // newAddMoveObject["Sub Team"] = ccToTeam[newAddMoveObject["CC"]]
    //   ? ccToTeam[newAddMoveObject["CC"]].defaultSubTeam
    //   : "";

    switch (name) {
      case "Capital":
        newAddMoveObject[name] = value;
        break;
      case "Date":
        newAddMoveObject[name] = value;
        break;
      default:
        newAddMoveObject[name] = value;
        newAddMoveObject["CC"] = ccToTeam[subTeamObject[value].costCentre]
          ? ccToTeam[subTeamObject[value].costCentre].costCentre
          : "";
    }

    setAddMoveObject(newAddMoveObject);
  };

  return (
    <div
      className={"govuk-grid-row"}
      style={{
        backgroundColor: "#d9ead3",
        borderRadius: "10px",
        paddingTop: "5px",
        paddingBottom: "5px",
        marginBottom: "15px",
      }}
    >
      <div className="govuk-grid-column-full">
        <div className={"govuk-grid-row"}>
          <div className="govuk-grid-column-one-third">
            <Label>Date</Label>
            <input
              type="date"
              className={"govuk-input"}
              name={"Date"}
              min={minDate}
              value={addMoveObject.Date}
              onChange={handleChange}
            />
          </div>
          <div className="govuk-grid-column-two-thirds">
            <GroupSelect
              items={selectOptions}
              name={"Sub Team"}
              value={addMoveObject["Sub Team"]}
              onChange={handleChange}
              label={{
                children: "Sub Team",
              }}
            />
          </div>
        </div>
        <div className={"govuk-grid-row"}>
          <div className="govuk-grid-column-two-thirds">
            <Select
              name={"Capital"}
              items={[
                { value: "No", children: "No" },
                { value: "Yes", children: "Yes" },
              ]}
              value={addMoveObject.Capital}
              onChange={handleChange}
              label={{
                children: "Capital",
              }}
            />
          </div>
          <div className="govuk-grid-column-one-third">
            <Button
              onClick={addMove}
              disabled={!addMoveObject["Sub Team"] || !addMoveObject.Date}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function InternalMoves(props) {
  const { internalMovesString, formData, updateFormData } = props;
  const {
    lookups: { ccToTeam, subTeamObject },
  } = useContext(AppContext);

  const subTeamOptions = Object.values(subTeamObject)
    .map((subTeamObject) => {
      return {
        value: subTeamObject.id,
        children: subTeamObject.name,
        costCentre: subTeamObject.costCentre,
      };
    })
    .filter(
      (subTeamObject) =>
        !["Legacy", "CDIO"].includes(ccToTeam[subTeamObject.costCentre].group)
    )
    .sort((a, b) =>
      ccToTeam[a.costCentre].team === ccToTeam[b.costCentre].team
        ? 0
        : ccToTeam[a.costCentre].team > ccToTeam[b.costCentre].team
        ? 1
        : -1
    )
    .sort((a, b) =>
      ccToTeam[a.costCentre].group === ccToTeam[b.costCentre].group
        ? 0
        : ccToTeam[a.costCentre].group > ccToTeam[b.costCentre].group
        ? -1
        : 1
    );

  const subTeamGroupOptions = subTeamOptions.reduce((object, option) => {
    object[
      `${ccToTeam[option.costCentre].group} - ${
        ccToTeam[option.costCentre].name
      }`
    ] ||= [];
    object[
      `${ccToTeam[option.costCentre].group} - ${
        ccToTeam[option.costCentre].name
      }`
    ].push(option);
    return object;
  }, {});

  const parsedInternalMoves = JSON.parse(internalMovesString);
  const minDate = formatDateInput(
    new Date(Object.values(parsedInternalMoves).at(-1).Date)
  );

  return (
    <div>
      <Label>Internal Moves</Label>
      <Hint>
        Remember to click the update button at the bottom of the screen after
        you have made changes
      </Hint>
      <div
        className="govuk-grid-column-one-third"
        style={{ width: "20%" }}
      ></div>
      {Object.keys(parsedInternalMoves).map((move) => (
        <InternalMovesRow
          key={move}
          move={move}
          {...parsedInternalMoves[move]}
          selectOptions={subTeamGroupOptions}
          formData={formData}
          updateFormData={updateFormData}
          ccToTeam={ccToTeam}
          subTeamObject={subTeamObject}
        />
      ))}
      <AddNewRow
        ccToTeam={ccToTeam}
        selectOptions={subTeamGroupOptions}
        minDate={minDate}
        formData={formData}
        updateFormData={updateFormData}
        subTeamObject={subTeamObject}
      />
    </div>
  );
}
