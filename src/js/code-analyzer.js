import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc:true});
};

export {parseCode};





// import * as esprima from 'esprima';
//
// const parseCode = (codeToParse) => {
//     const body = esprima.parseScript(codeToParse);
//     body.rowNumber = codeToParse.split('\n').length;
//     const name = body.body.length > 0 ? body.body[0].id.name : '';
//     if(!name) {
//         return {
//             error: 'please provide a valid function'
//         };
//     }
//     return {
//         rowNumber: body.rowNumber,
//         type: body.type,
//         name
//     };
//
//
// };
//
// export {parseCode};
