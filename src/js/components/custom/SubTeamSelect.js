import React, { useContext } from "react";
import { GroupSelect } from "../../../govuk";
import AppContext from "../../views/AppContext";

export default function SubTeamSelect(props) {
  const { formData, updateFormData } = props;
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
        !["Legacy", "CDIO"].includes(
          ccToTeam[subTeamObject.costCentre].group
        ) && ccToTeam[subTeamObject.costCentre].name === formData.Team
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

  const handleChange = (e) => {
    const { value } = e.target;
    const newFormData = {
      ...formData,
      SubTeamID: value,
      SubTeamName: subTeamObject[value].name,
    };
    updateFormData(newFormData);
  };

  return (
    <GroupSelect
      items={subTeamGroupOptions}
      name={"Sub Team"}
      value={formData.SubTeamID}
      onChange={handleChange}
      label={{
        children: "Sub Team",
      }}
    />
  );
}
