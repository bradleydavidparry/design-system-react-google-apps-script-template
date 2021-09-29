import React from "react";
import { Button } from "../../../govuk";
import { useHistory } from "react-router-dom";
import { checkUserAccess } from "../../functions/utilities";

export default function OnboardButton(props) {
  const { formData, userType } = props;
  const history = useHistory();

  const onboardClick = () => {
    formData.VacancyID = formData.ID;
    delete formData.ID;
    let query = new URLSearchParams(formData).toString();
    history.push(`/recruitment/onboard-civil-servant/add_new?${query}`);
  };

  if (!checkUserAccess("Recruitment Team", userType)) return null;
  return <Button onClick={onboardClick}>Onboard Vacancy</Button>;
}
