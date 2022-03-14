import React from "react";
import { Button } from "../../../govuk";
import { useHistory } from "react-router-dom";
import { checkUserAccess } from "../../functions/utilities";

export default function CreateExtensionButton(props) {
  const { formData, userType } = props;
  const history = useHistory();

  const requestExtensionContracting = () => {
    let extensionData = { ...formData };
    delete extensionData.ID;
    delete extensionData.ContractStartDate;
    delete extensionData.ContractEndDate;
    extensionData.ContractStatus = "Extension";
    let query = new URLSearchParams(extensionData).toString();
    history.push(
      `/cw-&-contractors/add-new-contingent-worker-or-contractor/add_new?${query}`
    );
  };

  const requestExtensionBusinessManager = () => {
    let extensionData = { ...formData };
    delete extensionData.ID;
    delete extensionData.BusinessCaseLink;
    delete extensionData.BusinessPlanStartDate;
    delete extensionData.BusinessPlanEndDate;
    extensionData.NeworExtension = "Extension";
    extensionData.ContingentWorkerContractorName = extensionData.FullName;
    extensionData.JobTitleNonDDaTRole = extensionData.JobTitle;
    extensionData.JobTitleDDaTRole = extensionData.JobTitle;

    let query = new URLSearchParams(extensionData).toString();
    history.push(
      `/contracting-requirements/create-new-contracting-requirement/add_new?${query}`
    );
  };

  if (formData.CurrentlyContracted === "No" || !formData.ID) return null;
  console.log(userType);
  if (checkUserAccess("Business Manager#GDS User", userType))
    return (
      <Button onClick={requestExtensionBusinessManager}>
        Request Extension Business Manager
      </Button>
    );
  if (checkUserAccess("Contracting Team", userType))
    return (
      <Button onClick={requestExtensionContracting}>
        Create Extension Contracting Team
      </Button>
    );
  return null;
}
