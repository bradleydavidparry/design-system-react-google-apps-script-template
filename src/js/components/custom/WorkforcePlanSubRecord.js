import React from "react";
import CreateNewVacancyButton from "./CreateNewVacancyButton";
import RequestWorkforcePlanChange from "./RequestWorkforcePlanChange";

export default function WorkforcePlanSubRecord(props) {
  const { data, userType } = props;

  return (
    <>
      <RequestWorkforcePlanChange formData={data} userType={userType} />
      <br />
      <CreateNewVacancyButton formData={data} userType={userType} />
    </>
  );
}
