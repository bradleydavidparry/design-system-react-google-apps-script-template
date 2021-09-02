import keyBy from 'lodash/keyBy';
import groupBy from 'lodash/groupBy';
//import forEach from 'lodash/forEach';
//import keys from 'lodash/keys';
//import reduce from 'lodash/reduce';
import { normalise } from './utilities';

function extractOptionsFromSchema(value,identifier,data){
    return [""].concat(data.map(row => ({value: row[value], children: row[identifier]})));
}

function extractOptionsFromValidation(validation,columnHeader){
    const normalisedColumnHeader = normalise(columnHeader);
    const options = [""];
    let i = 0;
    while(validation[i][normalisedColumnHeader]){
        options.push(validation[i][normalisedColumnHeader]);
        i++;
    }
    return options;
}

function createLookupObject(validation){
    let i = 0;
    const returnObject = {team: {}};
    while(validation[i]["Cost Centre Name"]){
        returnObject.team[validation[i]["Cost Centre Name"]] = {
            group: validation[i]["Group Name"],
            costCentre: validation[i]["Cost Centre"],
            programme: validation[i]["Programme"]
        }
        i++;
    }
    return returnObject;
}

function processStructureData(object,dict){
    const { views, user, userType, defaultSection, validation } = JSON.parse(object);

    const filteredViews = views.filter(view => userType === "Master" || view["UserTypesWhoCanAccess"].includes(userType));

    let defaultSectionName = defaultSection[0]?.DefaultSection ? dict.linkifyName(defaultSection[0]?.DefaultSection) : null;
    const lookupObject = createLookupObject(validation);

    dict.setSections(groupBy(filteredViews,"Section"));
    dict.setUserType(userType);
    dict.setUser(user);
    dict.setDefaultSection(defaultSectionName);
    dict.setLoading(false);
    dict.setLookups(lookupObject)
}

function processViewData(object,dict) {
    const { dataObject, setDataObject } = dict;
    const parsedObject = JSON.parse(object);
    let { validation } = parsedObject;
    
    delete parsedObject.validation;

    for(let schemaName in parsedObject){
        parsedObject[schemaName].schema = processSchemaData(parsedObject[schemaName].schema,validation);
    }

    const newDataObject = { ...dataObject, ...parsedObject };
    setDataObject(newDataObject)
}

function processSchemaData(schema,validation){
    schema = schema.map(row => {
        if(row.Options?.includes("VAL")){
            row.Options = extractOptionsFromValidation(validation,row.Options.slice(4));
        } else if (row.Options?.includes("SCHEMA")){
            row.OptionsSchema = row.Options
        } else if (row.Options?.includes("SUBTABLE")){
            row.Options = row.Options?.split("#")
        } else {
            row.Options = [""].concat(row.Options?.split("#"));
        }

        if(row.TimeStamp){
            schema.push({Field: `${row.Field} Updated At`, Type: "DateTime"});
            schema.push({Field: `${row.Field} Updated By`, Type: "EmailToName"});
        }

        return row;
    }).concat([{Field: `Created At`, Type: "DateTime"},{Field: `Created By`, Type: "EmailToName"},{Field: `ID`, Type: "Text"}]);

    return keyBy(schema,"Field");
}

function defaultProcessDataAndSchema(dataObject,splitSchemas){
    const defaultSchema = splitSchemas[0];
    for(let schemaName of splitSchemas){
        for(var field in dataObject[schemaName].schema){
            if(dataObject[schemaName].schema[field].OptionsSchema){
                const [sourceSchemaName,value,identifier] = dataObject[schemaName].schema[field].OptionsSchema.split("#").slice(1);
                dataObject[schemaName].schema[field].Options = extractOptionsFromSchema(value,normalise(identifier),dataObject[sourceSchemaName].data);
            }
        }
    }

    return [dataObject[defaultSchema].data,dataObject[defaultSchema].schema];
}

function processDataAndSchema(viewName,dataObject,splitSchemas){
    switch(viewName){
        default:
            return defaultProcessDataAndSchema(dataObject,splitSchemas);
    }
}

export { 
    processStructureData,
    processViewData,
    extractOptionsFromSchema,
    processDataAndSchema
};