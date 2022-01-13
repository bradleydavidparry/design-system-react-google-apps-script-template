import React from "react";
import { Table } from "../../../govuk";
import { formatMoney } from "../../functions/utilities";
import { checkUserAccess } from "../../functions/utilities";

export default function BudgetTable({ data, budget, type, userType }) {
  const budgetObject = budget.reduce((object, row) => {
    if (["CDDO"].includes(row.Group)) return object;
    object[row.Group] = { budget: row.Budget, approvedSpend: 0 };
    return object;
  }, {});

  data.forEach((row) => {
    if (!["CDDO"].includes(row.Group) && row.DirectorApproved === "Approved") {
      budgetObject[row.Group].approvedSpend +=
        type === "R&R" ? row.AmountApproved : 0;
    }
  });

  if (!checkUserAccess("SCS", userType)) return null;

  return (
    <>
      <Table
        caption="Budget Information"
        captionClassName="govuk-heading-m"
        firstCellIsHeader
        head={[
          {
            children: "Group",
          },
          {
            children: "Budget",
            format: "numeric",
          },
          {
            children: "Approved Spend",
            format: "numeric",
          },
          {
            children: "Budget Remaining",
            format: "numeric",
          },
        ]}
        rows={Object.keys(budgetObject).map((group) => {
          const remaining = Number(
            budgetObject[group].budget - budgetObject[group].approvedSpend
          );
          return {
            cells: [
              {
                children: group,
              },
              {
                children: formatMoney(budgetObject[group].budget, 0),
                format: "numeric",
              },
              {
                children: formatMoney(budgetObject[group].approvedSpend, 0),
                format: "numeric",
              },
              {
                children: formatMoney(remaining, 0),
                format: "numeric",
                style: { color: remaining < 0 ? "red" : "black" },
              },
            ],
          };
        })}
      />
    </>
  );
}
