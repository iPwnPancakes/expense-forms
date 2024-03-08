import { Input } from "./NewExpenseForm";

export class FileHandle {
    constructor(
        public readonly filename: string,
        public readonly content_buffer: Buffer,
        public readonly contentType: string
    ) {
    }

    static fromInput(input: Input): FileHandle {
        if (!input.filename || !input.data || !input.type) {
            throw new Error('Cannot construct FileHandle from invalid input');
        }

        return new FileHandle(input.filename, input.data, input.type);
    }

    public contentHash(): string {
        const hash = require('crypto').createHash('sha256');
        hash.update(this.content_buffer);
        return hash.digest('hex');
    }
}
