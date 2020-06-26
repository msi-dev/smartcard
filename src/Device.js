"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
const Card_1 = require("./Card");
const events_1 = require("events");
class Device extends events_1.EventEmitter {
    constructor(reader) {
        super();
        //console.log(`new Device(${reader})`);
        this.reader = reader;
        this.name = reader.name;
        this.card = null;
        const isCardInserted = (changes, reader, status) => {
            return (changes & reader.SCARD_STATE_PRESENT) && (status.state & reader.SCARD_STATE_PRESENT);
        };
        const isCardRemoved = (changes, reader, status) => {
            return (changes & reader.SCARD_STATE_EMPTY) && (status.state & reader.SCARD_STATE_EMPTY);
        };
        const cardInserted = (reader, status) => {
            reader.connect({ share_mode: 2 }, (err, protocol) => {
                if (err) {
                    this.emit('error', err);
                }
                else {
                    this.card = new Card_1.default(this, status.atr, protocol);
                    let start = Date.now();
                    setTimeout(() => {
                        const milli = Date.now() - start;
                        console.log('[on smartcard lib] card-inserted delay:', milli);
                        this.emit('card-inserted', { device: this, card: this.card });
                    }, 1000);
                }
            });
        };
        const cardRemoved = (reader) => {
            const name = reader.name;
            reader.disconnect(reader.SCARD_LEAVE_CARD, (err) => {
                if (err) {
                    this.emit('error', err);
                }
                else {
                    this.emit('card-removed', { name, card: this.card });
                    this.card = null;
                }
            });
        };
        reader.on('status', (status) => {
            var changes = reader.state ^ status.state;
            if (changes) {
                if (isCardRemoved(changes, reader, status)) {
                    cardRemoved(reader);
                }
                else if (isCardInserted(changes, reader, status)) {
                    cardInserted(reader, status);
                }
            }
        });
    }
    transmit(data, res_len, protocol, cb) {
        this.reader.transmit(data, res_len, protocol, cb);
    }
    getName() {
        return this.name;
    }
    toString() {
        return `${this.getName()}`;
    }
    reset(action, cb) {
        return this.reader.reconnect({ initialization: action }, cb);
    }
}
exports.Device = Device;
exports.default = Device;
//# sourceMappingURL=Device.js.map