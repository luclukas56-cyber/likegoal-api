const express = require("express");
const app = express();

const UNIVERSE_ID = "8545209179"; // your universe id
const ROBLOX_URL = `https://games.roblox.com/v1/games/votes?universeIds=${UNIVERSE_ID}`;

app.get("/likes", async (req, res) => {
  try {
    const r = await fetch(ROBLOX_URL);
    if (!r.ok) {
      return res.status(500).json({ error: "Roblox API error" });
    }

    const data = await r.json();
    const info = data?.data?.[0];
    const likes = info?.upVotes ?? 0;

    res.json({ likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));

