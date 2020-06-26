"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Devices = void 0;
const pcsclite = require('@msi.js/pcsclite');
const events_1 = require("events");
const Device_1 = require("./Device");
class Devices extends events_1.EventEmitter {
    constructor() {
        super();
        //console.log(`new Devices()`);
        this.pcsc = pcsclite();
        this.devices = {};
        this.pcsc.on('reader', (reader) => {
            const device = new Device_1.default(reader);
            this.devices[reader.name] = device;
            this.emit('device-activated', { device, devices: this.listDevices() });
            reader.on('end', () => {
                delete this.devices[reader.name];
                this.emit('device-deactivated', { device, devices: this.listDevices() });
            });
            reader.on('error', (error) => {
                this.emit('error', { reader, error });
            });
        });
        this.pcsc.on('error', (error) => {
            this.emit('error', { error });
        });
    }
    onActivated() {
        return new Promise((resolve, reject) => {
            this.on('device-activated', event => resolve(event));
        });
    }
    ;
    onDeactivated() {
        return new Promise((resolve, reject) => {
            this.on('device-deactivated', event => resolve(event));
        });
    }
    ;
    listDevices() {
        return Object.keys(this.devices).map((k) => this.devices[k]);
    }
    ;
    lookup(name) {
        return this.devices[name];
    }
    ;
    toString() {
        return `Devices('${this.listDevices()}')`;
    }
}
exports.Devices = Devices;
exports.default = Devices;
//# sourceMappingURL=Devices.js.map