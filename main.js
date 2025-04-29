import { db, auth } from './firebase-init.js';
import { ref, set, update, push, get, onValue } from 'firebase/database';

// Variables for game state
let playerHand = [];
let currentPlayer = 'player_1';
let gameId;

// Create room
document.getElementById('create-room').addEventListener('click', () => {
  const roomName = prompt("Enter a name for your room:");
  if (roomName) {
    const gameRef = ref(db, 'games/');
    const newGameRef = push(gameRef);
    gameId = newGameRef.key;

    set(newGameRef, {
      room_data: {
        room_name: roomName,
        max_players: 5,
        current_players: 1,
        players: {
          player_1: {
            id: auth.currentUser.uid,
            name: "Player 1",
            status: "active",
            profile_pic: "default.jpg",
          }
        }
      },
      game_state: "waiting",
      current_turn: "player_1",
      bots: 0,
    }).then(() => {
      window.location.href = `/game/${gameId}`;
    });
  }
});

// Join room
document.getElementById('join-room').addEventListener('click', () => {
  const roomId = prompt("Enter the room ID to join:");
  const gameRef = ref(db, `games/${roomId}/room_data`);
  
  get(gameRef).then(snapshot => {
    if (snapshot.exists() && snapshot.val().current_players < 5) {
      const playerId = `player_${snapshot.val().current_players + 1}`;
      const updatedPlayers = snapshot.val().players;
      updatedPlayers[playerId] = {
        id: auth.currentUser.uid,
        name: `Player ${snapshot.val().current_players + 1}`,
        status: "active",
        profile_pic: "default.jpg",
      };

      update(ref(db, `games/${roomId}/room_data`), {
        current_players: snapshot.val().current_players + 1,
        players: updatedPlayers,
      });

      window.location.href = `/game/${roomId}`;
    } else {
      alert("Room is full or doesn't exist.");
    }
  });
});

// Fetch and update game state (player hand, current card, etc.)
const gameRef = ref(db, `games/${gameId}/`);
onValue(gameRef, (snapshot) => {
  const gameData = snapshot.val();
  updateGameBoard(gameData);
});

function updateGameBoard(gameData) {
  document.getElementById('top-card').innerHTML = gameData.discard_pile.slice(-1)[0]; // Show top card
  document.getElementById('player-hand').innerHTML = playerHand.join(', '); // Display player cards
}

// Draw a card
document.getElementById('draw-card').addEventListener('click', () => {
  const newCard = getRandomCard();
  playerHand.push(newCard);
  update(gameRef, {
    [`games/${gameId}/players/${currentPlayer}/cards`]: playerHand,
  });
});

// Play a card
document.getElementById('play-card').addEventListener('click', () => {
  const cardToPlay = playerHand[0]; 
  playerHand.shift(); // Remove the played card from hand

  update(gameRef, {
    discard_pile: [...gameData.discard_pile, cardToPlay],
    [`games/${gameId}/players/${currentPlayer}/cards`]: playerHand,
    current_turn: currentPlayer === 'player_1' ? 'player_2' : 'player_1',
  });
});

// Bot management
function addBots(gameId, numBots) {
  const gameRef = ref(db, `games/${gameId}/room_data`);
  get(gameRef).then(snapshot => {
    let currentPlayers = snapshot.val().players;
    let botCount = 0;

    while (botCount < numBots) {
      const botId = `player_${snapshot.val().current_players + 1}`;
      currentPlayers[botId] = {
        id: `bot_${botCount}`,
        name: `Bot ${botCount + 1}`,
        status: "active",
        profile_pic: "default_bot.jpg",
      };

      botCount++;
    }

    update(gameRef, {
      players: currentPlayers,
      bots: numBots,
    });
  });
}

// Profile settings
document.getElementById('change-profile-pic').addEventListener('click', () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const storage = getStorage();
      const storagePath = `profile_pics/${auth.currentUser.uid}`;
      const picRef = storageRef(storage, storagePath);

      uploadBytes(picRef, file).then(() => {
        getDownloadURL(picRef).then((url) => {
          update(ref(db, `players/${auth.currentUser.uid}`), {
            profile_pic: url
          }).then(() => {
            document.getElementById('profile-picture').src = url;
          });
        });
      });
    }
  });
  
  fileInput.click();
});