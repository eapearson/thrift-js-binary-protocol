/*global
 define, describe, expect, it
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'thrift_echo_transport',
    'thrift_binary_protocol'
], function (Thrift) {
    'use strict';
    function listEquals(l1, l2) {
        var i,
            len1 = l1.length,
            len2 = l2.length;
        if (len1 !== len2) {
            return false;
        }
        for (i = 0; i < len1; i += 1) {
            if (l1[i] !== l2[i]) {
                return false;
            }
        }
        return true;
    }

    describe('Binary Protocol with XHR Transport', function () {
        /* Basic tests */

        it('Sets and gets a string', function () {
            var transport = new Thrift.EchoTransport(),
                protocol = new Thrift.TBinaryProtocol(transport),
                arg = 'hello';
            protocol.writeString(arg);
            var result = protocol.readString();
            expect(result.value).toBe(arg);
        });


        it('Sets and gets a binary (array of bytes)', function () {
            var arg = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                transport = new Thrift.EchoTransport(),
                protocol = new Thrift.TBinaryProtocol(transport);
            protocol.writeBinary(arg);
            var result = protocol.readBinary();
            expect(result.value).toEqual(arg);
        });

        it('Sets and gets a list of strings', function () {
            var transport = new Thrift.EchoTransport(),
                protocol = new Thrift.TBinaryProtocol(transport),
                listInfo, i, result,
                arg = ['peet', 'coco'],
                list = [];
            protocol.writeListBegin(Thrift.Type.STRING, 2);
            arg.forEach(function (pet) {
                protocol.writeString(pet);
            });
            protocol.writeListEnd();

            listInfo = protocol.readListBegin();
            for (i = 0; i < listInfo.size; i += 1) {
                result = protocol.readString();
                if (result) {
                    list.push(result.value);
                }
            }
            protocol.readListEnd();

            expect(list).toEqual(arg);
        });

        it('Set and get bool', function () {
            var transport = new Thrift.EchoTransport(),
                protocol = new Thrift.TBinaryProtocol(transport),
                arg = true;
            protocol.writeBool(arg);
            var result = protocol.readBool();
            expect(result.value).toBe(arg);
        });

        it('Set and get I16', function () {
            var transport = new Thrift.EchoTransport(),
                protocol = new Thrift.TBinaryProtocol(transport), arg = 10000;
            protocol.writeI16(arg);
            var result = protocol.readI16();
            expect(result.value).toBe(arg);
        });
        it('Set and get I32', function () {
            var transport = new Thrift.EchoTransport(),
                protocol = new Thrift.TBinaryProtocol(transport),
                arg = 10000;
            protocol.writeI32(arg);
            var result = protocol.readI32();
            expect(result.value).toBe(arg);
        });
        it('Set and get I64', function () {
            var transport = new Thrift.EchoTransport(),
                protocol = new Thrift.TBinaryProtocol(transport),
                arg = 10000;
            protocol.writeI64(arg);
            var result = protocol.readI64();
            expect(result.value).toBe(arg);
        });
    });
});