import $ from 'jquery';
import {runParser} from './parser';

const tableTemplate = '<table><tr>\n' +
    '<th>Line</th>\n' +
    '        <th>Type</th>\n' +
    '        <th>Name</th>\n' +
    '        <th>Condition</th>\n' +
    '      <th>Value</th></tr>$rows</table>';

const rowTemplate = '    <tr>\n' +
    '    <td>$line</td>\n' +
    '    <td>$type</td>\n' +
    '    <td>$name</td>\n' +
    '    <td>$condition</td>\n' +
    '    <td>$value</td>\n' +
    '    </tr>';

function createTableTemplate(table){
    let rows = '';
    const result = tableTemplate;
    table.forEach((row) => {
        let template=rowTemplate;
        template = template.replace('$line', row.line);
        template = template.replace('$type', row.type);
        template = template.replace('$name', row.name);
        template = template.replace('$condition', row.condition);
        template = template.replace('$value', row.value);
        rows += template;
    });
    return result.replace('$rows',rows);
}


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        $('#result').empty();
        const code = $('#codePlaceholder').val();
        var table = runParser(code);
        const output = createTableTemplate(table);
        $('#result').append(output);




    });

});


