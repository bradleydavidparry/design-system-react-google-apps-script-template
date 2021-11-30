import React from "react";
import { Button } from "../../../govuk";
import { useHistory } from "react-router-dom";
import { checkUserAccess } from "../../functions/utilities";

export default function RequestExtensionButton(props) {
  const { formData, userType } = props;
  const history = useHistory();

  const requestExtensionContracting = () => {
    let extensionData = { ...formData };
    delete extensionData.ID;
    delete extensionData.ContractStartDate;
    delete extensionData.ContractEndDate;
    extensionData.ContractStatus = "Extension";
    let query = new URLSearchParams(extensionData).toString();
    history.push(`/recruitment/request-contractor-extension/add_new?${query}`);
  };

  const requestExtensionBusinessManager = () => {
    let extensionData = { ...formData };
    delete extensionData.ID;
    delete extensionData.ContractStartDate;
    delete extensionData.ContractEndDate;
    extensionData.ContractStatus = "Extension";
    let query = new URLSearchParams(extensionData).toString();
    history.push(`/contractors/request-contractor-extension/add_new?${query}`);
  };

  if (checkUserAccess("Business Manager", userType) || formData.ID)
    return (
      <Button onClick={requestExtensionBusinessManager}>
        Request Extension Business Manager
      </Button>
    );
  if (checkUserAccess("Contracting Team", userType) || formData.ID)
    return (
      <Button onClick={requestExtensionContracting}>
        Request Extension Contracting Team
      </Button>
    );
}
