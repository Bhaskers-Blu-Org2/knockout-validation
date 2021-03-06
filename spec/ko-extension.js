var ko = require('knockout');
var chai = require('chai');
var sinon = require('sinon');
var Custom = require('../js/validators/custom');
require('../js/ko-extension');

chai.use(require('sinon-chai'));
var expect = chai.expect;

describe('knockout extension', function () {
  var obBlock = null;
  var obNonblock = null;
  var isValid = null;
  var message = 'Always fail';

  beforeEach(function () {
    isValid = sinon.spy(function () {
      return false;
    });

    obBlock = ko.observable().extend({
      validate: [new Custom(isValid, message, true)],
    });

    obNonblock = ko.observable().extend({
      validate: [new Custom(isValid, message, false)],
    });
  });

  it('should add an isValid method to knockout observables', function () {
    expect(obBlock.isValid).to.be.a('function');
    expect(obNonblock.isValid).to.be.a('function');
  });

  it('should has an errors property as ko.observableArray', function () {
    expect(obBlock.errors).to.be.a('function');
    expect(ko.isObservable(obBlock.errors)).to.be.true;
    expect(obNonblock.errors).to.be.a('function');
    expect(ko.isObservable(obNonblock.errors)).to.be.true;
  });

  it('should add a validate method to knockout observable', function () {
    expect(obBlock.validate).to.be.a('function');
    expect(obNonblock.validate).to.be.a('function');
  });

  it('should validate on set', function () {
    obBlock('foo');
    expect(isValid).to.be.calledOnce;
    obNonblock('bar');
    expect(isValid).to.be.calledTwice;
  });

  it('should block changing the observable if blockInput is on', function () {
    obBlock('foo');
    expect(obBlock()).not.to.exist;
    expect(obBlock.errors()).to.deep.equal([]);
  });

  it('should not block changing the observable if blockInput is off', function () {
    obNonblock('bar');
    expect(obNonblock()).to.equal('bar');
    expect(obNonblock.errors()).to.deep.equal([message]);
  });

  it('should cause no error when no validator passed in', function () {
    expect(function () {
      ko.observable().extend({ validate: null });
    }).to.not.throw();
  });

  it('should validate value after process when not block input', function () {
    var validator = new Custom(isValid, message, false);
    validator.process = sinon.stub().returns('processed');

    var ob = ko.observable().extend({
      validate: [validator],
    });

    ob('foo');

    expect(isValid).to.be.calledOnce.and.calledWith('processed');
    expect(ob()).be.equal('processed');
    expect(ob.errors()[0]).to.be.equal(message);
  });

  it('should set error as return value of message function', function () {
    var validator = new Custom(isValid, function (value) {
      return value + ': ' + message;
    }, false);

    var ob = ko.observable().extend({
      validate: [validator],
    });

    ob('foo');

    expect(ob.errors()[0]).to.be.equal('foo: ' + message);
  });

  describe('observable.validate', function () {
    it('should validate the value immediately', function () {
      var result = obNonblock.validate();
      expect(isValid).to.be.calledOnce;
      expect(result).to.be.false;
    });
  });
});
