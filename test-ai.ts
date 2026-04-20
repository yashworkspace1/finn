import { extractTransactionsWithAI } from './lib/ai/gemini';
import { normalizeDate, normalizeAmount, normalizeType, isValidTransaction } from './lib/parser/normalizer';
import 'dotenv/config'; // Make sure process.env is loaded

(async () => {
    try {
        const text = `
01/04/2026 AMAZON RETAIL 120.50 DR
02/04/2026 SALARY CREDIT 5000.00 CR
        `;
        console.log("Calling Gemini...");
        const raw = await extractTransactionsWithAI(text);
        console.log("Raw from AI:", raw);
        
        const transactions = [];
        for (const r of raw) {
            const date = normalizeDate(r.date);
            if (!date) continue;
            const amount = normalizeAmount(String(r.amount));
            const type = normalizeType(r.type);
            const t = { date, description: r.description, amount, type };
            if (isValidTransaction(t)) {
                transactions.push(t);
            } else {
                console.log("Invalid transaction:", t);
            }
        }
        console.log("Final valid transactions:", transactions);
    } catch(e) {
        console.error("AI Error:", e);
    }
})();
