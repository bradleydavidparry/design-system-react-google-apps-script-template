import { formatDateTime } from "./utilities";

const submit = (inputs) => {
    const {
        setSubmitting,
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
    } = inputs;

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
            const splitSchemas = Schemas.split("#");
            const newDataObject = { ...dataObject };
            newDataObject[splitSchemas[0]].data = newDataObject[splitSchemas[0]].data.filter(row => row.ID != id);
            const newRecord = {...formData, ID: id}
            newDataObject[splitSchemas[0]].data.push(newRecord);
            //if(recordId === "add_new") setFormData({});
            setDataObject(newDataObject);
            setSubmitting(false);
        }).withFailureHandler((err) => {
            console.log(err);
        }).updateData({sheetName, updateObject});
    }
}

function getSubmitFunction(viewName){
    switch(viewName){
        default:
            return submit;
    }
}


export {
    getSubmitFunction
}