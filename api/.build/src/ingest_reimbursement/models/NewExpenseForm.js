"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromLambdaEvent = exports.NewExpenseForm = void 0;
class NewExpenseForm {
    constructor(date, vendor, item_name, amount, base64_receipt_image, base64_reimbursement_image, purchase_reason) {
        this.date = date;
        this.vendor = vendor;
        this.item_name = item_name;
        this.amount = amount;
        this.base64_receipt_image = base64_receipt_image;
        this.base64_reimbursement_image = base64_reimbursement_image;
        this.purchase_reason = purchase_reason;
    }
}
exports.NewExpenseForm = NewExpenseForm;
function fromLambdaEvent(event) {
    const { date, vendor, item_name, amount, base64_receipt, base64_reimbursement, purchase_reason } = event;
    return new NewExpenseForm(new Date(date), vendor, item_name, amount, base64_receipt, base64_reimbursement, purchase_reason);
}
exports.fromLambdaEvent = fromLambdaEvent;
