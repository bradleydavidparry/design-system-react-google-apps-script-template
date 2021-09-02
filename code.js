function doGet(e) {
    var template = HtmlService.createTemplateFromFile('index');

    var permissions = createPermissionsDict();

    var user = Session.getActiveUser().getEmail();

    if(user !== "bradley.parry@digital.cabinet-office.gov.uk"){
        var sheet = SpreadsheetApp.openById(trackingSheetId).getSheetByName("Invoicing Tool");
        sheet.appendRow([user.replace("@digital.cabinet-office.gov.uk","").replace("."," "),new Date()]);
    }

    if(permissions[user]){
        return template.evaluate()
            .setTitle('Central Governance Tool')
            .setSandboxMode(HtmlService.SandboxMode.IFRAME)
            .setFaviconUrl("https://jobs.mindtheproduct.com/wp-content/uploads/company_logos/2017/03/gds-logo.png");
    }
}

function getStructureData(){
    var db = open(currentSpreadsheetId);
    var validation = getRows( open(validationSpreadsheetId), "Validation");
    
    const user = Session.getActiveUser().getEmail();
    const {RoleType: userType } = getRows( db, 'Permissions', [], {UserEmail: user} )[0];
    const views = getRows( db, "Views");
    const defaultSection = getRows( db, "User Types", [], { "UserType": userType }, 1);

    return JSON.stringify({ views, user, userType, defaultSection, validation});
}

function getViewData(schemasToFetch){
    var db = open(currentSpreadsheetId);
    const user = Session.getActiveUser().getEmail();

    const { Group, Team } = getRows( db, 'Permissions', [], {UserEmail: user} )[0];

    var validation = getRows( open(validationSpreadsheetId), "Validation");
    const returnObject = {validation}

    for(let schemaName of schemasToFetch) {
        switch(schemaName){
            case "New Vacancy Business Case":
                returnObject[schemaName] = {
                    data: [],
                    schema: getRows( db, schemaName),
                }
                break;
            case "CS Vacancies Schema":
                returnObject[schemaName] = {
                    data: getRows( db, "CS Vacancies")
                            .filter(row => (Group === "All" || Group.includes(row.Group)) && (Team === "All" || Team.includes(row.Team))),
                    schema: getRows( db, schemaName),
                }
                break;
            case "Contractor Vacancies Schema":
                returnObject[schemaName] = {
                    data: getRows( db, "Contractor Vacancies")
                            .filter(row => (Group === "All" || Group.includes(row.Group)) && (Team === "All" || Team.includes(row.Team))),
                    schema: getRows( db, schemaName),
                }
                break;
            case "CS Schema":
                returnObject[schemaName] = {
                    data: getRows( db, "Civil Servants")
                            .filter(row => (Group === "All" || Group.includes(row.Group)) && (Team === "All" || Team.includes(row.Team))),
                    schema: getRows( db, schemaName),
                }
                break;
            case "Contractors Schema":
                returnObject[schemaName] = {
                    data: getRows( db, "Contractors")
                            .filter(row => (Group === "All" || Group.includes(row.Group)) && (Team === "All" || Team.includes(row.Team))),
                    schema: getRows( db, schemaName),
                }
                break;
            case "L&D Schema":
                returnObject[schemaName] = {
                    data: getRows( db, "L&D Requests")
                            .filter(row => (Group === "All" || Group.includes(row.BusinessUnit)) && (Team === "All" || Team.includes(row.Team))),
                    schema: getRows( db, schemaName),
                }
                break;
            case "Workforce Plan Schema":
                returnObject[schemaName] = {
                    data: getRows( db, "Workforce Plan")
                            .filter(row => (Group === "All" || Group.includes(row.Group)) && (Team === "All" || Team.includes(row.Team))),
                    schema: getRows( db, schemaName),
                }
                break;
            default:
                break;
        }
    }
    return JSON.stringify(returnObject);
}

function updateData({ sheetName, updateObject}){
    var db = open(currentSpreadsheetId);
    if(updateObject.ID){
        updateRow( db, sheetName, updateObject, {ID: updateObject.ID } )
    } else {
        const properties = PropertiesService.getScriptProperties();
        let id = properties.getProperty(sheetName);
        let code = properties.getProperty(`${sheetName} Code`);
        if(!id){
            properties.setProperty(sheetName,"1")
            id = "1"
        }
        id = id.toString()
        updateObject.ID = code.slice(0,code.length - id.length) + id;
        properties.setProperty(sheetName,Number(Number(id) + 1).toFixed(0) + "");
        insertRow( db, sheetName, updateObject )
    }
    return updateObject.ID.toString();
}

function createPermissionsDict(){
    return getRows( open(currentSpreadsheetId), "Permissions").reduce((object,user) => {
      object[user["UserEmail"]] = user["RoleType"]
      return object;
    },{});
}

function setSheetCodes(){
    const properties = PropertiesService.getScriptProperties();
    const codeObject = {
        "Civil Servants": "CS10000",
        "Contractors": "CN00000",
        "CS Vacancies" : "CSVAC0000",
        "Contractor Vacancies": "CNVAC0000",
        "L&D Requests": "LD00000"
    }

    for(const sheetName in codeObject){
        properties.setProperty(`${sheetName} Code`,codeObject[sheetName]);
    }
}

function buildAllDatabases(){
    const schemaObject = {
        "CS Schema": "Civil Servants",
        //"Contractors Schema": "Contractors",
        //"CS Vacancies Schema" : "CS Vacancies",
        //"Contractor Vacancies Schema": "Contractor Vacancies",
        //"L&D Schema": "L&D Requests"
    }

    for(var schema in schemaObject){
        buildDatabase(schema,schemaObject[schema]);
    }
}

function buildDatabase(schemaSheetName,dataSheetName){
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dataSheet = ss.getSheetByName(dataSheetName)
    var currentTitles = dataSheet.getDataRange().getValues()[0];
    var [schemaTitles, ...schemaData] = ss.getSheetByName(schemaSheetName).getDataRange().getValues();
    var fieldColumn = schemaTitles.indexOf("Field");
    var typeColumn = schemaTitles.indexOf("Type");
    var timestampColumn = schemaTitles.indexOf("Time Stamp");

    const schemaFields = ["ID"].concat(schemaData.reduce((list,row) => {
      if(!["Comment","Record List"].includes(row[typeColumn])){
        list.push(row[fieldColumn]);
        if(row[timestampColumn] === true){
          list.push(`${row[fieldColumn]} Updated At`);
          list.push(`${row[fieldColumn]} Updated By`);
        }
      }
      return list;
    },[])).concat(["Created By","Created At","Updated By","Updated At"]);

    const fieldsToAdd = schemaFields.filter(field => !currentTitles.includes(field));

    if(fieldsToAdd.length > 0){
        dataSheet.getRange(1,dataSheet.getLastColumn()+1,1,fieldsToAdd.length).setValues([fieldsToAdd]);
    }
}