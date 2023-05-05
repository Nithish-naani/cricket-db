const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("This Server is Running in http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//All Players
app.get("/players/", async (request, response) => {
  const playersQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(playersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
//New Player
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const newPlayerQuery = `INSERT INTO 
  cricket_team(player_name, jersey_number, role)
  VALUES('${playerName}', '${jerseyNumber}', '${role}');
  `;
  const newPlayer = await db.run(newPlayerQuery);
  response.send("Player Added to Team");
});

//Player Id
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `SELECT * FROM cricket_team
    WHERE player_id=${playerId};`;
  const newPlayer = await db.get(playerQuery);
  response.send(convertDbObjectToResponseObject(newPlayer));
});

//update Players
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updateQuery = `UPDATE cricket_team 
    SET 
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}', 
    role = '${role}'
    WHERE player_id = ${playerId};`;
  const newPlayer = await db.run(updateQuery);
  response.send("Player Details Updated");
});

//Delete Player
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const DeletePlayer = `DELETE FROM cricket_team WHERE 
    player_id=${playerId};`;
  const player = await db.run(DeletePlayer);
  response.send("Player Removed");
});

module.exports = app;
