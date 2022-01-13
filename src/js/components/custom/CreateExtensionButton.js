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
    extensionData.ContractStatus = "Extension";
    extensionData.ContigentWorkerContractorName = extensionData.FullName;
    let query = new URLSearchParams(extensionData).toString();
    history.push(
      `/contractors/create-new-contractor-requirement/add_new?${query}`
    );
  };

  if (formData.CurrentlyEmployed === "No" || !formData.ID) return null;
  if (checkUserAccess("Business Manager", userType))
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
