import assert from 'assert';
import * as parser from '../src/js/parser';



describe('Test internal params',() => {
    const result = parser.runParser('function name(x,y,z){}');
    it('is returning params correctly', () => {
        const firstParamName = result[1].name;
        assert.equal(firstParamName, 'x');
    });
    it('is returning params correctly', () => {
        const secandParamType = result[2].type;
        assert.equal(secandParamType, 'Parameter');
    });
    it('is returning params correctly', () => {
        const thirdParamLine = result[2].line;
        assert.equal(thirdParamLine, 1);
    });
});
describe('Test  function getUpdateValue',() => {
    it('is returning value correctly', () => {
        const input = {type:'UpdateExpression',operator:'++',argument:{type:'Identifier',name:'i',loc:{start:{line:5,column:31},end:{line:5,column:32}}},prefix:false,loc:{start:{line:5,column:31},end:{line:5,column:34}}};
        const result = parser.getUpdateValue(input, 'i');
        assert.equal(result,'i++');
    });
    it('is returning value correctly', () => {
        const input = {type:'UpdateExpression',operator:'++',argument:{type:'Identifier',name:'i',loc:{start:{line:5,column:31},end:{line:5,column:32}}},prefix:true,loc:{start:{line:5,column:31},end:{line:5,column:34}}};
        const result = parser.getUpdateValue(input, 'i');
        assert.equal(result,'++i');
    });
});

describe('Test  function getValue',() => {
    it('is returning value correctly Assignment', () => {
        const rightOperand ={type: 'Literal', value: 0, raw: '0', loc: {start: {line: 3, column: 10},end: {line: 3, column: 11}}};
        const object = {type: 'AssignmentExpression', operator: '=', left: {type: 'Identifier', name: 'low', loc: {start: {line: 3, column: 4},end: {line: 3, column: 7}}}, right: {type: 'Literal', value: 0, raw: '0', loc: {start: {line: 3, column: 10},end: {line: 3, column: 11}}}, loc: {start: {line: 3, column: 4},end: {line: 3, column: 11}}};
        const result = parser.getValue('AssignmentExpression',rightOperand,object);
        assert.equal(result,'0');
    });
    it('is returning value correctly return', () => {
        const rightOperand ='';
        const object = {type: 'ReturnStatement', argument:{type: 'UnaryExpression', operator: '-', argument:{type: 'Literal', value: 1, raw: '1', loc: {start:{line: 14, column: 12},end:{line: 14, column: 13}}}, prefix: true, loc: { start:{line: 14, column: 11},end:{line: 14, column: 13}}}, loc: {start: {line: 14, column: 4},end: {line: 14, column: 14}}};
        const result = parser.getValue('ReturnStatement',rightOperand,object);
        assert.equal(result,'-1');
    });
});

describe('Test  function getConditionalStatement',() => {
    it('is returning value correctly while', () => {
        const type ='WhileStatement';
        const init = '';
        const test = {type: 'BinaryExpression', operator: '<=', left: {type: 'Identifier', name: 'low', loc: {start: {line: 5, column: 11},end: {line: 5, column: 14}}}, right: {type: 'Identifier', name: 'high', loc: {start:{line: 5, column: 18},end:{line: 5, column: 22}}}, loc: {start: {line: 5, column: 11},end: {line: 5, column: 22}}};
        const update = '';
        const result = parser.getConditionalStatement(type,init,test,update);
        assert.equal(result,'low <= high');
    });
    it('is returning value correctly for', () => {
        const type ='ForStatement';
        const init = {type:'VariableDeclaration',declarations:[{type:'VariableDeclarator',id:{type:'Identifier',name:'i',loc:{start:{line:5,column:13},end:{line:5,column:14}}},init:{type:'Literal',value:0,raw:'0',loc:{start:{line:5,column:15},end:{line:5,column:16}}},loc:{start:{line:5,column:13},end:{line:5,column:16}}}],kind:'var',loc:{start:{line:5,column:9},end:{line:5,column:16}}};
        const test = {type:'BinaryExpression',operator:'<=',left:{type:'Identifier',name:'i',loc:{start:{line:5,column:17},end:{line:5,column:18}}},right:{type:'Identifier',name:'high',loc:{start:{line:5,column:21},end:{line:5,column:25}}},loc:{start:{line:5,column:17},end:{line:5,column:25}}};
        const update = {type:'UpdateExpression',operator:'--',argument:{type:'Identifier',name:'i',loc:{start:{line:5,column:26},end:{line:5,column:27}}},prefix:false,loc:{start:{line:5,column:26},end:{line:5,column:29}}};
        const result = parser.getConditionalStatement(type,init,test,update);
        assert.equal(result,'i = 0;i <= high;i--');
    });
});

describe('Test  functions ',() => {
    const result = parser.runParser('function binarySearch(){\nlet low,X,V,n, high, mid;\nlow = 0;\nhigh = n - 1;\nfor(i=0;low <= high;i++) {\nmid = (low + high)/2;\nif (X.a < V[mid])\nhigh = mid - 1;\nelse if (X > V[mid])\nlow = mid + 1;\nelse\nreturn mid;\n}\nreturn -1;\n}');
    it('is returning value correctly memberExpression v[x], v.x', () => {
        const first = result[11].condition;
        assert.equal(first,'X.a < V[mid]');
    });
    it('is returning value correctly Assignment', () => {
        const second = result[8].name;
        assert.equal(second,'high');
    });
    it('is returning value correctly "IfStatement"', () => {
        const third = result[13].condition;
        assert.equal(third,'X > V[mid]');
    });
    it('is returning value correctly "Unary"', () => {
        const forth = result[16].value;
        assert.equal(forth,'-1');
    });
});
describe('Test  functions unary and variableDeclarator ',() => {
    it('is returning value correctly unary', () => {
        const result = parser.runParser('function func(x){\n' +
            'let mouse = -2;\n}');
        const second = result[2].value;
        assert.equal(second, '-2');
    });
    it('is returning value correctly unary', () => {
        const result = parser.runParser('function func(x){\n' +
            'let mouse = 2;\n' +
            '}');
        const second = result[2].value;
        assert.equal(second, '2');
    });
    it('is returning value correctly unary', () => {
        const result = parser.runParser('function func(x){\nx = -2;\n}');
        const second = result[2].value;
        assert.equal(second, '-2');
    });
});
describe('Test  functions v[mid]=v[mid+1] ',() => {
    it('is returning value correctly unary', () => {
        const result = parser.runParser('function Sort(arr){\n' +
            ' for (let i=0; i<arr.length-(i+1); j++){\n' +
            'let temp=arr[j];\n' +
            'arr[j]=arr[j+1];\n' +
            '}\n' +
            'return arr;\n' +
            '}');
        const second = result[4].name;
        const first = result[4].value;
        assert.equal(second, 'arr[j]');
        assert.equal(first, 'arr[j + 1]')
    });
});




