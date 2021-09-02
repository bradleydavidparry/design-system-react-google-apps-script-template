import React from 'react';
import {Fieldset, Input, Select, Button} from '../../govuk/index';
import { useRouteMatch, useHistory } from "react-router-dom";
import { normalise } from '../functions/utilities';

function Toolbar(props){
    const {
        FilterFields,
        SortFields,
        filterObject,
        setFilterObject,
        data,
        Name,
        create,
    } = props;
    
    let history = useHistory();
    let match = useRouteMatch();

    const handleSearchBarChange = (e) => {
        const newFilterObject = { ...filterObject }
        newFilterObject["Search Bar"] = e.target.value;
        setFilterObject(newFilterObject);
    }

    const handleFilterChange = (e) => {
        const { value, name } = e.target;
        const newFilterObject = { ...filterObject }
        if(value === "All"){
            delete newFilterObject.filters[name];
        } else {
            newFilterObject.filters[name] = value;
        }
        setFilterObject(newFilterObject);
    }

    const handleSortChange = (e) => {
        const newFilterObject = { ...filterObject }
        newFilterObject.sort.field = e.target.value;
        setFilterObject(newFilterObject);
    }

    const handleSortDirChange = (e) => {
        const newFilterObject = { ...filterObject }
        newFilterObject.sort.dir = e.target.value;
        setFilterObject(newFilterObject);
    }

    const handleCreateNewClick = () => {
        history.push(`${match.url}/add_new`);
    }

    const splitFilterFields = FilterFields ? FilterFields.split("#") : [];
    const splitSortFields = SortFields ? SortFields.split("#"): [];

    return (
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-full" style={{backgroundColor: "#f3f2f1"}}>
                {create ? <div className="govuk-grid-row" style={{paddingTop: "15px"}}>
                    <div className="govuk-grid-column-full">
                        <Button onClick={handleCreateNewClick} isStartButton>Create New</Button>
                    </div>
                </div> : null}
                <div className="govuk-grid-row" style={{paddingTop: "15px"}}>
                    <div className="govuk-grid-column-full">
                        <Fieldset legend={{children: `${Name} Filters & Search`}}>
                            <div className="govuk-grid-row">
                                {splitFilterFields.map(filterField => {
                                    const normalisedName = normalise(filterField);
                                    return (
                                        <div className="govuk-grid-column-one-half" key={normalisedName}>
                                            <Select
                                                items={["All", ...new Set(data.map(row => row[normalisedName]))].map(value => ({children: value, value}))}
                                                label={{
                                                    children: filterField
                                                }}
                                                name={normalisedName}
                                                onChange={handleFilterChange}
                                                className="govuk-!-width-full"
                                                value={filterObject.filters[normalisedName] ? filterObject.filters[normalisedName] : "All" }
                                                />
                                        </div>
                                    )})
                                }
                            </div>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-full">
                                    <Input
                                        label={{ children: 'Search Bar' }}
                                        name="search-bar"
                                        type="search"
                                        value={filterObject["Search Bar"]}
                                        onChange={handleSearchBarChange}
                                        />
                                </div>
                            </div>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-one-half">
                                    <Select
                                        items={splitSortFields.map(value => ({children: value, value: value.replace(/\s+/g,"")}))}
                                        label={{
                                            children: "Sort By"
                                        }}
                                        name="SortField"
                                        onChange={handleSortChange}
                                        className="govuk-!-width-full"
                                        value={filterObject.sort.field ? filterObject.sort.field : ""}
                                        />
                                </div>
                                <div className="govuk-grid-column-one-half">
                                    <Select
                                        items={[{children: "Ascending", value: 1},{children: "Descending", value: -1}]}
                                        label={{
                                            children: "Sort Direction"
                                        }}
                                        name="SortDir"
                                        onChange={handleSortDirChange}
                                        className="govuk-!-width-full"
                                        value={filterObject.sort.dir}
                                        />
                                </div>
                            </div>
                        </Fieldset>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Toolbar;