import React, { useContext } from "react";
import AppContext from "../../views/AppContext";
import { SummaryList, Accordion } from "../../../govuk";
import { Link } from "react-router-dom";
import linkifyName from "../../functions/linkifyName";

export default function HomePage(props) {
  const { sections, currentUserData, userType } = useContext(AppContext);
  return (
    <>
      <div style={{ marginBottom: "40px" }}>
        <p style={{ marginBottom: "20px" }}>
          This tool allows you to interact with a number of services managed by
          the Strategy & Operations directorate.
        </p>
        <p style={{ marginBottom: "20px" }}>
          The services you have acces to will depend on your permission
          settings.
        </p>
      </div>

      <h3 style={{ marginBottom: "20px" }}>Your Permissions</h3>
      <div
        style={{
          marginBottom: "40px",
          backgroundColor: "#f3f2f1",
          padding: "20px",
          margin: "30px",
        }}
      >
        <SummaryList
          rows={[
            {
              key: {
                children: "User",
              },
              value: {
                children: currentUserData.FullName,
              },
            },
            {
              key: {
                children: "Permission Settings",
              },
              value: {
                children: userType.split("#").join(", "),
              },
            },
          ]}
        />
      </div>
      <h3 style={{ marginBottom: "20px" }}>Your Services</h3>

      <Accordion
        id="default-example"
        items={Object.keys(sections).map((section) => {
          if (["Home"].includes(section)) return null;
          return {
            content: {
              children: [
                <ul>
                  {sections[section].map((view) => {
                    return (
                      <li style={{ marginLeft: "30px" }} key={view.Name}>
                        <Link
                          className="govuk-link"
                          key={view.Name}
                          to={`/${linkifyName(section)}/${linkifyName(
                            view.Name
                          )}`}
                        >
                          <h5 className="browse__title">{view.Name}</h5>
                          {view.Description ? (
                            <p className="browse__description">
                              {view.Description}
                            </p>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>,
              ],
            },
            heading: {
              children: section,
            },
          };
        })}
      />

      {/*Object.keys(sections).map((section) => {
        if (["Home"].includes(section)) return null;
        return (
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ marginLeft: "30px" }}>{section}</h4>
            <ul>
              {sections[section].map((view) => {
                return (
                  //<li style={{ listStyleType: "disc" }}>
                  <li style={{ marginLeft: "60px" }}>
                    <Link
                      className="govuk-link"
                      key={view.Name}
                      to={`/${linkifyName(section)}/${linkifyName(view.Name)}`}
                    >
                      <h5 className="browse__title">{view.Name}</h5>
                      {view.Description ? (
                        <p class="browse__description">{view.Description}</p>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })*/}
    </>
  );
}

//{"FullName":"Bradley Parry","Team":"Central Governance","Community":"Data analysis"}
//{"Section":"Home","Name":"Welcome to the GDS Business Operations Tool","UserTypesWhoCanAccess":"GDS User#Business Manager#SCS","Schemas":"CS Schema","DataSheetName":"Civil Servants","IdentifyingField":"Group","Fields":"All","VisibleFields":"Group","SearchFields":"Group","FilterFields":"Group","SortFields":"Group","DefaultSortDirection":"Asc","IncludeLinkInSideBar":false,"ShowSearchBar":false,"ShowSort":false,"FullWidthView":true,"Active":false,"ActiveInDevelopment":true}
