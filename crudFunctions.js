//objDB library ID:
// MJMF2lqsgWV-I-dlyqJN6OrljYCrJdQKl

//updateObject,criteria
function crud(type,database,table,options){
    var db = options.db ? options.db : open( getDatabaseId(database) );
    const { updateObject, criteriaObject, massUpdateObject } = options;

    switch(type) {
        case 'create':
            insertRow( db, table, updateObject );
            return;
        case 'update':
            updateRow( db, table, updateObject, criteriaObject );
            return;
        case 'delete':
            deleteRow( db, table, criteriaObject );
            return;
        case 'massUpdate':
            for(var update in massUpdateObject){
                updateRow( db, table, massUpdateObject[update].update, massUpdateObject[update].criteria );
            }
            return;
        default:
            var rows = getRows( db, table);
            return JSON.stringify(rows);
    }
}

const getDatabaseId = (database) => {
    switch(database){
        default:
            return invoicingId;
    }
}
