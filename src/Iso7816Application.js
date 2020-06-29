"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const CommandApdu_1 = require("./CommandApdu");
const ResponseApdu_1 = require("./ResponseApdu");
const ins = {
    APPEND_RECORD: 0xE2,
    ENVELOPE: 0xC2,
    ERASE_BINARY: 0x0E,
    EXTERNAL_AUTHENTICATE: 0x82,
    GET_CHALLENGE: 0x84,
    GET_DATA: 0xCA,
    GET_RESPONSE: 0xC0,
    INTERNAL_AUTHENTICATE: 0x88,
    MANAGE_CHANNEL: 0x70,
    PUT_DATA: 0xDA,
    READ_BINARY: 0xB0,
    READ_RECORD: 0xB2,
    SELECT_FILE: 0xA4,
    UPDATE_BINARY: 0xD6,
    UPDATE_RECORD: 0xDC,
    VERIFY: 0x20,
    WRITE_BINARY: 0xD0,
    WRITE_RECORD: 0xD2
};
class Iso7816Application extends events_1.EventEmitter {
    constructor(card) {
        super();
        this.card = card;
    }
    issueCommand(commandApdu) {
        //console.log(`Iso7816Application.issueCommand '${commandApdu}' `);
        return this.card
            .issueCommand(commandApdu)
            .then(resp => {
            var response = new ResponseApdu_1.default(resp);
            //console.log(`status code '${response.statusCode()}'`);
            if (response.hasMoreBytesAvailable()) {
                //console.log(`has '${response.data.length}' more bytes available`);
                return this.getResponse(response.numberOfBytesAvailable()).then((resp) => {
                    resp = new ResponseApdu_1.default(resp);
                    return new ResponseApdu_1.default(response.getDataOnly() + resp.data);
                });
            }
            else if (response.isWrongLength()) {
                //console.log(`'le' should be '${response.correctLength()}' bytes`);
                commandApdu.setLe(response.correctLength());
                return this.issueCommand(commandApdu).then((resp) => {
                    resp = new ResponseApdu_1.default(resp);
                    return new ResponseApdu_1.default(response.getDataOnly() + resp.data);
                });
            }
            //console.log(`return response '${response}' `);
            //console.log(response)
            return response;
        });
    }
    ;
    selectFile(bytes, p1, p2) {
        //console.log(`Iso7816Application.selectFile, file='${bytes}'`);
        var commandApdu = new CommandApdu_1.default({
            cla: 0x00,
            ins: ins.SELECT_FILE,
            p1: p1 || 0x04,
            p2: p2 || 0x00,
            data: bytes
        });
        return this.issueCommand(commandApdu).then((response) => {
            if (response.isOk()) {
                this.emit('application-selected', {
                    application: bytes.toString('hex')
                });
            }
            return response;
        });
    }
    ;
    getResponse(length) {
        //console.log(`Iso7816Application.getResponse, length='${length}'`);
        return this.issueCommand(new CommandApdu_1.default({
            cla: 0x00,
            ins: ins.GET_RESPONSE,
            p1: 0x00,
            p2: 0x00,
            le: length
        }));
    }
    ;
    readRecord(sfi, record) {
        //console.log(`Iso7816Application.readRecord, sfi='${sfi}', record=${record}`);
        return this.issueCommand(new CommandApdu_1.default({
            cla: 0x00,
            ins: ins.READ_RECORD,
            p1: record,
            p2: (sfi << 3) + 4,
            le: 0
        }));
    }
    ;
    getData(p1, p2) {
        //console.log(`Iso7816Application.getData, p1='${p1}', p2=${p2}`);
        return this.issueCommand(new CommandApdu_1.default({
            cla: 0x00,
            ins: ins.GET_DATA,
            p1: p1,
            p2: p2,
            le: 0
        }));
    }
}
exports.Iso7816Application = Iso7816Application;
exports.default = Iso7816Application;
//# sourceMappingURL=Iso7816Application.js.map