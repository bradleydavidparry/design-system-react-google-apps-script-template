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
    default:
      break;
  }
  return notificationsObject;
}

export { createNotificationsObject };
