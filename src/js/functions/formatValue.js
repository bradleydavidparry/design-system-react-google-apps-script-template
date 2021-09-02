import { formatDate, formatMoney, formatDateTime, emailToName } from "./utilities"

function formatValue(input,type){
    if(!input) return "";
    switch(type){
        case "Currency":
            return formatMoney(input,0);
        case "Date":
            return formatDate(input);
        case "DateTime":
            return formatDateTime(input);
        case "Checkbox":
            return input.split("#").join(", ");
        case "EmailToName":
            return emailToName(input);
        default:
            return input;
    }
}

export { formatValue }