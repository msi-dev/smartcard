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
            return (changes & reader.SCARD_STATE_PRESENT) &&  !(status.state & this.SCARD_STATE_UNPOWERED) && (status.state & reader.SCARD_STATE_PRESENT);
        };

        const isCardRemoved = (changes, reader, status) => {
            return (changes & reader.SCARD_STATE_EMPTY) && (status.state & reader.SCARD_STATE_EMPTY);
        };

        const isCardReseted = (changes, reader, status) => {
            return ((reader.state & this.SCARD_STATE_UNPOWERED) && (changes & this.SCARD_STATE_POWERED) && (status.state & this.SCARD_STATE_POWERED));
            // || ((!changes) && (status.state & this.SCARD_STATE_POWERED) && (status.state & reader.SCARD_STATE_PRESENT));;
        };


        reader.on('status', async (status) => {
            var changes = reader.state ^ status.state;
            console.log('----------------------------------')
            console.log(`changes`, changes.toString(16))
            console.log(`reader.state`, reader.state?.toString(16))
            console.log(`card.state`, status.state?.toString(16))
            console.log('card atr', status.atr.toString('hex'))
            if (changes) {
                if (isCardRemoved(changes, reader, status)) {
                    console.log('Removing card!')
                    this.cardRemoved(reader);
                } else if (isCardInserted(changes, reader, status)) {
                    console.log('Inserting card!')
                    setTimeout(() => {
                        this.cardInserted(reader, status);
                    }, 1000);
                } else if(isCardReseted(changes, reader, status)) {
                    console.log('Reseting card!')
                    await this.cardRemoved(reader)
                    this.cardInserted(reader, status);

                }
            }
        });
    }

    cardInserted(reader, status) {
        return new Promise((resolve, reject) => {
            reader.connect({ share_mode: 2 }, (err, protocol) => {
                if(!protocol) //not the right fix, buy may be a safeguard for it
                    reject();
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
        this.reader.state = (this.reader.state & ~this.SCARD_STATE_POWERED) | this.SCARD_STATE_UNPOWERED;
        return this.reader.reconnect({ initialization: action }, cb);
    }
}

export default Device;