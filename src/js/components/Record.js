import React, { useState, useContext, useEffect } from 'react';
import {
    useParams,
    useHistory,
    useLocation,
} from "react-router-dom";
import { 
    Button, 
    Fieldset, 
    ErrorSummary, 
} from '../../govuk/index';
import FormEntry from './FormEntry';
import { normalise } from "../functions/utilities";
import { getSubmitFunction } from '../functions/submitFunctions';
import AppContext from '../views/AppContext';

const getCurrentRecord = (data,recordId,query) => {
    if(recordId === "add_new") return query;
    return data.filter(row => row.ID == recordId)[0];
}

function useQuery() {
    const query = new URLSearchParams(useLocation().search)
    const object = {}
    for(var pair of query.entries()) {
        object[pair[0]] = pair[1];
    }
    return object;
}

export default function Record (props){
    let history = useHistory();
    const { 
        Fields, 
        DataSheetName, 
        includeBackButton, 
        edittingPossible, 
        creatingPossible, 
        Schemas, 
        viewName, 
        includeSideBar 
    } = props;
    const { userType, dataObject, setDataObject, user }  = useContext(AppContext);

    const {data, schema} = dataObject[Schemas.split("#")[0]];

    let query = useQuery();

    let { recordId } = useParams();
    const record = getCurrentRecord(data,recordId,query);
    const [formData, setFormData] = useState({ ...record });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const record = getCurrentRecord(data,recordId,query);
        setFormData({...record})
    },[data,recordId]);
    
    const splitFields = Fields === "All" ? Object.keys(schema).filter(field => field.indexOf("Created At") === -1 && field.indexOf("Created By") === -1 && field.indexOf("Updated At") === -1 && field.indexOf("Updated By") === -1) : Fields.split("#");

    function parseRevealCondition(revealConditionString){
        const [field, listString] = revealConditionString.split("=");
        const parsedList = JSON.parse(listString);
        return [field,parsedList]
    }

    function isRevealConditionMet(revealConditionString) {
        if(!revealConditionString) return true;
        const [field,parsedList] =  parseRevealCondition(revealConditionString);
        return parsedList.includes(formData[normalise(field)]);
    }

    function extractSheetName(DataSheetName,updateObject){
        if(DataSheetName.indexOf("#") === -1) return DataSheetName;
        const [conditionField,conditionsString] = DataSheetName.split("#");
        const conditionObject = conditionsString.split("||").reduce((object,conditionString) => {
            const [valueListString,sheetName] = conditionString.split("=>");
            const listString = JSON.parse(valueListString);
            listString.forEach((value) => {
                object[value] = sheetName;
            })
            return object;
        },{});        
        return conditionObject[updateObject[normalise(conditionField)]];
    }

    const canEditView = (recordId !== "add_new" && edittingPossible) || (recordId === "add_new" && creatingPossible)
    
    const handleBackButtonClick = () => {
        history.goBack();
    }

    const submitFunction = getSubmitFunction(viewName);

    return (
        <div className="govuk-grid-row">
            <div className={includeSideBar ? "govuk-grid-column-two-thirds" : "govuk-grid-column-full"}>
                { includeBackButton ?
                    <a className={"govuk-back-link"} href="#/" onClick={handleBackButtonClick}>Back</a>
                : null }
                <Fieldset>
                    {splitFields.map(fieldName => {
                        const FormEntryProps = {
                            ...schema[fieldName],
                            canEditView,
                            fieldName,
                            userType,
                            formData,
                            setFormData,
                            errors,
                            recordId,
                            schema,
                            dataObject,
                            history,
                            key: fieldName,
                            parseRevealCondition,
                            isRevealConditionMet
                        }
                        return <FormEntry {...FormEntryProps} /> 
                    })}
                    {Object.keys(errors).length > 0 ? 
                        <ErrorSummary
                        errorList={Object.keys(errors).map((error,index) => ({children: Object.values(errors)[index], href: `#${error}` }))}
                        titleChildren="There is a problem"
                        /> : null}
                    {canEditView ? <Button onClick={() => submitFunction(
                        {setSubmitting,
                        splitFields,
                        normalise,
                        schema,
                        formData,
                        isRevealConditionMet, 
                        setErrors, 
                        user, 
                        dataObject, 
                        Schemas, 
                        setDataObject, 
                        extractSheetName, 
                        DataSheetName,
                        record
                        })} disabled={submitting}>{formData.ID ? "Update" : "Create"}</Button> : null }
                </Fieldset>
            </div>
        </div>
    )
}

