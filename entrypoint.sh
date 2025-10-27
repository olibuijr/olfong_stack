#!/bin/sh
set -e

# Try npm start, fallback to other commands or keep running
npm start 2>&1 || npm run dev 2>&1 || node server.js 2>&1 || exec tail -f /dev/null
