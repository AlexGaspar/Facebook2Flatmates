/* global it, describe*/

'use strict';

var assert = require("assert");
var chai   = require("chai");

var expect = chai.expect;

var Facebook2flatmates = require('../index.js');


describe('Facebook2flatmates', function() {
    it('should throw an error if group id is missing', function() {
        expect(function() {
            new Facebook2flatmates();
        }).to.throw(Error);
    });

    it('should throw an error if no facebook token are provided', function() {
        expect(function() {
            new Facebook2flatmates(11223344);
        }).to.throw(Error);
    });

    it('should start', function() {
         var a = new Facebook2flatmates(1347450380, {});
    });
});
