export class Response {
    readonly status: number;
    readonly message: string;
    readonly data: any;
    readonly paging?: any;
    readonly code?: number;

    constructor(status: number, message: string, data: any, paging?: any, code?: number) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.paging = paging;
        this.code = code;
    }
}
