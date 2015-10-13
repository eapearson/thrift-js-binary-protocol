/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/*global define */
/*jshint white: true */

define([
    'thrift-core'
], function (Thrift) {
    'use strict';

    /**
     * Constructor Function for the XHR transport.
     * If you do not specify a url then you must handle XHR operations on
     * your own. This type can also be constructed using the Transport alias
     * for backward compatibility.
     * @constructor
     * @param {string} [url] - The URL to connect to.
     * @classdesc The Apache Thrift Transport layer performs byte level I/O 
     * between RPC clients and servers. The JavaScript TXHRTransport object 
     * uses Http[s]/XHR. Target servers must implement the http[s] transport
     * (see: node.js example server_http.js).
     * @example
     *     var transport = new Thrift.TXHRTransport("http://localhost:8585");
     */
    Thrift.TXHRTransport = function (url, options) {
        this.url = url;
        this.wpos = 0;
        this.rpos = 0;
        this.useCORS = (options && options.useCORS);
        this.timeout = (options && options.timeout);
        this.send_buf = [];
        this.recv_buf = [];        
    };

    Thrift.TXHRTransport.prototype = {
        /**
         * Sends the current XRH request if the transport was created with a URL 
         * and the async parameter is false. If the transport was not created with
         * a URL, or the async parameter is True and no callback is provided, or 
         * the URL is an empty string, the current send buffer is returned.
         * @param {object} async - If true the current send buffer is returned.
         * @param {object} callback - Optional async completion callback 
         * @returns {undefined|string} Nothing or the current send buffer.
         * @throws {string} If XHR fails.
         */
        flush: function (async, callback) {
            // does nothing.
        },
        /**
         * 
         * @typedef {object} ThriftException
         * @property {string} type - The basic type of the error: always ThriftError
         *                           for exceptions thrown directly in this file.
         * @property {string} reason - the specific cause of the error
         * @property {string} message - an error message designed to be meaningful to a human developer
         * @property {object} data - an arbitrary data object which may be useful to the client for diagnosing the errror
         * 
         */
        /**
         * Creates a Prmoise-wrapped XHR object to be used for a Thrift server call.
         * @param {object} client - The Thrift Service client object generated by the IDL compiler.
         * @param {object} postData - The message to send to the server.
         * @param {function} args - The original call arguments with the success call back at the end.
         * @param {function} recv_method - The Thrift Service Client receive method for the call.
         * @returns {object} A Promises A+ compatible promise.
         * @throws {ThriftException} A thrift exception object describing the error.
         */

        jqRequest: function (client, postData, args, recv_method) {
            var thriftTransport = this,
                timeout = client.timeout || thriftTransport.timeout;

            // TODO: add notification for progress
            return new Promise(function (resolve, reject, notify) {
                var xhr = new XMLHttpRequest();

                xhr.onload = function (e) {
                    if (xhr.status === 502) {
                        reject({
                            type: 'ThriftError',
                            reason: 'ProxyError',
                            message: 'The thrift service is not running behind the proxy',
                            data: xhr
                        });
                        return;
                    } else if (xhr.status === 500) {
                        reject({
                            type: 'ThriftError',
                            reason: 'ServiceError',
                            message: 'The thrift service or proxy has crashed',
                            data: xhr
                        });
                        return;
                    } else if (xhr.status === 400) {
                        reject({
                            type: 'ThriftError',
                            reason: 'RequestError',
                            message: 'There was an error in the request',
                            data: xhr
                        });
                        return;
                    } else if (xhr.status === 404) {
                        reject({
                            type: 'ThriftError',
                            reason: 'NotFound',
                            message: 'The thrift service could not be contacted, incorrect request',
                            data: xhr
                        });
                        return;
                    } else if (xhr.status >= 400 && xhr.status < 500) {
                        reject({
                            type: 'ThriftError',
                            reason: 'GeneralClientError',
                            message: 'An error was reported, blamed on the client request',
                            data: xhr
                        });
                        return;
                    } else if (xhr.status >= 500) {
                        reject({
                            type: 'ThriftError',
                            reason: 'GeneralServerError',
                            message: 'An error was reported, blamed on the server',
                            data: xhr
                        });
                        return;
                    } else if (xhr.status !== 200) {
                        reject({
                            type: 'ThriftError',
                            reason: 'UnexpectedResponse',
                            message: 'The server responded with an unexpected code',
                            data: xhr
                        });
                        return;
                    }
                    var buf = new Uint8Array(xhr.response);
                    // thriftTransport.setRecvBuffer(this.responseText);
                    thriftTransport.setRecvBuffer(buf);
                    try {
                        resolve(recv_method.call(client));
                    } catch (ex) {
                        reject(ex);
                    }
                };
                xhr.ontimeout = function (e) {
                    reject({
                        type: 'ThriftError',
                        reason: 'RequestTimeout',
                        message: 'General request timeout',
                        suggestions: 'The service device is not reachable, the client tried until the timeout period expired',
                        data: xhr
                    });
                };
                xhr.onerror = function (e) {
                    reject({
                        type: 'ThriftError',
                        reason: 'RequestError',
                        message: 'General request error',
                        suggestions: 'The service device is operating, but the http server is unavailable.',
                        data: xhr
                    });
                };
                xhr.onabort = function (e) {
                    reject({
                        type: 'ThriftError',
                        reason: 'RequestAbort',
                        message: 'General request abort',
                        data: xhr
                    });
                };
                xhr.timeout = timeout;
                try {
                    xhr.open('POST', thriftTransport.url, true);
                } catch (ex) {
                    reject({
                        type: 'ThriftError',
                        reason: 'ConnectionOpenError',
                        message: 'Error opening connecting to to thrift http service',
                        suggestions: 'This is probably a malformed url',
                        data: xhr
                    });
                }

                xhr.timeout = timeout;
                try {
                    xhr.open('POST', thriftTransport.url, true);
                } catch (ex) {
                    reject({
                        type: 'ThriftError',
                        reason: 'ConnectionOpenError',
                        message: 'Error opening connecting to to thrift http service',
                        suggestions: 'This is probably a malformed url',
                        data: xhr
                    });
                }

                try {
                    xhr.setRequestHeader('Accept', 'application/x-thrift');
                    xhr.setRequestHeader('Content-type', 'application/x-thrift');
                    xhr.responseType = 'arraybuffer';
                    xhr.send(new Uint8Array(thriftTransport.send_buf));
                    // xhr.send(postData);
                } catch (ex) {
                    reject({
                        type: 'ThriftError',
                        reason: 'ConnectionSendError',
                        message: 'Error sending data to thrift http service',
                        suggestions: '',
                        data: xhr
                    });
                }
            });
        },
        /**
         * Sets the buffer to provide the protocol when deserializing.
         * @param {string} buf - The buffer to supply the protocol.
         */
        setRecvBuffer: function (buf) {
            this.recv_buf = buf;
            this.recv_buf_sz = this.recv_buf.length;
            this.wpos = this.recv_buf.length;
            this.rpos = 0;
        },
        /**
         * Returns true if the transport is open, XHR always returns true.
         * @readonly
         * @returns {boolean} Always True.
         */
        isOpen: function () {
            return true;
        },
        /**
         * Opens the transport connection, with XHR this is a nop.
         */
        open: function () {},
        /**
         * Closes the transport connection, with XHR this is a nop.
         */
        close: function () {},
        /**
         * Returns the specified number of characters from the response
         * buffer.
         * @param {number} len - The number of characters to return.
         * @returns {string} Characters sent by the server.
         */
        readByte: function () {
            var avail = this.wpos - this.rpos;
            if (avail === 0) {
                return null;
            }

            var ret = this.recv_buf[this.rpos];
            this.rpos += 1;

            //clear buf when complete?
            return ret;
        },
        read: function (len) {
            var avail = this.wpos - this.rpos;

            if (avail === 0) {
                return '';
            }

            var give = len;

            if (avail < len) {
                give = avail;
            }

            var ret = this.read_buf.substr(this.rpos, give);
            this.rpos += give;

            //clear buf when complete?
            return ret;
        },
        /**
         * Returns the entire response buffer.
         * @returns {string} Characters sent by the server.
         */
        readAll: function () {
            return this.recv_buf;
        },
        /**
         * Sets the send buffer to buf.
         * @param {string} buf - The buffer to send.
         */
        writeByte: function (b) {
            this.send_buf.push(b);
        },
        write: function (buf) {
            this.send_buf = buf;
        },
        /**
         * Returns the send buffer.
         * @readonly
         * @returns {string} The send buffer.
         */
        getSendBuffer: function () {
            return this.send_buf;
        }

    };
    
    return Thrift;
});







