import { networkdays } from "./utilities";

function processFormData(schema, newFormData, viewName, dataObject, lookups) {
  if (schema["Group"]) {
    newFormData.Group = lookups.team[newFormData.Team]
      ? lookups.team[newFormData.Team].group
      : "";
  }
  if (schema["Cost Centre"]) {
    newFormData.CostCentre = lookups.team[newFormData.Team]
      ? lookups.team[newFormData.Team].costCentre
      : "";
  }

  switch (viewName) {
    case "Create New Vacancy":
      if (newFormData.RoleID) {
        newFormData.JobTitle =
          lookups["Workforce Plan Schema"][newFormData.RoleID].JobTitle;
        newFormData.Payband =
          lookups["Workforce Plan Schema"][newFormData.RoleID].Payband;
        newFormData.Group =
          lookups["Workforce Plan Schema"][newFormData.RoleID].Group;
        newFormData.Team =
          lookups["Workforce Plan Schema"][newFormData.RoleID].Team;
      }
      if (newFormData.EmploymentStatusFTAorsFTAOnly) {
        newFormData.EmploymentStatus =
          newFormData.EmploymentStatusFTAorsFTAOnly;
      }
      break;
    case "Request Role Change":
      newFormData.NewGroup = lookups.team[newFormData.NewTeam]
        ? lookups.team[newFormData.NewTeam].group
        : "";
      break;
    case "Onboard Civil Servant":
    case "Add New Civil Servant":
      newFormData.InternalMoves = JSON.stringify({
        0: {
          CC: newFormData.CostCentre,
          Date: 0,
          Capital: "No",
          "Sub Team": lookups.team[newFormData.Team]
            ? lookups.team[newFormData.Team].defaultSubTeam
            : "",
        },
      });

      newFormData.OriginalStartDate = newFormData.ContractStartDate;

      newFormData.TotalAllowances =
        (Number(newFormData.RRAAllowanceAnnual) || 0) +
        (Number(newFormData.MiscellaneousAllowanceAnnual) || 0) +
        (Number(newFormData.DDaTAllowanceAnnual) || 0);

      newFormData.TDAannual = 0;

      if (newFormData.FullNameInternalCandidate) {
        newFormData.FullName = newFormData.FullNameInternalCandidate;

        const selectedCivilServant = dataObject["CS Schema"].data.filter(
          (row) => row.FullName === newFormData.FullNameInternalCandidate
        )[0];

        if (selectedCivilServant) {
          newFormData.InternalMoves = JSON.parse(
            selectedCivilServant.InternalMoves
          );
          const moveIds = Object.keys(newFormData.InternalMoves);
          const moveId = Number(moveIds[moveIds.length - 1]) + 1;
          newFormData.InternalMoves[moveId] = {
            CC: newFormData.CostCentre,
            Date: newFormData.ContractStartDate
              ? formatDateInput(new Date(newFormData.ContractStartDate))
              : "",
            Capital: "No",
            "Sub Team": lookups.team[newFormData.Team]
              ? lookups.team[newFormData.Team].defaultSubTeam
              : "",
          };
          newFormData.InternalMoves = JSON.stringify(newFormData.InternalMoves);
        }

        const csId = selectedCivilServant?.ID;

        newFormData.ID = csId;
        delete newFormData.OriginalStartDate;
      }
      if (newFormData.FullNameExternalCandidate) {
        newFormData.FullName = newFormData.FullNameExternalCandidate;
      }
      break;
    case "Main Database":
    case "RRA":
    case "DDaT":
    case "TDA":
      newFormData.TotalAllowances =
        (Number(newFormData.RRAAllowanceAnnual) || 0) +
        (Number(newFormData.MiscellaneousAllowanceAnnual) || 0) +
        (Number(newFormData.DDaTAllowanceAnnual) || 0) +
        (Number(newFormData.TDAannual) || 0);
      break;
    case "Add New Contractor":
    case "Contractors Main Database":
      newFormData.Days =
        newFormData.ContractStartDate && newFormData.ContractEndDate
          ? networkdays(
              newFormData.ContractStartDate,
              newFormData.ContractEndDate
            )
          : "";
      if (!newFormData.ID) {
        newFormData.TotalPOValue =
          newFormData.Days && newFormData.ChargeRate
            ? newFormData.Days * newFormData.ChargeRate
            : 0;
      }
      break;
    case "Submit New R&R Request":
      const individual = newFormData.NomineesFullName
        ? dataObject["CS Schema"].data.filter(
            (person) => person.FullName === newFormData.NomineesFullName
          )[0]
        : null;
      newFormData.Group = individual ? individual.Group : "";
      newFormData.Team = individual ? individual.Team : "";
      newFormData.JobTitle = individual ? individual.JobTitle : "";
      newFormData.Payband = individual ? individual.Payband : "";

      newFormData.ApprovedVoucherAmount = newFormData.VoucherAmount
        ? newFormData.VoucherAmount
        : "";
      newFormData.ApprovedBonusAmount = newFormData.BonusAmount
        ? newFormData.BonusAmount
        : "";
      break;
    case "Request New Vacancy":
    case "TEMP Create New Vacancy":
      newFormData.JobTitle = newFormData.JobTitleDDaTRole
        ? newFormData.JobTitleDDaTRole
        : newFormData.JobTitleNonDDaTRole;
      break;
    default:
      break;
  }

  return newFormData;
}

export default processFormData;
