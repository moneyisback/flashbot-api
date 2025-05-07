const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * GET /api/opportunities
 * ➜ Renvoie les opportunités arbitrage à partir du CSV
 */
app.get("/api/opportunities", (req, res) => {
  const results = [];
  const csvPath = path.join(__dirname, "logs", "opportunities.csv");

  if (!fs.existsSync(csvPath)) {
    return res.json([]); // Si le fichier n'existe pas encore
  }

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      res.json(results.reverse()); // derniers d'abord
    });
});

/**
 * POST /api/trigger
 * ➜ Lance manuellement le script d'exécution d'arbitrage
 */
app.post("/api/trigger", (req, res) => {
  console.log("⚡ Requête reçue : Lancement manuel de l'executor...");

  const command = "npx ts-node ../scripts/executor-flashbots.ts";

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Erreur d'exécution :", error.message);
      return res.status(500).send("Échec de l'exécution");
    }
    if (stderr) {
      console.warn("⚠️ stderr:", stderr);
    }

    console.log("✅ Résultat script:\n", stdout);
    res.send("✅ Executor lancé avec succès !");
  });
});

/**
 * Lancement du serveur
 */
app.listen(PORT, () => {
  console.log(`📡 API FlashBot MEV en ligne sur le port : ${PORT}`);
});
