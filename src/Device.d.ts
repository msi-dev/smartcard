/// <reference types="node" />
import Card from './Card';
import { EventEmitter } from 'events';
export declare class Device extends EventEmitter {
    reader: any;
    name: string;
    card: Card;
    constructor(reader: any);
    cardInserted(reader: any, status: any): Promise<unknown>;
    cardRemoved(reader: any): Promise<unknown>;
    transmit(data: any, res_len: any, protocol: any, cb: any): void;
    getName(): string;
    toString(): string;
    reset(action: any, cb: any): any;
}
export default Device;
