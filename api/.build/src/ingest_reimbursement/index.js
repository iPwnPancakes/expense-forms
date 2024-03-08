"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const google_spreadsheet_1 = require("google-spreadsheet");
const google_auth_library_1 = require("google-auth-library");
const NewExpenseForm_1 = require("./models/NewExpenseForm");
const node_crypto_1 = require("node:crypto");
function getSpreadsheet(sheetID, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        const spreadsheet = new google_spreadsheet_1.GoogleSpreadsheet(sheetID, auth);
        yield spreadsheet.loadInfo();
        return spreadsheet;
    });
}
function addExpense(expense, sheet) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sheet.addRow({
            ID: (0, node_crypto_1.randomUUID)(),
            Date: expense.date,
            Vendor: expense.vendor,
            'Item Purchased': expense.item_name,
            Amount: expense.amount,
            'Receipt': expense.base64_receipt_image,
            'Reimbursement Receipt': expense.base64_reimbursement_image,
            'Reason': expense.purchase_reason
        });
    });
}
function handler(event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.GOOGLE_EMAIL === undefined || process.env.GOOGLE_PRIVATE_KEY === undefined || process.env.SHEET_ID === undefined) {
            throw new Error('Google API credentials not set');
        }
        const newExpenseForm = (0, NewExpenseForm_1.fromLambdaEvent)(event);
        const serviceAccountAuth = new google_auth_library_1.JWT({
            email: process.env.GOOGLE_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
        });
        const spreadsheet = yield getSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);
        const sheet = spreadsheet.sheetsByIndex[0];
        yield addExpense(newExpenseForm, sheet);
    });
}
exports.handler = handler;
