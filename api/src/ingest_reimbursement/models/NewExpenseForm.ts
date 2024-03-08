import { FileHandle } from "./FileHandle";
import { MultipartRequest } from "lambda-multipart-parser";
import { UploadedFile } from "./UploadedFile";

export class NewExpenseForm {
    public constructor(
        public readonly date: Date,
        public readonly vendor: string,
        public readonly item_name: string,
        public readonly amount: number,
        public readonly receipt: UploadedFile,
        public readonly reimbursement: UploadedFile,
        public readonly purchase_reason: string,
    ) {
    }
}

export type Input = {
    filename?: string
    name?: string
    type: string
    data: Buffer
}

export function fromMultipartForm(parts: MultipartRequest, receipt: UploadedFile, reimbursement: UploadedFile): NewExpenseForm {
    const date = parts['date'];
    const vendor = parts['vendor'];
    const item_name = parts['item_name'];
    const amount = parts['amount'];
    const purchase_reason = parts['purchase_reason'];

    if (!date) {
        throw new Error('Date is required');
    } else if (!vendor) {
        throw new Error('Vendor is required');
    } else if (!item_name) {
        throw new Error('Item Name is required');
    } else if (!amount) {
        throw new Error('Amount is required');
    } else if (!purchase_reason) {
        throw new Error('Purchase Reason is required');
    }

    return new NewExpenseForm(
        new Date(date),
        vendor,
        item_name,
        Number(amount),
        receipt,
        reimbursement,
        purchase_reason
    );
}
