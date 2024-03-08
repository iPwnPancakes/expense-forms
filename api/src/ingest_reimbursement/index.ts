import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { fromMultipartForm, NewExpenseForm } from './models/NewExpenseForm';
import { randomUUID } from "node:crypto";
import { parse } from 'lambda-multipart-parser'
import { drive_v3 } from "@googleapis/drive";
import { Readable } from "stream";
import { FileHandle } from "./models/FileHandle";
import { UploadedFile } from "./models/UploadedFile";
import Drive = drive_v3.Drive;

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
        'Receipt': expense.receipt.webViewLink,
        'Reimbursement Receipt': expense.reimbursement.webViewLink,
        'Reason': expense.purchase_reason
    });
}

export async function handler(event: any): Promise<string> {
    if (
        process.env.GOOGLE_EMAIL === undefined ||
        process.env.GOOGLE_PRIVATE_KEY === undefined ||
        process.env.SHEET_ID === undefined ||
        process.env.DRIVE_RECEIPTS_FOLDER_ID === undefined ||
        process.env.DRIVE_REIMBURSEMENTS_FOLDER_ID === undefined
    ) {
        throw new Error('Google API credentials not set');
    }

    const parts = await parse(event);

    const receiptFileInput = parts.files.find(p => p.fieldname === 'receipt_image');
    const reimbursementFileInput = parts.files.find(p => p.fieldname === 'reimbursement_image');

    if (!receiptFileInput) {
        throw new Error('Receipt Image is required');
    } else if (!reimbursementFileInput) {
        throw new Error('Reimbursement Image is required');
    }

    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
    });

    const google_drive = new Drive({}, {
        _options: {
            auth: serviceAccountAuth
        }
    });

    const uploadedReceiptFile = FileHandle.fromMultipartFile(receiptFileInput);
    const uploadedReimbursementFile = FileHandle.fromMultipartFile(reimbursementFileInput);

    const receiptFile = await google_drive.files.create({
        media: {
            mimeType: uploadedReceiptFile.contentType,
            body: Readable.from(uploadedReceiptFile.content_buffer)
        },
        requestBody: {
            name: uploadedReceiptFile.contentHash(),
            originalFilename: uploadedReceiptFile.filename,
            parents: [process.env.DRIVE_RECEIPTS_FOLDER_ID],
            mimeType: uploadedReceiptFile.contentType
        },
        fields: 'webViewLink,id'
    });

    const reimbursementFile = await google_drive.files.create({
        media: {
            mimeType: uploadedReimbursementFile.contentType,
            body: Readable.from(uploadedReimbursementFile.content_buffer)
        },
        requestBody: {
            name: uploadedReimbursementFile.contentHash(),
            originalFilename: uploadedReimbursementFile.filename,
            parents: [process.env.DRIVE_REIMBURSEMENTS_FOLDER_ID],
            mimeType: uploadedReimbursementFile.contentType,
        },
        fields: 'webViewLink'
    });

    const receipt: UploadedFile = {
        id: receiptFile.data.id ?? '',
        file: uploadedReceiptFile,
        webViewLink: receiptFile.data.webViewLink ?? ''
    }

    const reimbursement: UploadedFile = {
        id: reimbursementFile.data.id ?? '',
        file: uploadedReimbursementFile,
        webViewLink: reimbursementFile.data.webViewLink ?? ''
    }

    const newExpenseForm = fromMultipartForm(parts, receipt, reimbursement);

    const spreadsheet = await getSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);
    const sheet = spreadsheet.sheetsByIndex[0];

    try {
        await addExpense(newExpenseForm, sheet);
    } catch (e) {
        console.error(e);
        return '500';
    }

    return '200';
}
