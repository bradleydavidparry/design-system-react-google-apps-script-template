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
            .setTitle('Web App Template')
            .setSandboxMode(HtmlService.SandboxMode.IFRAME)
            .setFaviconUrl("https://jobs.mindtheproduct.com/wp-content/uploads/company_logos/2017/03/gds-logo.png");
    }
}

function getStructureData(){
    var validation = getRows( open(validationSpreadsheetId), "Validation");
    var db = open(currentSpreadsheetId);
    
    const user = Session.getActiveUser().getEmail();
    const userType = createPermissionsDict()[user];
    const views = getRows( db, "Views");
    const defaultSection = getRows( db, "User Types", [], { "UserType": userType }, 1);
    
    const dataObject = {
        "Data Schema": {
            data: getRows( db, "Data"),
            schema: getRows( db, "Data Schema")
        },
        "L&D Schema": {
            data: getRows( db, "L&D Requests"),
            schema: getRows( db, "L&D Schema")
        }
    }

    return JSON.stringify({dataObject, views, user, userType, defaultSection, validation});
}

function updateData({ sheetName, updateObject}){
    var db = open(currentSpreadsheetId);
    if(updateObject.ID){
        updateRow( db, sheetName, updateObject, {ID: updateObject.ID } )
    } else {
        const properties = PropertiesService.getScriptProperties()
        let id = properties.getProperty(sheetName);
        if(!id){
            properties.setProperty(sheetName,"1")
            id = "1"
        }
        updateObject.ID = id;
        properties.setProperty(sheetName,Number(id) + 1);
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

function buildAllDatabases(){
    const schemaObject = {
        "Data Schema": "Data",
        "L&D Schema": "L&D Returns"
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