import React from "react";
import { Button } from "../../../govuk";
import { useHistory } from "react-router-dom";
import { checkUserAccess } from "../../functions/utilities";

export default function RequestWorkforcePlanChange(props) {
  const { formData, userType } = props;
  const history = useHistory();

  const requestChangeClick = () => {
    formData.RoleID = formData.ID;
    formData.NewGroup = formData.Group;
    formData.NewTeam = formData.Team;
    formData.NewPayband = formData.Payband;
    formData.NewReportsTo = formData.ReportsTo;
    delete formData.ID;
    let query = new URLSearchParams(formData).toString();
    history.push(`/workforce-plan/request-role-change/add_new?${query}`);
  };

  if (formData.AvailableForCSVacancy === "No") return null;
  if (!checkUserAccess("Business Manager", userType)) return null;
  return <Button onClick={requestChangeClick}>Request change to role</Button>;
}
