"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        reader.on('status', async (status) => {
            var changes = reader.state ^ status.state;
            if (changes) {
                if (isCardRemoved(changes, reader, status)) {
                    this.cardRemoved(reader);
                }
                else if (isCardInserted(changes, reader, status)) {
                    this.cardInserted(reader, status);
                }
                else if (!(changes & reader.SCARD_STATE_PRESENT) && (status.state & reader.SCARD_STATE_PRESENT)) {
                    if (this.card && status.atr && this.card.atr !== status.atr.toString('hex')) {
                        console.log(`Device -> constructor -> status.state`, status.state);
                        console.log(`Device -> constructor -> changes`, changes);
                        await this.cardRemoved(this.reader);
                        await this.cardInserted(reader, status);
                    }
                }
            }
        });
    }
    cardInserted(reader, status) {
        return new Promise((resolve, reject) => {
            reader.connect({ share_mode: 2 }, (err, protocol) => {
                if (err) {
                    this.emit('error', err);
                    reject(err);
                }
                else {
                    this.card = new Card_1.default(this, status.atr, protocol);
                    this.emit('card-inserted', { device: this, card: this.card });
                    resolve();
                }
            });
        });
    }
    ;
    cardRemoved(reader) {
        const name = reader.name;
        return new Promise((resolve, reject) => {
            reader.disconnect(reader.SCARD_LEAVE_CARD, (err) => {
                if (err) {
                    this.emit('error', err);
                    reject(err);
                }
                else {
                    this.emit('card-removed', { name, card: this.card });
                    this.card = null;
                    resolve();
                }
            });
        });
    }
    ;
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