// server/routes/gameConfig.js
const express = require("express");
const { get } = require("http");
const path = require("path");
const router = express.Router();



router.get("/:mode", (req, res) => {
  const { mode } = req.params;

  try {
    const configPath = path.join(__dirname, "..", "configs", `${mode}.js`);
    const gameConfig = require(configPath);
    console.log(`Configuration chargée pour le mode : ${mode}`);
    console.log(getFrontGameConfig(gameConfig));

    res.json({
      ok: true,
      mode,
      frontConfig: getFrontGameConfig(gameConfig),
    });
  } catch (err) {
    return res.status(404).json({
      ok: false,
      message: "Mode de jeu invalide"
    });
  }
});

module.exports = router;
