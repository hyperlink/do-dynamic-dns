# Dynamic DNS client for Digital Ocean

[![Build Status](https://travis-ci.org/hyperlink/do-dynamic-dns.svg?branch=master)](https://travis-ci.org/hyperlink/do-dynamic-dns) [![Greenkeeper badge](https://badges.greenkeeper.io/hyperlink/do-dynamic-dns.svg)](https://greenkeeper.io/) [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)

## What it does

1. Get current public IP address
2. Compares it to subdomain A record
3. If different update a subdomain A record with current IP address

## Install

```
npm install -g doddns
```

### Create a script to launch it:

```
#!/bin/bash
export SERVER_NAME=home_server.example.com
export DIGITAL_OCEAN_TOKEN=xxxxxxx
doddns
```

### Throw it in your crontab

