const PDFDocument = require("pdfkit");
const getStream = require('get-stream');


const generatePdfWithImageAndPassword = async (options, imageFileBuffer) => {

    // var input = fs.createReadStream(file);
    // Create a document
    const doc = new PDFDocument(options);

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    // doc.pipe(fs.createWriteStream("output.pdf"));

    doc.image(imageFileBuffer, {
        fit: [500, 400],
        align: 'center',
        valign: 'center'
    });
    doc.end();

    // doc.addPage()
    // Finalize PDF file

    return await getStream.buffer(doc)
}

module.exports = {
    generatePdfWithImageAndPassword
}