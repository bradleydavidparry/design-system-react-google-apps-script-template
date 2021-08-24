import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import AppContext from './js/views/AppContext';
import processStructureData from './js/functions/dataProcessing';
import linkifyName from './js/functions/linkifyName';
import { Template } from './govuk/index';
import Section from './js/components/Section';

function App(){
    const [loading, setLoading] = useState(true);
    const [userType,setUserType] = useState(null);
    const [user,setUser] = useState(null);
    const [sections,setSections] = useState([]);
    const [defaultSection, setDefaultSection] = useState(null);
    const [pageTitle, setPageTitle] = useState("");
    const [dataObject, setDataObject] = useState([]);
    const [filterObject, setFilterObject] = useState({filters: {}, "Search Bar": "", sort: {field: null, dir: 1}});
    
    const value = {
      dataObject,
      setDataObject,
      sections,
      userType,
      setPageTitle,
      loading,
      filterObject,
      setFilterObject,
      user
    }
    
    useEffect(() => {
      google.script.run
          .withSuccessHandler(processStructureData)
          .withUserObject(
            {
              setDataObject,
              setSections,
              setUserType,
              linkifyName,
              setDefaultSection,
              setUser,
              setLoading
            }
          )
          .getStructureData();
    },[]);
    
    const templateProps = {
      title: loading ? "Fetching data" : pageTitle,
      strapline: '',
      header: {
        serviceName:"Web App Title",
        sections
      },
      footer: {},
      beforeContent: ''
    }
    
    return ( <AppContext.Provider value={value}>
              <Router>
                <Template {...templateProps}>
                  <Switch>
                    <Route exact path="/" render={() =>  <Redirect to={`${defaultSection}`} />} />
                    {Object.keys(sections).map(section => (
                      <Route key={section} path={`/${linkifyName(section)}`}>
                        <Section views={sections[section]} name={section} />
                      </Route>))}
                  </Switch>
                </Template>
              </Router>
             </AppContext.Provider>
            );
  }

export default App;