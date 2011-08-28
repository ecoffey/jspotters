# Node Abode Node.js Knockout Entry

A simple, multiplayer snake game

# Deployment

It's a socket.io app and performs best with websockets. It can be run
using `npm start` with no arguments. If the environment is set to
production it will run on port 80; otherwise it will run on port 7777.

## Linode Setup

It's running on Linode under a tmux session. To restart:

* log in as root
* run `tmux attach -d`
* type `Ctrl-C`
* run the last command (`NODE_ENV=production node server.js` in `/home/deploy/app/source`)

