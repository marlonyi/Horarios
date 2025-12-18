import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el SVG
const svgBuffer = fs.readFileSync(path.join(__dirname, "public", "icon.svg"));

// Generar iconos PNG
async function generateIcons() {
  try {
    // Icono de 192x192
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, "public", "icon-192.png"));

    // Icono de 512x512
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, "public", "icon-512.png"));

    console.log("✅ Iconos generados exitosamente");
  } catch (error) {
    console.error("❌ Error generando iconos:", error);
  }
}

generateIcons();
