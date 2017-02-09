#!/usr/bin/env node

'use strict'

if (!process.env.DIGITAL_OCEAN_TOKEN || !process.env.SERVER_NAME) {
  console.error('Missing required environment variables: DIGITAL_OCEAN_TOKEN or SERVER_NAME')
} else {
  require('./lib')().catch((error) => console.error(error))
}
