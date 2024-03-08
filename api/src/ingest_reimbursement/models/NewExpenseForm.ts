import { FileHandle } from "./FileHandle";

export class NewExpenseForm {
    public constructor(
        public readonly date: Date,
        public readonly vendor: string,
        public readonly item_name: string,
        public readonly amount: number,
        public readonly receipt: FileHandle,
        public readonly reimbursement: FileHandle,
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

export function fromMultipartForm(parts: Input[]): NewExpenseForm {
    const date = parts.find(p => p.name === 'date')?.data.toString();
    const vendor = parts.find(p => p.name === 'vendor')?.data.toString();
    const item_name = parts.find(p => p.name === 'item_name')?.data.toString();
    const amount = parts.find(p => p.name === 'amount')?.data.toString();
    const purchase_reason = parts.find(p => p.name === 'purchase_reason')?.data.toString();

    const receipt_input = parts.find(p => p.name === 'receipt_image');
    const reimbursement_input = parts.find(p => p.name === 'reimbursement_image');

    if (!date) {
        throw new Error('Date is required');
    } else if (!vendor) {
        throw new Error('Vendor is required');
    } else if (!item_name) {
        throw new Error('Item Name is required');
    } else if (!amount) {
        throw new Error('Amount is required');
    } else if (!receipt_input) {
        throw new Error('Receipt Image is required');
    } else if (!reimbursement_input) {
        throw new Error('Reimbursement Image is required');
    } else if (!purchase_reason) {
        throw new Error('Purchase Reason is required');
    }

    return new NewExpenseForm(
        new Date(date),
        vendor,
        item_name,
        Number(amount),
        FileHandle.fromInput(receipt_input),
        FileHandle.fromInput(reimbursement_input),
        purchase_reason
    );
}
