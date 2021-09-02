import React, { useContext, useState, useEffect } from 'react';
import { Table } from '../../govuk/index';
import Toolbar from './Toolbar';
import Record from './Record';
import ViewComponent from './ViewComponent';
//import Record from './Record';
import ErrorBoundary from './ErrorBoundary';
import {
    Switch,
    Route,
    Link,
    useRouteMatch,
    Redirect
  } from "react-router-dom";
import { normalise } from '../functions/utilities';
import { formatValue } from '../functions/formatValue';
import { processViewData, extractOptionsFromSchema, processDataAndSchema } from '../functions/dataProcessing'; 
import AppContext from '../views/AppContext';

function createViewFilterObject(inputString){
    if(!inputString) return {};
    return inputString.split("#").reduce((object,substring) => {
        if(substring.includes("!=")){
            const [field,listString] = substring.split("!=");
            object.exclude[normalise(field)] = JSON.parse(listString);
        } else {
            const [field,listString] = substring.split("=");
            object.include[normalise(field)] = JSON.parse(listString);
        }
        return object;
    },{include: {}, exclude: {}})
}

function View(props){
    const {
        Name,
        Schemas,
        Fields,
        VisibleFields,
        FilterFields,
        SortFields,
        IdentifyingField,
        DataSheetName,
        CreateUserTypes,
        IndexUserTypes,
        EditUserTypes,
        ViewFilter,
        IncludeLinkInSideBar,
        includeSideBar,
    } = props;
    
    let match = useRouteMatch();
    const { userType, filterObject, setFilterObject }  = useContext(AppContext);
    const { dataObject, setDataObject }  = useContext(AppContext);

    const [ viewLoading, setViewLoading ] = useState(true);
    
    const [data, setData] = useState([]);
    const [schema, setSchema] = useState({});

    useEffect(() => {
        const splitSchemas = Schemas.split("#");
        const schemasToFetch = splitSchemas.filter(schemaName => !dataObject[schemaName]);
        if(schemasToFetch.length > 0){
            google.script.run
                .withSuccessHandler(processViewData)
                .withUserObject({ dataObject, setDataObject })
                .getViewData(schemasToFetch);
        }
    },[dataObject,setDataObject,Schemas]);

    useEffect(() => {
        const splitSchemas = Schemas.split("#");
        if(splitSchemas.every(schemaName => dataObject[schemaName])){
            
            const [processedData, processedSchema] = processDataAndSchema(Name,dataObject,splitSchemas)
            
            setData(processedData);
            setSchema(processedSchema);

            setViewLoading(false);
        }
    },[dataObject,setData,setSchema,Schemas]);

    const headings = VisibleFields?.split("#");

    const filterFieldsList = FilterFields?.split("#").map(field => normalise(field));
    const sortFieldsList = SortFields?.split("#")

    const viewFilterObject = createViewFilterObject(ViewFilter);
    
    const filteredAndSortedData = data.filter(row => {
        for(var searchField in filterObject.filters){
            if(filterFieldsList.includes(searchField) && row[searchField] !== filterObject.filters[searchField]) return false;
        }
        
        for(let filterField in viewFilterObject.include){
            if(!viewFilterObject.include[filterField].includes(row[filterField])) return false;
        }

        for(let filterField in viewFilterObject.exclude){
            if(viewFilterObject.exclude[filterField].includes(row[filterField])) return false;
        }

        if(!filterObject["Search Bar"]) return true;
        const searchTerms = filterObject["Search Bar"].toLocaleLowerCase().split(" ")
        const rowValueString = Object.values(row).join(" ").toLocaleLowerCase();
        return searchTerms.every(term => rowValueString.includes(term));
    }).sort((a,b) => {
        let {field, dir} = filterObject.sort;
        field =!sortFieldsList.includes(field) ? normalise(SortFields.split("#")[0]) : field;
        return a[field] === b[field] ? 0 : a[field] > b[field] ? dir : dir * -1;
    });

    const includeIndexPage = IndexUserTypes?.includes(userType);
    const edittingPossible = EditUserTypes?.includes(userType);
    const creatingPossible = CreateUserTypes?.includes(userType);

    const toolbarProps = {
        FilterFields,
        SortFields,
        filterObject,
        setFilterObject,
        data,
        create: CreateUserTypes?.includes(userType),
        Name
    }
    
    if(viewLoading) return <h2>Loading</h2>
    return (
        <>
            <h2>{Name}</h2>
            <ErrorBoundary>
                <Switch>
                    <Route path={`${match.path}/:recordId`}>
                        <Record 
                            Fields={Fields} 
                            DataSheetName={DataSheetName} 
                            includeBackButton={includeIndexPage || !IncludeLinkInSideBar}
                            edittingPossible={edittingPossible}
                            creatingPossible={creatingPossible}
                            Schemas={Schemas}
                            viewName={Name}
                            includeSideBar={includeSideBar}
                            />
                    </Route>
                    <Route path={`${match.path}`}>
                        {includeIndexPage ? (
                            <>
                                <Toolbar {...toolbarProps} />
                                <ViewComponent Name={Name} data={filteredAndSortedData} />
                                <Table
                                    firstCellIsHeader
                                    caption={"Filter and search results"}
                                    captionClassName="govuk-heading-s"
                                    head={headings.concat(["",""]).map((heading) => { return { children: heading }}) }
                                    rows={filteredAndSortedData.map(row => (
                                            { cells: headings.map(heading => (
                                                {children: formatValue(row[normalise(heading)],schema[heading].Type)}
                                                )).concat({children: (
                                                <Link className={"govuk-link"} to={`${match.url}/${row.ID}`} >
                                                    View<span className="govuk-visually-hidden"> {row[normalise(IdentifyingField)]}</span>
                                                </Link>)})
                                            }))
                                        }
                                    />
                            </> ) :
                            <Redirect to={`${match.path}/add_new`} />
                        }
                    </Route>
                </Switch>
            </ErrorBoundary>
        </>
    )
}


export default View;