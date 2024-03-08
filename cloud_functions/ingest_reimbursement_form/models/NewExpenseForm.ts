export class NewExpenseForm {
    public constructor(
        public readonly date: Date,
        public readonly vendor: string,
        public readonly item_name: string,
        public readonly amount: number,
        public readonly base64_receipt: string,
        public readonly base64_reimbursement: string,
        public readonly purchase_reason: string,
    ) {
    }
}

export function fromLambdaEvent(event: any): NewExpenseForm {
    const { date, vendor, item_name, amount, base64_receipt, base64_reimbursement, purchase_reason } = event;

    return new NewExpenseForm(
        new Date(date),
        vendor,
        item_name,
        amount,
        base64_receipt,
        base64_reimbursement,
        purchase_reason
    );
}
