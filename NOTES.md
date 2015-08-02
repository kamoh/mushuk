Architecture ideas

- Soundcloud API
- Any other free music APIs (if any good other ones are around)

Server

- Node, Express, Socket.io
- WebRTC? Mabye
-> Probably node

Next steps

1. Music API & requirements
	- Some music service for people to stream music from
	- Figuring out how to deliver stream to each user connected to a room.
2. Backend org for user names and active rooms
	- Database for user stuff
	- Server for listing rooms and directing peeps to stuff.
3. Client
	- Chat
	- Song Playback
	- Voting in/out
	- General Interface and User Management
4. P2P hosting 
 	- Which song is playing
 	- Syncing up the chat
 	- Managing connected users


- The bird:The word.
	- Host is certain person. Authoritative purposes. Can be bounced to someone on disconnect.
	- Everyone has personal queue, and when host has them at top of order, play that song.
	- Host controls votes, player order, permissions, etc...
	- Everyone has data parity, so if host disconnects, someone else can immediately continue stuff.