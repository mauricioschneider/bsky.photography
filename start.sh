#!/bin/sh

# Start Node.js backend in the background
node /app/dist/server.js &

# Start nginx in foreground
nginx -g 'daemon off;'
