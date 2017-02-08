'use strict'

const _ = require('lodash')
const digitalocean = require('digitalocean')
const publicIp = require('public-ip')
const Promise = require('bluebird')

module.exports = function () {
  const currentIpAddress = Promise.try(() => publicIp.v4())
  const client = digitalocean.client(process.env.DIGITAL_OCEAN_TOKEN)
  const domainName = process.env.SERVER_NAME
  const parts = domainName.split('.')
  const domain = parts.slice(1).join('.')
  const subDomain = parts[0]
  const domainRecordPromise = getDomainRecord(client, subDomain, domain)

  return Promise.join(domainRecordPromise, currentIpAddress, (record, currentIp) => {
    console.log(`existing IP: ${record.ip}\ncurrent IP: ${currentIp}`)

    if (record.ip !== currentIp) {
      console.log(`IP needs to be updated to ${currentIp}`)
      return client.domains.updateRecord(domain, record.id, {
        name: subDomain,
        type: 'A',
        data: currentIp
      })
    } else {
      console.log('Does not need to be updated')
    }
  })
}

function getDomainRecord (client, subDomain, domain) {
  return Promise.try(() => client.domains.listRecords(domain))
    .then(records => _(records).filter({type: 'A', name: subDomain}).first())
    .then(record => {
      if (record == null) {
        throw new Error(`Unable to find domain A record for subdomain "${subDomain}" and domain "${domain}"`)
      }

      return {
        id: record.id,
        ip: record.data
      }
    })
}
