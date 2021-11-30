import React from "react";
import { Button } from "../../../govuk";
import { useHistory } from "react-router-dom";
import { checkUserAccess } from "../../functions/utilities";

export default function CreateNewVacancyButton(props) {
  const { formData, userType } = props;
  const history = useHistory();

  const onboardClick = () => {
    formData.RoleID = formData.ID;
    delete formData.ID;
    let query = new URLSearchParams(formData).toString();
    history.push(`/workforce-plan/create-new-vacancy/add_new?${query}`);
  };

  if (formData.AvailableForCSVacancy === "No") return null;
  if (!checkUserAccess("Business Manager", userType)) return null;
  return (
    <Button onClick={onboardClick} isStartButton>
      Create A Vacancy For This Role
    </Button>
  );
}
