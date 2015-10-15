# Javascript clients for Apache Thrift

An implementation of and XMLHttpRequest transport and TBinaryProtocol for JavaScript Thrift library.

## History

- The binary protocol was lifted from:
- The XMLHttpRequest and other transports extracted from the Thrift core

As we began to integrate the Thrift javascript client for our service apis, it was discovered that the javascript components in both the Thrift core, as well as the most advanced binary protocol implementation, both suffered from problems. The Thrift core javascript was too tied into the JSON protocol implementation found therein, and included code that we would never use. E.g. the 


## Running tests

TO BE DONE

## Usage


`Thrift.BinaryProtocol` depends on `thrift` library being present.

    <script src="thrift.js"></script>
    <script src="thrift-js-binary-protocol.js"></script>
    <script>
      var transport = new Thrift.Transport("/dummy");
      var protocol  = new Thrift.TBinaryProtocol(transport);
      ...
    </script>

All methods of the standard `TBinaryProtocol` are implemented.

PROVIDE REFERENCE to Thrift protocol definitions

## License

The MIT License (MIT)

Copyright (c) 2015 Radoslaw Gruchalski <radek@gruchalski.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
