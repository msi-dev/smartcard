/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Devices extends EventEmitter {
    pcsc: any;
    devices: any;
    constructor();
    onActivated(): Promise<unknown>;
    onDeactivated(): Promise<unknown>;
    listDevices(): any[];
    lookup(name: any): any;
    toString(): string;
}
export default Devices;
