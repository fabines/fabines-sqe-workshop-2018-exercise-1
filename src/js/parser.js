
import {parseCode} from './code-analyzer';
//all types of expressions to go through
const validTypes = ['FunctionDeclaration', 'AssignmentExpression', 'WhileStatement', 'ReturnStatement',
    'UpdateExpression','ForStatement','IfStatement','VariableDeclarator','params'];
const resultArray = [];
/**
 * deals  with parameters only applies on type function declaration where the param exsits
 * returns objects as desplayed in the table.
 */
function getParams(functionDeclaration) {
    const {params} = functionDeclaration;
    return params.map((param) => {
        const {loc: {start: {line}}, name} = param;
        return {line, type: 'Parameter', name, condition: '', value: ''};
    });
}
/**
 * deals with Expressions like v[mid] or x.a
 * uses function getCompoundValue to return the value inside the '[]' or after '.'
 * @param memberExpression
 * @returns {string} if computed (boolean value in esprima which indicates if it is [] or .
 */
function getMemberExpression(memberExpression){
    const {computed,property,object} = memberExpression;
    const value = getCompoundValue(property, '');
    const key = getCompoundValue(object, '');
    if(computed) {
        return `${key}[${value}]`;
    }
    return `${key}.${value}`;
}
/**
 *
 * @param name
 * @param stringValue
 * @param currentValue
 * @returns {*}
 */
function valueName(name='',stringValue,currentValue=''){
    return currentValue + (name || stringValue);
}

/**
 * returns recursively the value of objects from esprima according to the type
 * @param object
 * @param currentValue
 * @returns {*}
 */
function getCompoundValue(object, currentValue) {
    if(!object){
        return '';
    }
    const {name, value='', type} = object;
    if (type === 'MemberExpression'){
        return getMemberExpression(object);
    }
    const stringValue = value.toString();
    if(name || stringValue){
        return valueName(name,stringValue,currentValue);
    }
    const {left, right, operator} = object;
    return `${getCompoundValue(left,currentValue)} ${operator} ${getCompoundValue(right,currentValue)}`;

}
/**
 * if the boolean value prefix is true then ++ is the left side else it is on the right
 * @param object
 * @param name
 * @returns {string}
 */
function getUpdateValue(object,name){
    return object.prefix ? `${object.operator}${name}` : `${name}${object.operator}`;
}

/**
 * get the value if UnaryExpression
 * @param object
 * @param rightOperand
 * @returns {string}
 */
function unaryValue(object,rightOperand){
    const {operator='', type:argumentType, argument} = rightOperand;
    return argumentType === 'UnaryExpression' ? `${operator}${argument.value}` : getCompoundValue(rightOperand, '');
}
/**
 *
 * @param type
 * @param rightOperand
 * @param object
 * @returns the value of the right side of the assignment and
 */
function getValue(type, rightOperand,object) {
    if(type === 'AssignmentExpression') {
        return unaryValue(object,rightOperand);
    }
    if(type === 'ReturnStatement') {
        const {operator='', type:argumentType, argument} = object.argument;
        return argumentType === 'UnaryExpression' ? `${operator}${argument.value}` : getCompoundValue(object.argument, operator);
        // if(argumentType === 'UnaryExpression'){
        //     return operator + argument.value;
        // }
        // return getCompoundValue(object.argument, operator);
    }
    if(type === 'UpdateExpression'){
        const {name} = object.argument;
        return getUpdateValue(object,name);
    }
    return '';
}

/**
 * integrates the condition depending on the statement
 * @param type
 * @param init
 * @param test
 * @param update
 * @returns {*}
 */
function getConditionalStatement(type,init,test,update){
    let condition = '';
    if(init.type=='VariableDeclaration') {
        condition = getInitValue(init);
    } else{
        condition = getCompoundValue(init, '');
    }
    if(condition) condition+= ';';
    condition += getCompoundValue(test, '');
    if(update) condition += ';'+ getValue('UpdateExpression','',update);
    return condition;
}

function getInitValue(init){
    const varName = init.declarations[0].id.name;
    const value = getCompoundValue(init.declarations[0].init);
    return `${varName} = ${value}`;
}
function getValueOfVariableDec(type,object){
    if(type === 'VariableDeclarator'){
        if(object.init){
            return object.init.argument ? `${object.init.operator}${object.init.argument.value}` :getCompoundValue(object.init, '');
        }
        return '';
    }
    return '';
}
/**
 * receives objects and map them into the table as desired
 * @param objects
 * @returns {*}
 */
function mapParsedCode(objects) {
    const condinalStatements = ['ForStatement','IfStatement','WhileStatement'];
    return objects.map((object) => {
        let condition = '';
        const {loc: {start: {line}}, type, name = '', id = {}, test = {} ,init='', update=''} = object;
        let nameCol = name || id.name || '';
        if (condinalStatements.includes(type)) {
            condition = getConditionalStatement(type,init,test,update);
        }
        if(type == 'AssignmentExpression')
            nameCol = getNameCol(object.left);
        var value = getValue(type, object.right, object) || getValueOfVariableDec(type,object);
        return {line, type, name: nameCol, condition, value};
    });
}
function getNameCol(object){
    return object.name || getCompoundValue(object);
}

/**
 * recursive function which creates the objects for the map function
 * @param jsonObj
 */
function traverse(jsonObj) {
    if (!jsonObj || typeof jsonObj != 'object') {
        return;
    }
    Object.entries(jsonObj).forEach(([key, value]) => {
        // key is either an array index or object key
        if(!['init','update'].includes(key)) {
            if (value && validTypes.includes(value.type)) {
                resultArray.push(value);
            }
            traverse(value);
        }
    });
}

/**
 * main function creates the table
 * @param code
 * @returns {*}
 */
function runParser(code) {
    let parsedCode = parseCode(code);
    traverse(parsedCode);
    const table = mapParsedCode(resultArray);
    const paramsRows = getParams(resultArray[0]);
    table.splice(1,0,...paramsRows);
    resultArray.length = 0 ;
    // $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    return table;
}


export{
    traverse,
    mapParsedCode,
    getParams,
    runParser,
    getUpdateValue,
    getValue,
    getConditionalStatement,
    getCompoundValue,
    getMemberExpression,
    valueName
};


