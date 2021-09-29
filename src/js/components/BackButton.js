import React from "react";
import { useHistory } from "react-router-dom";

export default function BackButton(props) {
  let history = useHistory();
  const handleBackButtonClick = () => {
    history.goBack();
  };
  return (
    <button
      className={"govuk-back-link back-button"}
      href="#"
      onClick={handleBackButtonClick}
    >
      Back
    </button>
  );
}
