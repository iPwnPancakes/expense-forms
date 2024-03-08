import { MultipartFile } from "lambda-multipart-parser";

export class FileHandle {
    constructor(
        public readonly filename: string,
        public readonly content_buffer: Buffer,
        public readonly contentType: string
    ) {
    }

    static fromMultipartFile(input: MultipartFile): FileHandle {
        if (!input.filename || !input.content || !input.contentType) {
            throw new Error('Cannot construct FileHandle from invalid input');
        }

        return new FileHandle(input.filename, input.content, input.contentType);
    }

    public contentHash(): string {
        const hash = require('crypto').createHash('sha256');
        hash.update(this.content_buffer);
        return hash.digest('hex');
    }
}
