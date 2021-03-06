import { getFirstNameFromGdsEmail } from "./utilities";

function getEmailObject(sheetName, updateObject, record) {
  let emailObject;
  switch (sheetName) {
    case "Contractor Vacancies":
      if (!updateObject.ID) {
        emailObject = {
          template: "Contracting Requirement Submit Message Contracting Team",
          infoObject: {
            ...updateObject,
          },
        };
      }
      if (
        updateObject.ID &&
        updateObject.ContractingTeamApproved === "Approved" &&
        updateObject.FinanceApproved !== "Approved"
      ) {
        emailObject = {
          template: "Contracting Requirement Submit Message Finance Team",
          infoObject: {
            ...updateObject,
          },
        };
      }
      if (updateObject.ID && updateObject.FinanceApproved === "Approved") {
        emailObject = {
          template: "Contracting Requirement Approval Message",
          infoObject: {
            ...updateObject,
            CreatedBy: record.CreatedBy,
            recipientName: getFirstNameFromGdsEmail(record.CreatedBy),
          },
        };
      }
      break;
    case "L&D Requests":
      if (updateObject.ID && updateObject.DirectorApproved === "Approved") {
        emailObject = {
          template: "L&D Approval Message",
          infoObject: {
            ...updateObject,
            CreatedBy: record.CreatedBy,
            recipientName: getFirstNameFromGdsEmail(record.CreatedBy),
          },
        };
      }
      break;
    case "CS Vacancies":
      if (updateObject.ID && updateObject.FinanceApproved === "Approved") {
        emailObject = {
          template: "CS Vacancy Approved Message",
          infoObject: {
            ...updateObject,
            CreatedBy: record.CreatedBy,
            jobTitle: record.JobTitle,
            team: record.Team,
            recipientName: getFirstNameFromGdsEmail(record.CreatedBy),
          },
        };
      }
      if (!updateObject.ID && updateObject.FinanceApproved !== "Approved") {
        emailObject = {
          template: "CS Vacancy Submitted Message",
          infoObject: {
            ...updateObject,
            jobTitle: updateObject.JobTitle,
            team: updateObject.Team,
          },
        };
      }
      break;
    case "R&R Requests":
      if (updateObject.ID && updateObject.DirectorApproved === "Approved") {
        emailObject = {
          template: "R&R Approval Message",
          infoObject: {
            ...updateObject,
            CreatedBy: record.CreatedBy,
            NomineesFullName: record.NomineesFullName,
            recipientName: getFirstNameFromGdsEmail(record.CreatedBy),
          },
        };
      }
      if (updateObject.ID && updateObject.PaperworkProcessed === "Yes") {
        emailObject = {
          template: "R&R Actioned Message",
          infoObject: {
            ...updateObject,
            CreatedBy: record.CreatedBy,
            NomineesFullName: record.NomineesFullName,
            recipientName: getFirstNameFromGdsEmail(record.CreatedBy),
          },
        };
      }
      break;
    default:
      break;
  }
  return emailObject;
}

export default getEmailObject;
