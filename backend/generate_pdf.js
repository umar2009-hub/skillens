const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('../test_document.pdf'));

doc.fontSize(24).text('Introduction to Artificial Intelligence', { align: 'center' });
doc.moveDown();
doc.fontSize(14).text('Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning (the acquisition of information and rules for using the information), reasoning (using rules to reach approximate or definite conclusions), and self-correction.');
doc.moveDown();
doc.text('Machine Learning is a subset of AI that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. Neural Networks are a set of algorithms, modeled loosely after the human brain, that are designed to recognize patterns.');

doc.end();
