const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

// Définir le répertoire des vidéos
const downloadDirectory = path.join(__dirname, "videos");

// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(downloadDirectory)) {
  fs.mkdirSync(downloadDirectory);
}

// Interface pour lire l'entrée utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour télécharger une vidéo
function downloadVideo(url, name = null) {
  let outputPath;
  if (name && name.trim() !== "") {
    // Sécuriser le nom de fichier
    const safeName = name.replace(/[^a-z0-9_\-]/gi, "_");
    outputPath = path.join(downloadDirectory, `${safeName}.%(ext)s`);
  } else {
    outputPath = path.join(downloadDirectory, "%(title)s.%(ext)s");
  }

  // Commande yt-dlp
  const command = `yt-dlp -f mp4 -o "${outputPath}" "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Erreur lors du téléchargement : ${error.message}`);
    } else {
      console.log("✅ Téléchargement terminé !");
    }
    rl.close();
  });
}

// Demander l'URL à l'utilisateur
rl.question("🔗 Entrez l'URL de la vidéo : ", (url) => {
  if (!url.trim()) {
    console.log("❌ L'URL est vide !");
    rl.close();
    return;
  }

  rl.question("📂 Nom du fichier (laisser vide pour le titre par défaut) : ", (name) => {
    downloadVideo(url, name);
  });
});
