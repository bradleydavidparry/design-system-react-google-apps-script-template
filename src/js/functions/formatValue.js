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

    if (!input && input !== 0) return <></>;
    switch (type) {
      case "Number":
        return Number(input).toFixed(2);
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
      case "Link":
        if (input.indexOf("http") === -1) return <span>No link provided</span>;
        return (
          <a href={input} rel="noreferrer" target={"_blank"}>
            Link
          </a>
        );
      default:
        return input;
    }
  };

  return <>{getFormattedValue()}</>;
}
