# NodeJS-WebRTC-signaling-server
The NodeJS WebRTC Signaling Server built using Node.js, Express, and Socket.IO. Its primary purpose is to facilitate real-time communication between peers in a WebRTC environment on the frontend. This signaling server acts as an intermediary to exchange SDP offers and answers, enabling seamless peer-to-peer communication.

## Features

- **Real-Time Signaling:** The signaling server establishes a WebSocket-based communication channel through Socket.IO, allowing peers to exchange SDP offers and answers in real-time.

- **Room-based Environment:** Peers can create or join rooms to initiate or participate in WebRTC sessions. This room-based approach ensures secure and isolated communication between specific sets of peers.

## How It Works

1. A peer (usually the initiator) creates a room by sending a request to the server with a unique room name.
2. Other peers who want to participate in the WebRTC session send a request to join the same room.
3. The signaling server handles the room-based communication and relays SDP offers and answers between the peers using WebSocket connections.
4. Peers use the received SDP data to establish direct peer-to-peer WebRTC connections on the frontend.

## Related Repositories
- [Frontend Repository](https://github.com/AbubakarWebDev/ReactJS-WebRTC-file-sharing-system): This repository holds the frontend code that integrates with this signaling server. For a complete understanding and to see our WebRTC implementation in action, be sure to check out the frontend repo as well.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

You'll need [Git](https://git-scm.com), and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

```
node@18.13.0 or higher
npm@9.2.0 or higher
git@2.39.0 or higher
```

## Clone the repo

```shell
git clone https://github.com/AbubakarWebDev/NodeJS-WebRTC-signaling-server
cd NodeJS-WebRTC-signaling-server
```

## Install npm packages

Install the `npm` packages described in the `package.json` and verify that it works:

```shell
npm install
npm run dev
```

## Contribution

Please feel free to contribute to this open-source project, report issues, and suggest improvements. Let's make file sharing smarter and more convenient together!

## License

This project is licensed under the [MIT License](LICENSE).
