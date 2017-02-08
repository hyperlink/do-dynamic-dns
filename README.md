# Dynamic DNS client for Digital Ocean

[![Greenkeeper badge](https://badges.greenkeeper.io/hyperlink/do-dynamic-dns.svg)](https://greenkeeper.io/)

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

