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
                "N) Offers",
                "O) Offer Accepted",
                "Q) Paycase Approval",
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
