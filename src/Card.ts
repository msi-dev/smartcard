import {EventEmitter} from 'events';
import ResponseApdu from './ResponseApdu';

export class Card extends EventEmitter {
    public device: any;
    public protocol: any;
    public atr: any;
    constructor(device, atr, protocol) {
        super();
        //console.log(`new Card(${device}, ${reader}, ${status})`);
        this.device = device;
        this.protocol = protocol;
        this.atr = atr.toString('hex');
    }

    getAtr() {
        return this.atr;
    }

    toString() {
        return `Card(atr:'${this.atr}')`;
    }

    issueCommand(commandApdu, callback) {
        let buffer = commandApdu;
        if (Array.isArray(commandApdu)) {
            buffer = Buffer.from(commandApdu);
        } else if (typeof commandApdu === 'string') {
            buffer = Buffer.from(commandApdu, 'hex');
        } else if (Buffer.isBuffer(commandApdu)) {
            buffer = commandApdu;
        } else {
            buffer = commandApdu.toBuffer();
        }

        const protocol = this.protocol;

        this.emit('command-issued', {card: this, command: buffer});
        if (callback) {
            this.device.transmit(buffer, 0x102, protocol, (err, response) => {
                this.emit('response-received', {
                    card: this,
                    command: buffer,
                    response: new ResponseApdu(response)
                });
                callback(err, response);
            });
        } else {
            return new Promise((resolve, reject) => {
                this.device.transmit(buffer, 0x102, protocol, (err, response) => {
                    if (err) reject(err);
                    else {
                        this.emit('response-received', {
                            card: this,
                            command: buffer,
                            response: new ResponseApdu(response)
                        });
                        resolve(response);
                    }
                });
            });
        }
    };

    reset(action, callback) {
        if (callback) {
            this.device.reset(action, (err, response) => {
                callback(err, response);
            });
        } else {
            return new Promise((resolve, reject) => {
                this.device.reset(action, (err, response) => {
                    if (err) return reject(err);
                    resolve(this);
                });
            })
        }

    }
}

export default Card;