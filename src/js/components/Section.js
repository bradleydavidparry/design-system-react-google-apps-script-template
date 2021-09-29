import React, { useEffect, useContext, useState } from "react";
import { Switch, Route, Redirect, useLocation, Link } from "react-router-dom";
import linkifyName from "../functions/linkifyName";
import View from "./View";
import AppContext from "../views/AppContext";
import { Tag } from "../../govuk";
import { createNotificationsObject } from "../functions/notifications";

export default function Section(props) {
  const { name, views } = props;
  const location = useLocation();
  const { setPageTitle, dataObject } = useContext(AppContext);
  const [notificationsObject, setnotificationsObject] = useState({});
  const [fullWidthView, setFullWidthView] = useState(true);

  useEffect(() => {
    setPageTitle(name);
  }, [setPageTitle, name]);

  useEffect(() => {
    setFullWidthView(views.length === 1);
  }, [views, setFullWidthView]);

  useEffect(() => {
    const newNotificationsObject = createNotificationsObject(name, dataObject);
    setnotificationsObject(newNotificationsObject);
  }, [dataObject]);

  const extraViewProps = {
    fullWidthView,
    setFullWidthView,
    includeBackButtonOnIndex: views.length > 1 && fullWidthView,
  };

  const removeBorderStyle = { style: {} };

  if (fullWidthView) {
    removeBorderStyle.style.border = "none";
  }

  return (
    <div className="browse">
      <div
        className="browse-panes section"
        data-state="section"
        data-module="gem-track-click"
        aria-busy="false"
      >
        <div
          id="section"
          className="section-pane pane with-sort"
          style={{ margin: "0px", width: fullWidthView ? "100%" : "75%" }}
        >
          <div className="pane-inner curated" {...removeBorderStyle}>
            <Switch>
              <Route
                exact
                path={`/${linkifyName(name)}/`}
                render={() => (
                  <Redirect
                    to={`${linkifyName(name)}/${linkifyName(views[0].Name)}`}
                  />
                )}
              />
              {views.map((view) => (
                <Route
                  key={view.Name}
                  path={`/${linkifyName(name)}/${linkifyName(view.Name)}`}
                >
                  <View {...view} {...extraViewProps} />
                </Route>
              ))}
            </Switch>
          </div>
        </div>
        {!fullWidthView ? (
          <div id="root" className="pane root-pane">
            <h2 className="govuk-visually-hidden">Browse views in {name}</h2>
            <ul>
              {views.map((view) =>
                view.IncludeLinkInSideBar ? (
                  <li
                    key={view.Name}
                    className={
                      location.pathname.includes(
                        `/${linkifyName(name)}/${linkifyName(view.Name)}`
                      )
                        ? "active"
                        : ""
                    }
                  >
                    <Link
                      className="govuk-link"
                      key={view.Name}
                      to={`/${linkifyName(name)}/${linkifyName(view.Name)}`}
                    >
                      {view.Name}
                      {notificationsObject[view.Name] ? (
                        <Tag
                          className="govuk-tag--red"
                          style={{ marginLeft: "10px", borderRadius: "15px" }}
                        >
                          {notificationsObject[view.Name]}
                          <span className="govuk-visually-hidden">
                            {" "}
                            notifications
                          </span>
                        </Tag>
                      ) : null}
                    </Link>
                  </li>
                ) : null
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
