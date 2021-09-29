import React from "react";
import {
  formatDate,
  formatMoney,
  formatDateTime,
  emailToName,
} from "./utilities";
import FormatRag from "../components/custom/FormatRag";

export default function FormatValue(props) {
  const { input, type, heading } = props;

  const getFormattedValue = () => {
    //custom formats
    switch (heading) {
      case "RAG Rating":
        return <FormatRag input={input} />;
      default:
        break;
    }
    //end custom formats

    if (!input) return <></>;
    switch (type) {
      case "Currency":
        return formatMoney(input, 0);
      case "Date":
        return formatDate(input);
      case "DateTime":
        return formatDateTime(input);
      case "Checkbox":
        return input.split("#").join(", ");
      case "EmailToName":
        return emailToName(input);
      default:
        return input;
    }
  };

  return <>{getFormattedValue()}</>;
}
