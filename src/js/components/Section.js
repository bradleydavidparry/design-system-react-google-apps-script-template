import React, { useEffect, useContext, useState } from 'react';
import {
    Switch,
    Route,
    Redirect,
    useLocation,
    Link
  } from "react-router-dom";
import linkifyName from '../functions/linkifyName';
import View from './View';
import AppContext from '../views/AppContext';
import { Tag } from '../../govuk';

export default function Section(props){
    const {name, views} = props;
    const location = useLocation();
    const { setPageTitle } = useContext(AppContext);

    useEffect(() => {
        setPageTitle(name);
    },[setPageTitle,name]);
    
    const [notificationsObject, setnotificationsObject] = useState({});

    return (
        <div className="browse">
            <div className="browse-panes section" data-state="section" data-module="gem-track-click" aria-busy="false">
                <div id="section" className="section-pane pane with-sort" style={{margin: "0px", width: views.length > 1 ? "75%" : "100%"}}>
                    <div className="pane-inner curated">
                        <Switch>
                            <Route exact path={`/${linkifyName(name)}/`} render={() =>  <Redirect to={`${linkifyName(name)}/${linkifyName(views[0].Name)}`} />} />
                            { views.map(view => (
                                <Route key={view.Name} path={`/${linkifyName(name)}/${linkifyName(view.Name)}`}>
                                    <View {...view} />
                                </Route>)) }
                        </Switch>
                    </div>
                </div>
                { views.length > 1 ? 
                    <div id="root" className="pane root-pane">
                        <h2 className="govuk-visually-hidden">Browse views in {name}</h2>
                        <ul>
                            { views.map(view => view.IncludeLinkInSideBar ? (
                                <li key={view.Name} className={location.pathname.includes(`/${linkifyName(name)}/${linkifyName(view.Name)}`) ? "active" : ""}>
                                    <Link className="govuk-link" key={view.Name} to={`/${linkifyName(name)}/${linkifyName(view.Name)}`}>
                                        {view.Name}
                                        {notificationsObject[view.Name] ? 
                                        <Tag className="govuk-tag--red" style={{marginLeft: "10px", borderRadius: "15px"}}>
                                            {notificationsObject[view.Name]}<span className="govuk-visually-hidden"> notifications</span>
                                        </Tag> : null }
                                    </Link>
                                </li>): null) 
                            }
                        </ul>
                    </div>
                : null}
            </div>
        </div>
    )
}

