import React from "react";
import { Button } from "../../../govuk";
import { useHistory } from "react-router-dom";
import { checkUserAccess } from "../../functions/utilities";

export default function OnboardContractorButton(props) {
  const { formData, userType } = props;
  const history = useHistory();

  const onboardClick = () => {
    formData.VacancyID = formData.ID;
    formData.FullName = formData.ContingentWorkerContractorName ||= "";

    formData.LineManagerClient = formData.ManagerRequestorName ||= "";
    formData.ContractStatus = formData.NeworExtension ||= "";

    formData.Linktocontractorbusinesscasedocument =
      formData.BusinessCaseLink ||= "";

    formData.Email = formData.ContingentWorkerContractorEmailAddress ||= "";

    formData.ContractLength = formData.LengthofContractRequest ||= "";

    formData.IR35Status = formData.IR35AssessmentOutcome ||= "";

    formData.StatusDeterminationStatusLink = formData.SDSLink ||= "";
    formData.InterimJDorStatementofWorkLink = formData.SoWInterimJD ||= "";

    formData.ContractStartDate = formData.ExtensionorStartDate;
    formData.ContractEndDate = formData.EndDate;

    formData.CurrentlyEmployed =
      new Date() > new Date(formData.ExtensionorStartDate) &&
      new Date() < new Date(formData.EndDate)
        ? "Yes"
        : "No";

    formData.POStatus =
      new Date() < new Date(formData.ExtensionorStartDate) ? "Pending" : "Open";

    formData.CompanyName = formData.CompanyNameIfOutsideIR35;

    delete formData.ID;
    formData.LineManager = formData.HiringManagerLineManager ||= "";
    let query = new URLSearchParams(formData).toString();
    history.push(
      `/cw-&-contractors/add-new-contingent-worker-or-contractor/add_new?${query}`
    );
  };

  if (!checkUserAccess("Contracting Team", userType)) return null;
  return <Button onClick={onboardClick}>Onboard Vacancy</Button>;
}
