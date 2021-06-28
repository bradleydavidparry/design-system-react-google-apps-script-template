import keyBy from 'lodash/keyBy';
//import groupBy from 'lodash/groupBy';
//import forEach from 'lodash/forEach';
import keys from 'lodash/keys';
//import reduce from 'lodash/reduce';

function processData(d,dict){
    let parse = JSON.parse(d);

    const data = keyBy(parse.data, 'ID');

    dict.setData(data);
    dict.setLoading(false);
}

export default processData;