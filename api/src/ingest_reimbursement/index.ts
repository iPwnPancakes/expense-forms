import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { fromMultipartForm, NewExpenseForm } from './models/NewExpenseForm';
import { randomUUID } from "node:crypto";
import { parse, getBoundary } from "parse-multipart-data";

async function getSpreadsheet(sheetID: string, auth: JWT): Promise<GoogleSpreadsheet> {
    const spreadsheet = new GoogleSpreadsheet(sheetID, auth);

    await spreadsheet.loadInfo();

    return spreadsheet;
}

async function addExpense(expense: NewExpenseForm, sheet: GoogleSpreadsheetWorksheet): Promise<void> {
    await sheet.addRow({
        ID: randomUUID(),
        Date: expense.date.toDateString(),
        Vendor: expense.vendor,
        'Item Purchased': expense.item_name,
        Amount: expense.amount,
        'Receipt': expense.receipt.contentHash(),
        'Reimbursement Receipt': expense.reimbursement.contentHash(),
        'Reason': expense.purchase_reason
    });
}

export async function handler(event: any): Promise<number> {
    if (process.env.GOOGLE_EMAIL === undefined || process.env.GOOGLE_PRIVATE_KEY === undefined || process.env.SHEET_ID === undefined) {
        throw new Error('Google API credentials not set');
    }

    const boundary: string = getBoundary(event.headers['content-type']);
    const parts = parse(Buffer.from(event.body), boundary);

    const newExpenseForm = fromMultipartForm(parts);

    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
    });

    const spreadsheet = await getSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);
    const sheet = spreadsheet.sheetsByIndex[0];

    try {
        await addExpense(newExpenseForm, sheet);
    } catch (e) {
        console.error(e);
        return 500;
    }

    return 200;
}
