import Card from './Card';
import { EventEmitter } from 'events';


export class Device extends EventEmitter {
    public reader: any;
    public name: string;
    public card: Card;
    private readonly SCARD_STATE_UNPOWERED : number  = 0x0400;
    private readonly SCARD_STATE_POWERED : number  = 0x0100;

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

        const isCardReseted = (changes, reader, status) => {
            return (reader.state & this.SCARD_STATE_UNPOWERED) && (changes & this.SCARD_STATE_POWERED) && (status.state & this.SCARD_STATE_POWERED);
        };


        reader.on('status', async (status) => {
        console.log(`Device -> constructor -> status`, status)
            var changes = reader.state ^ status.state;
            if (changes) {
                if (isCardRemoved(changes, reader, status)) {
                    this.cardRemoved(reader);
                } else if (isCardInserted(changes, reader, status)) {
                    setTimeout(() => {
                        this.cardInserted(reader, status);
                    }, 1000);
                } else if(isCardReseted(changes, reader, status)) {
                    await this.cardRemoved(reader)
                    this.cardInserted(reader, status);

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
                } else {
                    this.card = new Card(this, status.atr, protocol);
                    this.emit('card-inserted', { device: this, card: this.card });
                    resolve();
                }
            });
        });
    };

    cardRemoved(reader) {
        const name = reader.name;
        return new Promise((resolve, reject) => {
            reader.disconnect(reader.SCARD_LEAVE_CARD, (err) => {
                if (err) {
                    this.emit('error', err);
                    reject(err);
                } else {
                    this.emit('card-removed', { name, card: this.card });
                    this.card = null;
                    resolve();
                }
            });
        })
    };


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

export default Device;