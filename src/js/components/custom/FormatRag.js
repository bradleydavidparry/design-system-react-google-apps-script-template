import React from "react";
import { Tag } from "../../../govuk/index";

export default function FormatRag(props) {
  const { input } = props;

  let className;

  switch (input) {
    case "Green":
      className = "govuk-tag--green";
      break;
    case "Amber / Green":
      className = "govuk-tag--yellow";
      break;
    case "Amber":
      className = "govuk-tag--orange";
      break;
    case "Red / Amber":
      className = "govuk-tag--orange";
      break;
    case "Red":
      className = "govuk-tag--red";
      break;
    default:
      className = "govuk-tag--grey";
      break;
  }

  return <Tag className={className}>{input}</Tag>;
}
