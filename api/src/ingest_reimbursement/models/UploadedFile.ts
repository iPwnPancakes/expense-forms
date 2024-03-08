import { FileHandle } from "./FileHandle";

export interface UploadedFile {
    id: string;
    file: FileHandle;
    webViewLink: string;
}
