var assert = require('assert'),
    fs = require('fs'),
    net = require('net'),
    path = require('path'),
    assert = require('chai').assert,
    EverSocket = require('../index').EverSocket;


describe("EverSocket", function() {
  var port = 4999;
  var server;
  var socket;

  beforeEach(function() {
    server = net.createServer();
    server.listen(port);
    socket = new EverSocket({ type: 'tcp4', reconnectWait: 1 });
  });

  afterEach(function() {
    try {
      socket.destroy();
    } catch(e) {}
    try {
      server.close();
    } catch(e) {}
  });

  it('should connect', function(done) {
    var serverConnected = false;
    var clientConnected = false;
    server.on('connection', function() {
      serverConnected = true;
    });
    socket.on('connect', function() {
      clientConnected = true;
    });
    socket.connect(port);
    setTimeout(function() {
      assert.isTrue(serverConnected);
      assert.isTrue(clientConnected);
      done();
    }, 10);
  });

  it('should reconnect', function(done) {
    server.once('connection', function() {
      setTimeout(function() {
        server.once('connection', function() {
          done()
        });
        socket.destroy();
      }, 10)
    });
    socket.connect(port);
  });

  it('should not reconnect after cancel', function(done) {
    server.once('connection', function() {
      setTimeout(function() {
        server.once('connection', function() {
          assert.isTrue(false, 'should not have reconnected');
        });
        setTimeout(done, 100);
        socket.cancel();
        socket.destroy();
      }, 10)
    });
    socket.connect(port);
  });

});
