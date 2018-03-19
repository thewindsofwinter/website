/**
 * {number} mm2pt({number}):
 * converts values from millimeters to PDF points
 * @param mm {number}
 * @return {number}
 */
function mm2pt(mm) {
    return 72.0/25.4*mm;
}

/**
 * void generatePDF({object}, {element}):
 * generates a DIN 5008 letter PDF from the given letterObject and views it in the given iframe
 * @param letter {object} containing {sender_oneline: '', recipient_address: '', information_block: '', subject: '', content: ''}
 * @param iframe {Element} to view the PDF blob
 */
function generatePDF(letter, iframe) {
    var doc = {
        pageSize: 'A4',
        pageMargins: [mm2pt(25), mm2pt(27), mm2pt(20), mm2pt(16.9)], // [left, top, right, bottom]
        content: [
            {
                columns: [
                    {
                        width: mm2pt(85),
                        text: letter.sender_oneline,
                        fontSize: 6,
                    }
                ],
                absolutePosition: {x: mm2pt(20), y: mm2pt(27)},
            }, {
                columns: [
                    {
                        width: mm2pt(85),
                        text: letter.recipient_address,
                    }
                ],
                absolutePosition: {x: mm2pt(20), y: mm2pt(34)},
            }, {
                columns: [
                    {
                        width: mm2pt(75),
                        text: letter.information_block,
                    }
                ],
                absolutePosition: {x: mm2pt(210-85), y: mm2pt(32)},
            }, {
                text: [
                    {
                        text: letter.subject + '\n\n\n',
                        bold: true
                    },
                    parseContent(letter.content)
                ],
                absolutePosition: {x: mm2pt(25), y: mm2pt(85)}
            }
        ],
        background: page => ({canvas: [
            {
                type: 'line',
                x1: 0, y1: mm2pt(87),
                x2: mm2pt(8), y2: mm2pt(87),
                lineWidth: 1
            }, {
                type: 'line',
                x1: 0, y1: mm2pt(192),
                x2: mm2pt(8), y2: mm2pt(192),
                lineWidth: 1
            }, {
                type: 'line',
                x1: 0, y1: mm2pt(148.5),
                x2: mm2pt(10), y2: mm2pt(148.5),
                lineWidth: 1
            }
        ]})
    };

    pdfMake.createPdf(doc).getBlob((blob) => {
        iframe.src = URL.createObjectURL(blob);
    });
}

/**
 * void parseContent({string})
 * @param content {string} string to parse
 * TODO: Documentation of "tags"
 */
function parseContent(content) {
    var regex = /\[(.+?\])([\s\S]*?)\[\/\1/gmu;
    var text_array = content.split(regex);

    var content_array = [];
    text_array.forEach(function(slice, i) {
        switch(slice) {
            case 'bold]':
                content_array.push({text: text_array[i + 1], bold: true});
                delete text_array[i + 1];
                break;
            case 'italic]':
                content_array.push({text: text_array[i + 1], italics: true});
                delete text_array[i + 1];
                break;
            case '':
                break;
            default:
                content_array.push(slice);
        }
    });

    return content_array;
}