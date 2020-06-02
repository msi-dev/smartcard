/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Device extends EventEmitter {
    reader: any;
    name: any;
    card: any;
    constructor(reader: any);
    transmit(data: any, res_len: any, protocol: any, cb: any): void;
    getName(): any;
    toString(): string;
    reset(action: any, cb: any): any;
}
export default Device;
