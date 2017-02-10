#!/usr/bin/env node

'use strict'

const updateNotifier = require('update-notifier')
const pkg = require('./package')

updateNotifier({pkg}).notify()

if (!process.env.DIGITAL_OCEAN_TOKEN || !process.env.SERVER_NAME) {
  console.error('Missing required environment variables: DIGITAL_OCEAN_TOKEN or SERVER_NAME')
} else {
  require('./lib')().catch((error) => console.error(error))
}
