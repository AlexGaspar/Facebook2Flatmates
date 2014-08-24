/* global it, describe*/

'use strict';

var assert = require("assert");
var chai   = require("chai");

var expect = chai.expect;

var Facebook2flatmates = require('../index.js');


describe('Facebook2flatmates', function() {
    it('should throw error if group id is not a number', function() {
        expect(function() {
            new Facebook2flatmates();
        }).to.throw(Error);
    });
});
