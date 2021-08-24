import React, { useState, useContext, useEffect } from 'react';
import {
    useParams,
    Link,
    useHistory,
    useLocation,
} from "react-router-dom";
import { 
    Button, 
    Input, 
    Fieldset, 
    Textarea, 
    Select, 
    Radios, 
    DateInput, 
    Checkboxes, 
    ErrorSummary, 
    Table, 
    Label,
    InsetText
} from '../../govuk/index';
import { normalise, formatDateTime } from "../functions/utilities";
import { formatValue } from '../functions/formatValue';
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
    const { Fields, DataSheetName, includeBackButton, edittingPossible, creatingPossible, Schemas } = props;
    const { userType, dataObject, setDataObject, user }  = useContext(AppContext);

    const {data, schema} = dataObject[Schemas];

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
    
    const splitFields = Fields === "All" ? Object.keys(schema) : Fields.split("#");

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData };
        newFormData[name] = value;
        setFormData(newFormData)
    }

    const handleCheckboxChange = (e,fieldName) => {
        const { value } = e.target;
        const newFormData = { ...formData };
        newFormData[fieldName] = value;
        setFormData(newFormData)
    }

    const handleDateChange = (e,fieldName) => {
        const { name, value } = e.target;
        const period = name.replace(`${fieldName}-`);

        const valueList = [
            document.getElementById(`${fieldName}-year`).value,
            document.getElementById(`${fieldName}-month`).value,
            document.getElementById(`${fieldName}-day`).value
        ];
        
        const periodList = ['year','month','day'];

        valueList[periodList.indexOf(period)] = value;

        const newFormData = { ...formData };

        newFormData[fieldName] = valueList.every(period => period) ?  new Date(valueList.join("-")).toLocaleDateString() : '';
        setFormData(newFormData);
    }

    const submit = () => {
        setSubmitting(true);
        
        const newErrors = {};

        splitFields.forEach(field => {
            var normalisedFieldName = normalise(field)
            if(schema[field].Required && !["Record List","Comment"].includes(schema[field].Type) && !formData[normalisedFieldName] && isRevealConditionMet(schema[field].RevealCondition)){
                newErrors[normalisedFieldName] = `Please enter a value for ${field}`;
            }
        });

        setErrors(newErrors);
        
        if(Object.keys(newErrors).length > 0){
            setSubmitting(false);
        } else {
            const updateObject = {...formData}
            const updateTime = formatDateTime(new Date());

            for(let field in schema){
                let normalisedFieldName = normalise(field)
                if(schema[field].DefaultValue && !updateObject[normalisedFieldName]){
                    updateObject[normalisedFieldName] = schema[field].DefaultValue;
                }
                if(schema[field].TimeStamp && updateObject[normalisedFieldName] !== record[normalisedFieldName]){
                    updateObject[`${normalisedFieldName}UpdatedAt`] = updateTime;
                    updateObject[`${normalisedFieldName}UpdatedBy`] = user;
                }
            }

            if(!updateObject.ID){
                updateObject.CreatedBy = user;
                updateObject.CreatedAt = updateTime;
            }

            updateObject.UpdatedBy = user;
            updateObject.UpdatedAt = updateTime;

            const sheetName = extractSheetName(DataSheetName,updateObject);

            google.script.run.withSuccessHandler((id) => {
                const newDataObject = { ...dataObject };
                newDataObject[Schemas].data = newDataObject[Schemas].data.filter(row => row.ID != id);
                const newRecord = {...formData, ID: id}
                newDataObject[Schemas].data.push(newRecord);
                //if(recordId === "add_new") setFormData({});
                setDataObject(newDataObject);
                setSubmitting(false);
            }).withFailureHandler((err) => {
                console.log(err);
            }).updateData({sheetName, updateObject});
        }
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

    const canEditView = (recordId !== "add_new" && edittingPossible) || (recordId === "add_new" && creatingPossible)
    
    const handleBackButtonClick = () => {
        history.goBack();
    }

    return (
        <>
            { includeBackButton ?
                <a className={"govuk-back-link"} href="#/" onClick={handleBackButtonClick}>Back</a>
            : null }
            <Fieldset>
                {splitFields.map(fieldName => {
                    const { Type, Hint: hint, Options, Update, Create, RevealCondition } = schema[fieldName];
                    const normalisedFieldName = normalise(fieldName);

                    const revealConditionMet = RevealCondition ? isRevealConditionMet(RevealCondition) : true;

                    if(canEditView && ((recordId !== "add_new" && Update?.includes(userType)) || (recordId === "add_new" && Create?.includes(userType)))){
                        if(revealConditionMet){
                            switch(Type){
                                case "Comment":
                                    return <h3 key={fieldName} style={{marginBottom: "15px"}}>{fieldName}</h3>
                                case "Text":
                                    return (
                                        <Input
                                            id={normalisedFieldName}
                                            hint={hint ? {children: hint} : null}
                                            label={{
                                                children: fieldName
                                            }}
                                            name={normalisedFieldName}
                                            key={fieldName}
                                            type="text"
                                            value={formData[normalisedFieldName]}
                                            onChange={handleChange}
                                            errorMessage={errors[normalisedFieldName] ? ({children: "This is a required field"}) : null}
                                            />
                                    )
                                case "Number":
                                    return (
                                        <Input
                                            id={normalisedFieldName}
                                            hint={hint ? {children: hint} : null}
                                            label={{
                                                children: fieldName
                                            }}
                                            name={normalisedFieldName}
                                            key={fieldName}
                                            type="number"
                                            value={formData[normalisedFieldName]}
                                            onChange={handleChange}
                                            errorMessage={errors[normalisedFieldName] ? ({children: "This is a required field"}) : null}
                                            />
                                        )
                                case "Currency":
                                    return (
                                        <Input
                                            id={normalisedFieldName}
                                            hint={hint ? {children: hint} : null}
                                            label={{
                                                children: fieldName
                                            }}
                                            name={normalisedFieldName}
                                            key={fieldName}
                                            type="number"
                                            prefix={{
                                                children: '£'
                                            }}
                                            value={formData[normalisedFieldName]}
                                            onChange={handleChange}
                                            errorMessage={errors[normalisedFieldName] ? ({children: "This is a required field"}) : null}
                                            />
                                        )
                                case "Text Area":
                                    return (
                                        <Textarea
                                            id={normalisedFieldName}
                                            hint={hint ? {children: hint} : null}
                                            label={{
                                                children: fieldName
                                            }}
                                            name={normalisedFieldName}
                                            key={fieldName}
                                            value={formData[normalisedFieldName]}
                                            onChange={handleChange}
                                            errorMessage={errors[normalisedFieldName] ? ({children: "This is a required field"}) : null}
                                            />
                                    )
                                case "Select":
                                    return (
                                        <Select
                                            id={normalisedFieldName}
                                            errorMessage={errors[normalisedFieldName] ? ({children: "This is a required field"}) : null}
                                            hint={hint ? {children: hint} : null}
                                            items={Options.map(option => option.children ? option : ({children: option, value: option }))}
                                            label={{
                                                children: fieldName
                                            }}
                                            value={formData[normalisedFieldName]}
                                            onChange={handleChange}
                                            name={normalisedFieldName}
                                            key={fieldName}
                                            />
                                    )
                                case "Radio":
                                    return (
                                        <Radios
                                            id={normalisedFieldName}
                                            fieldset={{
                                                legend: {
                                                children: fieldName
                                                }
                                            }}
                                            formGroup={{
                                                className: 'govuk-radios--small'
                                            }}
                                            items={Options.map(option => ({children: option, value: option }))}
                                            name={normalisedFieldName}
                                            value={formData[normalisedFieldName]}
                                            onChange={handleChange}
                                            key={fieldName}
                                            errorMessage={errors[normalisedFieldName] ? ({children: "This is a required field"}) : null}
                                            />
                                    )
                                case "Checkbox":
                                    return (
                                        <Checkboxes
                                            id={normalisedFieldName}
                                            fieldset={{
                                                legend: {
                                                children: fieldName
                                                }
                                            }}
                                            hint={hint ? {children: hint} : null}
                                            items={Options.map(option => ({
                                                children: option, 
                                                value: option,
                                                name: option,
                                                checked: formData[normalisedFieldName] === option
                                            }))}
                                            name={normalisedFieldName}
                                            onChange={(e) => handleCheckboxChange(e,normalisedFieldName)}
                                            errorMessage={errors[normalisedFieldName] ? ({children: "This is a required field"}) : null}
                                            />
                                    )
                                case "Date":
                                    const date = formData[normalisedFieldName] ? new Date(formData[normalisedFieldName]) : "";
                                    const [day,month,year] = date ? [date.getDate(),date.getMonth() + 1,date.getFullYear()] : ['','',''];
                                    return (
                                        <DateInput
                                            fieldset={{
                                                legend: {
                                                children: fieldName
                                                }
                                            }}
                                            hint={hint ? {children: hint} : null}
                                            namePrefix={normalisedFieldName}
                                            id={normalisedFieldName}
                                            day={day}
                                            month={month}
                                            year={year}
                                            onChange={(e) => handleDateChange(e,normalisedFieldName)}
                                            errorMessage={errors[normalisedFieldName] ? ({children: "This is a required field"}) : null}
                                            />
                                    )
                                case "Record List":
                                    if(recordId === "add_new") return null;
                                    const optionsString = schema[fieldName].Options;
                                    const [schemaName, filterColumn, path , create, createPath, ...fields] = optionsString.slice(1);
                                    const normalisedFilterColumn = normalise(filterColumn);
                                    const listData = dataObject[schemaName].data.filter(row => row[normalisedFilterColumn] == recordId);
                                    
                                    const onClickSubTableButton = () => {
                                        history.push(`${createPath}?${normalisedFilterColumn}=${formData.ID}`);
                                    }

                                    return (
                                        <div className="govuk-form-group">
                                            {listData.length === 0 ? <Label>{fieldName}</Label> : null}
                                            {listData.length > 0 ? 
                                                <Table
                                                    firstCellIsHeader
                                                    caption={fieldName}
                                                    captionClassName="govuk-heading-m"
                                                    head={fields.concat(["",""]).map((heading) => { return { children: heading }}) }
                                                    rows={listData.map(row => (
                                                            { cells: fields.map(heading => (
                                                                {children: formatValue(row[normalise(heading)],dataObject[schemaName].schema[heading].Type)}
                                                                )).concat({children: (
                                                                <Link className={"govuk-link"} to={`${path}${row.ID}`} >
                                                                    View
                                                                </Link>)})
                                                            }))
                                                        }
                                                    />
                                             : null}
                                            {create === "Create" ? 
                                                <Button onClick={onClickSubTableButton}>Create New {fieldName.substring(0, fieldName.length - 1)}</Button>
                                            : null}
                                        </div>
                                    );
                                default:
                                    return (
                                        <Input
                                            id={normalisedFieldName}
                                            hint={hint ? {children: hint} : null}
                                            label={{
                                                children: fieldName
                                            }}
                                            name={normalisedFieldName}
                                            key={fieldName}
                                            type="text"
                                            value={formData[normalisedFieldName]}
                                            onChange={handleChange}
                                            errorMessage={errors[normalisedFieldName] ? ({children: "This is a required field"}) : null}
                                            />
                                    )
                            }
                        }
                    } else {
                        if(!formData[normalisedFieldName]) return null;
                        return (
                            <div className="govuk-form-group">
                                <Label>{fieldName}</Label>
                                <p id="FullName" name="FullName">{formatValue(formData[normalisedFieldName],schema[fieldName].Type)}</p>
                            </div>
                        )
                    }
                })}
                
                {Object.keys(errors).length > 0 ? 
                    <ErrorSummary
                    errorList={Object.keys(errors).map((error,index) => ({children: Object.values(errors)[index], href: `#${error}` }))}
                    titleChildren="There is a problem"
                    /> : null}
                {canEditView ? <Button onClick={submit} disabled={submitting}>{formData.ID ? "Update" : "Create"}</Button> : null }
            </Fieldset>
        </>
    )
}

