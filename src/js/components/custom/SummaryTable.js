import React from "react";
import { Table } from "../../../govuk";

//columns = [{name: "Name",}]

export default function SummaryTable(props) {
  const { data, rows, columns, values, aggregation, title } = props;

  const object = data.reduce((object, row) => {
    return object;
  }, {});

  return (
    <Table
      caption={title}
      captionClassName="govuk-heading-m"
      firstCellIsHeader
      head={[
        {
          children: "Month you apply",
        },
        {
          children: "Rate for bicycles",
          format: "numeric",
        },
        {
          children: "Rate for vehicles",
          format: "numeric",
        },
      ]}
      rows={[
        {
          cells: [
            {
              children: "January",
            },
            {
              children: "£85",
              format: "numeric",
            },
            {
              children: "£95",
              format: "numeric",
            },
          ],
        },
        {
          cells: [
            {
              children: "February",
            },
            {
              children: "£75",
              format: "numeric",
            },
            {
              children: "£55",
              format: "numeric",
            },
          ],
        },
        {
          cells: [
            {
              children: "March",
            },
            {
              children: "£165",
              format: "numeric",
            },
            {
              children: "£125",
              format: "numeric",
            },
          ],
        },
      ]}
    />
  );
}
