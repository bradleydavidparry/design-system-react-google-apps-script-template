import React, { useState, useEffect } from "react";
import AppContext from './js/views/AppContext';
import processData from './js/functions/dataProcessing';
import { Template } from './govuk/index';

function App(){
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null)

    const value = {
        data: {
            value: data, 
            updateFunction: setData
        },
        loading
    }
    
    useEffect(() => {
      google.script.run
          .withSuccessHandler(processData)
          .withUserObject(
            {
              setData,
              setLoading
            }
          )
          .getData();
    },[]);
    
    const templateProps = {
      title: 'Web App Title',
      strapline: 'Description of the application',
      header: {},
      footer: {},
      beforeContent: ''
    }

    return ( <AppContext.Provider value={value}>
              <Template {...templateProps}>
               Content
              </Template>
             </AppContext.Provider>
            );
  }

export default App;