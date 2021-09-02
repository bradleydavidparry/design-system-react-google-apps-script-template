import React from 'react';
import {
    Link,
} from "react-router-dom";
import { 
    Button, 
    Input, 
    Textarea, 
    Select, 
    Radios, 
    DateInput, 
    Checkboxes, 
    Table, 
    Label,
    DataList
} from '../../govuk/index';
import { formatValue } from '../functions/formatValue';
import { normalise } from "../functions/utilities";
import Autocomplete from 'accessible-autocomplete/react';
import '../../css/autocomplete.css';

export default function FormEntry (props){
    const { 
        Type, 
        Hint: hint, 
        Options, 
        Update, 
        Create, 
        RevealCondition, 
        canEditView, 
        fieldName, 
        formData, 
        setFormData, 
        userType, 
        errors, 
        recordId,
        schema,
        dataObject,
        history,
        isRevealConditionMet
    } = props;

    const normalisedFieldName = normalise(fieldName);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData };
        newFormData[name] = value;
        setFormData(newFormData)
    }

    const handleCheckboxChange = (e,fieldName) => {
        const { value, checked } = e.target;
        const newFormData = { ...formData };
        let selectionsList = newFormData[fieldName] ? newFormData[fieldName].split("#") : [];
        if(checked){
            selectionsList.push(value);
        } else {
            selectionsList.splice(selectionsList.indexOf(value), 1);
        }
        newFormData[fieldName] = selectionsList.join("#");
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

    const revealConditionMet = RevealCondition ? isRevealConditionMet(RevealCondition) : true;

    const returnFormEntry = () => {
        if(canEditView && ((recordId !== "add_new" && (userType === "Master" || Update?.includes(userType))) || (recordId === "add_new" && (userType === "Master" || Create?.includes(userType))))){
            if(revealConditionMet){
                switch(Type){
                    case "HTML":
                        return <div dangerouslySetInnerHTML={{__html: fieldName}}></div>
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
                    case "Data List":
                        function suggest (query, populateResults) {
                            const results = Options.map(option => option.children ? option.children : option);
                            const loweCaseQuery = query.toLowerCase();
                            const filteredResults = results.filter(result => result.toLowerCase().indexOf(loweCaseQuery) !== -1)
                            populateResults(filteredResults)
                        }

                        const dataListHandleChange = (value) => {
                            const name = normalisedFieldName;
                            handleChange({target: {value, name}});
                        }
                        
                        return (
                            <div className="govuk-form-group">
                                <Label>{fieldName}</Label>
                                <Autocomplete 
                                    id={normalisedFieldName} 
                                    source={suggest} 
                                    onConfirm={dataListHandleChange} 
                                    name={normalisedFieldName} 
                                    displayMenu={'overlay'} 
                                    confirmOnBlur={false} 
                                    defaultValue={formData[normalisedFieldName]} 
                                    showAllValues={true} />
                            </div>
                        )
                        // return (
                        //     <DataList
                        //         id={normalisedFieldName}
                        //         hint={hint ? {children: hint} : null}
                        //         label={{
                        //             children: fieldName
                        //         }}
                        //         name={normalisedFieldName}
                        //         key={fieldName}
                        //         type="text"
                        //         value={formData[normalisedFieldName]}
                        //         onChange={handleChange}
                        //         errorMessage={errors[normalisedFieldName] ? ({children: "This is a required field"}) : null}
                        //         items={Options.map(option => option.children ? option : ({children: option, value: option }))}
                        //         />
                        // )
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
                                    checked: formData[normalisedFieldName] ? formData[normalisedFieldName].split("#").includes(option) : false
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
    }
    
    

    
    return (
        <>{returnFormEntry()}</>
    );
}