/* eslint-env node, mocha */

'use strict'

const sinon = require('sinon')
require('sinon-as-promised')
const proxyquire = require('proxyquire').noCallThru()
const assert = require('assert')

describe('Dynamic DNS Client', function () {
  const client = {
    domains: {
      listRecords: function () { throw new Error('not stubbed') },
      updateRecord: function () { throw new Error('not stubbed') }
    }
  }

  const publicIp = {
    v4: function () { throw new Error('not stubbed') }
  }

  let sandbox, dnsClient

  before(function () {
    dnsClient = proxyquire('../lib', {
      'public-ip': publicIp,
      'digitalocean': {
        client: function () {
          return client
        }
      }
    })
  })

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
    process.env = {}
  })

  it('should do nothing if IP does not change', function () {
    process.env = {
      DIGITAL_OCEAN_TOKEN: 'xxxx',
      SERVER_NAME: 'server.example.com'
    }

    sandbox.stub(publicIp, 'v4').resolves('10.0.1.23')
    sandbox.stub(client.domains, 'listRecords').resolves([
      {
        id: 123,
        type: 'A',
        name: 'server',
        data: '10.0.1.23',
        priority: null,
        port: null,
        weight: null
      },
      {
        id: 124,
        type: 'NS',
        name: '@',
        data: 'ns1.digitalocean.com',
        priority: null,
        port: null,
        weight: null
      }
    ])

    sandbox.stub(client.domains, 'updateRecord')

    return dnsClient().then(function () {
      sinon.assert.calledOnce(publicIp.v4)
      sinon.assert.calledWithExactly(client.domains.listRecords, 'example.com')
      sinon.assert.notCalled(client.domains.updateRecord)
    })
  })

  it('should update domain record if IP does change', function () {
    process.env = {
      DIGITAL_OCEAN_TOKEN: 'xxxx',
      SERVER_NAME: 'server.example.com'
    }

    sandbox.stub(publicIp, 'v4').resolves('10.0.1.15')
    sandbox.stub(client.domains, 'listRecords').resolves([
      {
        id: 123,
        type: 'A',
        name: 'server',
        data: '10.0.1.23',
        priority: null,
        port: null,
        weight: null
      },
      {
        id: 124,
        type: 'NS',
        name: '@',
        data: 'ns1.digitalocean.com',
        priority: null,
        port: null,
        weight: null
      }
    ])

    sandbox.stub(client.domains, 'updateRecord')

    return dnsClient().then(function () {
      sinon.assert.calledOnce(publicIp.v4)
      sinon.assert.calledWithExactly(client.domains.listRecords, 'example.com')
      sinon.assert.calledWithExactly(client.domains.updateRecord, 'example.com', 123, {
        name: 'server',
        type: 'A',
        data: '10.0.1.15'
      })
    })
  })

  it('should fail if unable to find domain record', function () {
    process.env = {
      DIGITAL_OCEAN_TOKEN: 'xxxx',
      SERVER_NAME: 'server.example.com'
    }

    sandbox.stub(publicIp, 'v4').resolves('10.0.1.15')
    sandbox.stub(client.domains, 'listRecords').resolves([
      {
        id: 124,
        type: 'NS',
        name: '@',
        data: 'ns1.digitalocean.com',
        priority: null,
        port: null,
        weight: null
      }
    ])

    sandbox.stub(client.domains, 'updateRecord')

    return dnsClient()
      .then(function () {
        throw new Error('Expected promise to fail!')
      })
      .catch(function (error) {
        assert.equal(error.message, 'Unable to find domain A record for subdomain "server" and domain "example.com"')
        sinon.assert.calledOnce(publicIp.v4)
        sinon.assert.calledWithExactly(client.domains.listRecords, 'example.com')
        sinon.assert.notCalled(client.domains.updateRecord)
      })
  })

  it('should exit if required environment variables are not set', function () {
    sandbox.stub(console, 'error')
    require('../')
    sinon.assert.calledWithExactly(console.error, 'Missing required environment variables: DIGITAL_OCEAN_TOKEN or SERVER_NAME')
  })
})
