function createNotificationsObject(sectionName, dataObject) {
  let notificationsObject = {};
  switch (sectionName) {
    case "Workforce Plan":
      if (dataObject["Workforce Plan Changes Schema"]) {
        notificationsObject = dataObject[
          "Workforce Plan Changes Schema"
        ].data.reduce(
          (object, row) => {
            if (row.ApprovalStatus === "For Review") {
              object["Requested Changes"] += 1;
            }
            return object;
          },
          { "Requested Changes": 0 }
        );
      }
      break;

    case "Contracting Requirements":
      if (dataObject["Contractor Vacancies Schema"]) {
        notificationsObject = dataObject[
          "Contractor Vacancies Schema"
        ].data.reduce(
          (object, row) => {
            if (row.ContractingTeamApproved === "For Review") {
              object[
                "Contracting Requirements For Contracting Team Review"
              ] += 1;
            }
            if (
              row.ContractingTeamApproved === "Approved" &&
              row.FinanceApproved === "For Review"
            ) {
              object["Contracting Requirements For Finance Review"] += 1;
            }
            if (row.Status === "1 - Contracting Review") {
              object["Planning"] += 1;
            }
            if (row.Status === "2 - Approvals") {
              object["CO Approvals"] += 1;
            }
            if (row.Status === "3 - Recruitment/Procurement") {
              object["Recruitment and Procurement"] += 1;
            }
            if (row.Status === "4 - Onboarding") {
              object["Onboarding"] += 1;
            }
            if (row.Status === "5 - Complete") {
              object["Complete"] += 1;
            }
            if (row.Status === "6 - On Hold") {
              object["On Hold"] += 1;
            }
            if (row.Status === "7 - Cancelled") {
              object["Cancelled"] += 1;
            }
            if (!["7 - Cancelled", "5 - Complete"].includes(row.Status)) {
              object["All Contracting Requirements"] += 1;
            }
            return object;
          },
          {
            "Contracting Requirements For Contracting Team Review": 0,
            "Contracting Requirements For Finance Review": 0,
            "CO Approvals": 0,
            Planning: 0,
            "Recruitment and Procurement": 0,
            Onboarding: 0,
            Complete: 0,
            "On Hold": 0,
            Cancelled: 0,
            "All Contracting Requirements": 0,
          }
        );
      }
      break;

    case "Civil Servants":
      if (dataObject["CS Schema"]) {
        notificationsObject = dataObject["CS Schema"].data.reduce(
          (object, row) => {
            if (row.LastDateofService && !row.DatesenttoSharedservices) {
              object["Leavers"] += 1;
            }
            if (
              row.SOPSessionAttended === "No" &&
              row.Payband !== "Faststream"
            ) {
              object["New Starters"] += 1;
            }
            return object;
          },
          { Leavers: 0, "New Starters": 0 }
        );
      }
      break;
    case "Recruitment":
      if (dataObject["CS Vacancies Schema"]) {
        notificationsObject = dataObject["CS Vacancies Schema"].data.reduce(
          (object, row) => {
            if (
              row.RequirementFilled === "No" &&
              row.FinanceApproved === "Approved" &&
              row.Recruiter === "Unassigned"
            ) {
              object["Live CS Vacancies"] += 1;
            }
            if (row.FinanceApproved === "For Review") {
              object["Vacancies For Approval"] += 1;
            }
            if (
              row.RequirementFilled === "No" &&
              [
                "S) Ready To Onboard",
                "O) Offer Accepted",
                "R) Vetting In Progress",
              ].includes(row.Status)
            ) {
              object["Vetting and Onboarding"] += 1;
            }
            return object;
          },
          {
            "Live CS Vacancies": 0,
            "Vetting and Onboarding": 0,
            "Vacancies For Approval": 0,
          }
        );
      }
      break;
    case "Reward & Recognition":
      if (dataObject["R&R Schema"]) {
        notificationsObject = dataObject["R&R Schema"].data.reduce(
          (object, row) => {
            object["R&R Pending Approval"] +=
              row.DirectorApproved === "For Review" ? 1 : 0;
            object["R&R Ready For Processing"] +=
              row.DirectorApproved === "Approved" &&
              row.PaperworkProcessed === "No"
                ? 1
                : 0;
            return object;
          },
          { "R&R Pending Approval": 0, "R&R Ready For Processing": 0 }
        );
      }
      break;
    default:
      break;
  }
  return notificationsObject;
}

export { createNotificationsObject };
