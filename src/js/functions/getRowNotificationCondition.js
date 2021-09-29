function getRowNotificationCondition(viewName) {
  switch (viewName) {
    case "New Starters":
      return {
        include: { SOPSessionAttended: ["No"] },
        exclude: { Payband: ["Faststream"] },
      };
    case "Leavers":
      return {
        include: { DatesenttoSharedservices: [""] },
        exclude: { LastDateofService: [""] },
      };
    default:
      return null;
  }
}

function checkHighlightConditionMet(row, highlightConditionObject) {
  return (
    highlightConditionObject &&
    Object.keys(highlightConditionObject.include).every((key) =>
      highlightConditionObject.include[key].includes(row[key])
    ) &&
    Object.keys(highlightConditionObject.exclude).every(
      (key) => !highlightConditionObject.exclude[key].includes(row[key])
    )
  );
}

export { getRowNotificationCondition, checkHighlightConditionMet };
