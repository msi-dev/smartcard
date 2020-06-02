/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Iso7816Application extends EventEmitter {
    card: any;
    constructor(card: any);
    issueCommand(commandApdu: any): any;
    selectFile(bytes: any, p1: any, p2: any): any;
    getResponse(length: any): any;
    readRecord(sfi: any, record: any): any;
    getData(p1: any, p2: any): any;
}
export default Iso7816Application;
