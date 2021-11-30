import React from "react";
import { InsetText, SummaryList } from "../../govuk";

export default function HtmlTemplates(props) {
  const { fieldName } = props;

  switch (fieldName) {
    case "Short Term Need Descriptions":
      return (
        <>
          <SummaryList
            rows={[
              {
                key: {
                  children: "Fixed / Short-Term Appointment (Civil Servant)",
                },
                value: {
                  children: `Civil Servants appointed through Civil Servant recruitment on fixed
            term contracts through a fair and open recruitment process.
            Short-term staff can also be appointed as Civil Servants directly by
            exception through the Recruitment Team.`,
                },
              },
              {
                key: {
                  children: "Contingent Worker (Interim or Temp)",
                },
                value: {
                  children: `Procured and recruited through the Contracting Team. Can be used to
            fill vacant roles quicker while Civil Servants are recruited if
            there is an urgent need or to fill a role that is only required on a
            short term basis. These can be managed like Civil Servants and can
            sit within and/or lead your team(s).`,
                },
              },
              {
                key: {
                  children: "Contractor (Contractors and Consultants)",
                },
                value: {
                  children: `Procured through the Contracting Team for specific project work that
            is short or fixed term. A contractor will provide their services as
            a small business and operate more independently to fulfil your
            requirement. They are set specific deliverables to achieve via a
            statement of work, which you ask them to complete by agreed end
            dates.`,
                },
              },
            ]}
          />
        </>
      );
    case "Contractor Business Case Description":
      return (
        <>
          <h3>Contractor Business Case</h3>
          <InsetText>
            Please make a copy of{" "}
            <a
              href="https://docs.google.com/document/d/1ETRj5qcabB5Ra7KQhEKkrilKkuCHH2hA/edit"
              rel="noreferrer"
              target="_blank"
            >
              this business case
            </a>{" "}
            and complete it for submission in the next question.
          </InsetText>
          <br />
        </>
      );
    case "Civil Servant Business Case Description":
      return (
        <>
          <h3>Civil Servant Business Case</h3>
          <br />
        </>
      );
    default:
      return <div>Template needs adding in the code.</div>;
  }
}
