function doGet(e) {
    var template = HtmlService.createTemplateFromFile('index');

    var permissions = createPermissionsDict();

    var user = Session.getActiveUser().getEmail();

    if(user != "bradley.parry@digital.cabinet-office.gov.uk"){
        var sheet = SpreadsheetApp.openById(trackingSheetId).getSheetByName("Invoicing Tool");
        sheet.appendRow([user.replace("@digital.cabinet-office.gov.uk","").replace("."," "),new Date()]);
    }

    template.user = user;

    if(permissions[user]){
        return template.evaluate()
            .setTitle('Web App Template')
            .setSandboxMode(HtmlService.SandboxMode.IFRAME)
            .setFaviconUrl("https://jobs.mindtheproduct.com/wp-content/uploads/company_logos/2017/03/gds-logo.png");
    }
}

function getData(){
    var db = open(currentSpreadsheetId);
    const data = getRows( db, "Data");
    const schema = getRows( db, "Schema");
    return JSON.stringify({data, schema});
}

function createPermissionsDict(){
    return getRows( open(currentSpreadsheetId), "Permissions").reduce((object,user) => {
      object[user["UserEmail"]] = user["RoleType"]
      return object;
    },{});
}