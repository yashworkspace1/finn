import { parsePDF } from './lib/parser/pdfParser';
import fs from 'fs';

(async () => {
    try {
        const files = fs.readdirSync('./test').filter(f => f.endsWith('.pdf'));
        if (files.length === 0) {
            console.log("No test pdfs.");
            return;
        }
        const buf = fs.readFileSync('./test/' + files[0]);
        console.log("Parsing", files[0]);
        const tx = await parsePDF(buf);
        console.log("Found", tx.length, "transactions");
    } catch(e) {
        console.error(e);
    }
})();
