/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Card extends EventEmitter {
    device: any;
    protocol: any;
    atr: any;
    constructor(device: any, atr: any, protocol: any);
    getAtr(): any;
    toString(): string;
    issueCommand(commandApdu: any, callback: any): Promise<unknown>;
    reset(action: any, callback: any): Promise<unknown>;
}
export default Card;
