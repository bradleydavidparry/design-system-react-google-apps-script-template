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
    formData.LineManager = formData.HiringManagerLineManager;
    let query = new URLSearchParams(formData).toString();
    history.push(`/recruitment/onboard-civil-servant/add_new?${query}`);
  };

  if (
    !checkUserAccess("People Team", userType) ||
    ![
      "S) Ready To Onboard",
      "O) Offer Accepted",
      "Q) Paycase Approval",
      "R) Vetting In Progress",
      "T) In Post",
    ].includes(formData.Status)
  )
    return null;
  return <Button onClick={onboardClick}>Onboard Vacancy</Button>;
}
