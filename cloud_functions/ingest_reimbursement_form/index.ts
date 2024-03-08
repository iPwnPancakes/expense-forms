import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { fromLambdaEvent, NewExpenseForm } from './models/NewExpenseForm.js';
import { randomUUID } from "node:crypto";

async function getSpreadsheet(sheetID: string, auth: JWT): Promise<GoogleSpreadsheet> {
    const spreadsheet = new GoogleSpreadsheet(sheetID, auth);

    await spreadsheet.loadInfo();

    return spreadsheet;
}

async function addExpense(expense: NewExpenseForm, sheet: GoogleSpreadsheetWorksheet): Promise<void> {
    await sheet.addRow({
        ID: randomUUID(),
        Date: expense.date,
        Vendor: expense.vendor,
        'Item Purchased': expense.item_name,
        Amount: expense.amount,
        'Receipt': expense.base64_receipt_image,
        'Reimbursement Receipt': expense.base64_reimbursement_image,
        'Reason': expense.purchase_reason
    });
}

export async function handler(event: any) {
    if (process.env.NODE_ENV !== 'production') {
        const dotenv = await import('dotenv');
        dotenv.config();
    }

    if (process.env.GOOGLE_EMAIL === undefined || process.env.GOOGLE_PRIVATE_KEY === undefined || process.env.SHEET_ID === undefined) {
        throw new Error('Google API credentials not set');
    }

    const newExpenseForm = fromLambdaEvent(event);

    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
    });

    const spreadsheet = await getSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);
    const sheet = spreadsheet.sheetsByIndex[0];

    await addExpense(newExpenseForm, sheet);
}
