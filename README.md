# Node Abode Node.js Knockout Entry

A simple, multiplayer snake game

# Deployment

It's a socket.io app and performs best with websockets. It can be run
using `npm start` with no arguments. If the environment is set to
production it will run on port 80; otherwise it will run on port 7777.

## Linode Setup

To deploy the new code run `./deploy linode -T`. `-T` skips the test step.
Unfortunately it doesn't restart the server like it should, so it's
running under a tmux session. To restart:

* log in as root
* run `tmux attach -d`
* type `Ctrl-C`
* run the last command (`NODE_ENV=production node server.js` in `/home/deploy/app/source`)

