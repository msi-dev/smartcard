/*
CASE    COMMAND     RESPONSE
1       NO DATA     NO DATA
2       DATA        NO DATA
3       NO DATA     DATA
4       DATA        DATA
*/

export class CommandApdu {
    public bytes: any;
    constructor(obj: any) {

        if (obj.bytes) {

            this.bytes = obj.bytes;
            
        } else {

            let size = obj.size;
            let cla = obj.cla;
            let ins = obj.ins;
            let p1 = obj.p1;
            let p2 = obj.p2;
            let data = obj.data;
            let le = obj.le; // maybe allowing for this to be undefined is easier to understand 
            let lc;

            // transform data from Buffer to js Array (why?), allow for string (necessary? where?)
            if (obj.data) {
                if (Buffer.isBuffer(obj.data)) data = [...obj.data];
                else if (typeof obj.data === 'string') {
                    obj.data = obj.data.length % 2 !== 0 ? '0' + obj.data : obj.data;
                    const buf = new Buffer(obj.data, 'hex');
                    data = [...buf];
                }
            }

            // case 1
            if (!size && !data && !le) {
                //le = -1;
                //console.info('case 1');
                size = 4;
            }
            // case 2
            else if (!size && !data) {
                //console.info('case 2');
                size = 4 + 2;
            }

            // case 3
            else if (!size && !le) {
                //console.info('case 3');
                size = data.length + 5 + 4;
                //le = -1;
            }

            // case 4
            else if (!size) {
                //console.info('case 4');
                size = data.length + 5 + 4;
            }

            // set data
            if (data) {
                lc = data.length;
            } else {
                // uncommented next line (length content byte should be 0 if data present)
                lc = 0;
            }

            this.bytes = [];
            this.bytes.push(cla);
            this.bytes.push(ins);
            this.bytes.push(p1);
            this.bytes.push(p2);

            if (data) {
                this.bytes.push(lc);
                this.bytes = this.bytes.concat(data);
            }

            // added important logic: le byte should not be present in every apdu
            if (le) {
                this.bytes.push(le);
            } else if (!data) {
                this.bytes.push(lc);
            }
        }
    }

    toString() {
        return Buffer.isBuffer(this.bytes) ? this.bytes.toString('hex') : this.bytes;
    }

    toByteArray() {
        return this.bytes;
    }

    toBuffer() {
        return new Buffer(this.bytes);
    }

    setLe(le) {
        this.bytes.pop();
        this.bytes.push(le);
    }
}

export default CommandApdu;