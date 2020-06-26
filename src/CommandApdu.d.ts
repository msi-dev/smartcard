/// <reference types="node" />
export declare class CommandApdu {
    bytes: any;
    constructor(obj: any);
    toString(): string;
    toByteArray(): any;
    toBuffer(): Buffer;
    setLe(le: any): void;
    private toHexString;
}
export default CommandApdu;
