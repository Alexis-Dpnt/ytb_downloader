const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 3000;

// Pour parser le JSON des requêtes POST
app.use(express.json());

// Définir le répertoire des vidéos
const downloadDirectory = path.join(__dirname, "videos");

// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(downloadDirectory)) {
  fs.mkdirSync(downloadDirectory);
}

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(__dirname));

// Servir les vidéos statiques
app.use("/videos", express.static(downloadDirectory));

// Route pour télécharger la vidéo
app.post("/download", (req, res) => {
  const { url, name } = req.body;
  if (!url) {
    return res.status(400).json({ message: "URL manquante" });
  }

  // Optionnel : Nom personnalisé pour le fichier
  let outputPath;
  if (name && name.trim() !== "") {
    // Sécuriser le nom de fichier
    const safeName = name.replace(/[^a-z0-9_\-]/gi, "_");
    outputPath = path.join(downloadDirectory, `${safeName}.%(ext)s`);
  } else {
    // Utiliser le titre de la vidéo par défaut
    outputPath = path.join(downloadDirectory, "%(title)s.%(ext)s");
  }

  // Commande yt-dlp pour télécharger la vidéo dans le répertoire spécifié
  const command = `yt-dlp -f mp4 -o "${outputPath}" "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur lors du téléchargement: ${error.message}`);
      return res
        .status(500)
        .json({ message: `Erreur lors du téléchargement: ${error.message}` });
    }

    // Optionnel : Tu peux traiter stdout ou stderr si nécessaire
    res.status(200).json({ message: "Téléchargement terminé!" });
  });
});

// Route pour lister les vidéos téléchargées
app.get("/list", (req, res) => {
  fs.readdir(downloadDirectory, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({
          message: "Erreur lors de la lecture du répertoire des vidéos.",
        });
    }

    // Filtrer pour ne garder que les fichiers mp4 (ou autres formats si nécessaire)
    const videos = files.filter((file) => file.endsWith(".mp4"));
    res.status(200).json({ videos: videos });
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
