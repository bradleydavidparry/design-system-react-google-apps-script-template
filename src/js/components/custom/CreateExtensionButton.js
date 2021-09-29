import React from "react";
import { Button } from "../../../govuk";
import { useHistory } from "react-router-dom";
import { checkUserAccess } from "../../functions/utilities";

export default function CreateExtensionButton(props) {
  const { formData, userType } = props;
  const history = useHistory();

  const createExtensionClick = () => {
    let query = new URLSearchParams(formData).toString();
    history.push(`/contractors/add-new-contractor/add_new?${query}`);
  };

  if (!checkUserAccess("Contracting Team", userType)) return null;
  return <Button onClick={createExtensionClick}>Create Extension</Button>;
}
