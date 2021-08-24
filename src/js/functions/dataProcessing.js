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

function processStructureData(d,dict){
    const { dataObject, views, user, userType, defaultSection, validation } = JSON.parse(d);

    const filteredViews = views.filter(view => view["UserTypesWhoCanAccess"].includes(userType));

    let defaultSectionName = defaultSection[0]?.DefaultSection ? dict.linkifyName(defaultSection[0]?.DefaultSection) : null;
    
    for(let schemaName in dataObject) {
        dataObject[schemaName].schema = dataObject[schemaName].schema.map(row => {
            if(row.Options?.includes("VAL")){
                row.Options = extractOptionsFromValidation(validation,row.Options.slice(4));
            } else if (row.Options?.includes("SCHEMA")){
                const [schemaName,value,identifier] = row.Options.split("#").slice(1);
                row.Options = extractOptionsFromSchema(value,normalise(identifier),dataObject[schemaName].data);
            } else if (row.Options?.includes("SUBTABLE")){
                row.Options = row.Options?.split("#")
            } else {
                row.Options = [""].concat(row.Options?.split("#"));
            }

            if(row.TimeStamp){
                dataObject[schemaName].schema.push({Field: `${row.Field} Updated At`, Type: "DateTime"});
                dataObject[schemaName].schema.push({Field: `${row.Field} Updated By`, Type: "EmailToName"});
            }

            return row;
        }).concat([{Field: `Created At`, Type: "DateTime"},{Field: `Created By`, Type: "EmailToName"}]);

        dataObject[schemaName].schema = keyBy(dataObject[schemaName].schema,"Field");
    }

    dict.setDataObject(dataObject)
    dict.setSections(groupBy(filteredViews,"Section"));
    dict.setUserType(userType);
    dict.setUser(user);
    dict.setDefaultSection(defaultSectionName);
    dict.setLoading(false);
}

export default processStructureData;