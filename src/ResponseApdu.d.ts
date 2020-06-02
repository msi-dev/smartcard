export declare class ResponseApdu {
    data: string;
    constructor(buffer: any);
    meaning(): any;
    getDataOnly(): string;
    getStatusCode(): string;
    isOk(): boolean;
    buffer(): () => any;
    hasMoreBytesAvailable(): boolean;
    numberOfBytesAvailable(): number;
    isWrongLength(): boolean;
    correctLength(): number;
    toString(): string;
}
export default ResponseApdu;
