const fs = require('fs');
const path = require('path');

const replacements = {
  "Transaccin": "Transaccion",
  "Transacci\uFFFDn": "Transaccion",
  "Categora": "Categoria",
  "Categora": "Categoria",
  "Categor\uFFFD\uFFFDn": "Categoria",
  "Categor\uFFFDa": "Categoria",
  "Mara Gmez": "Maria Gomez",
  "Maratn": "Maraton",
  "Maratn": "Maraton",
  "Marat\uFFFDn": "Maraton",
  "Da": "Dia",
  "Da": "Dia",
  "D\uFFFDa": "Dia",
  "Descripcin": "Descripcion",
  "Descripcin": "Descripcion",
  "Descripci\uFFFDn": "Descripcion",
  "sltimos": "Ultimos",
  "sltimos": "Ultimos",
  "\uFFFDsltimos": "Ultimos",
  "ltimos": "Ultimos",
  "todava": "todavia",
  "todava": "todavia",
  "todav\uFFFDa": "todavia",
  "informacin": "informacion",
  "informacin": "informacion",
  "informaci\uFFFDn": "informacion",
  "frmulas": "formulas",
  "frmulas": "formulas",
  "f\uFFFDrmulas": "formulas",
  "colorimetra": "colorimetria",
  "colorimetra": "colorimetria",
  "colorimetr\uFFFDa": "colorimetria",
  "PǸrez": "Perez",
  "TelǸfono": "Telefono",
  "Telfono": "Telefono",
  "Tel\u00E9fono": "Telefono",
  "Gestin": "Gestion",
  "Gestin": "Gestion",
  "Gesti\uFFFDn": "Gestion",
  "Catǭlogo": "Catalogo",
  "catǭlogo": "catalogo",
  "diseos": "disenos",
  "diseos": "disenos",
  "dise\uFFFDos": "disenos",
  "Diseo": "Diseno",
  "Diseo": "Diseno",
  "Dise\uFFFDo": "Diseno",
  "liquidacin": "liquidacion",
  "liquidacin": "liquidacion",
  "liquidaci\uFFFDn": "liquidacion",
  "Ttulo": "Titulo",
  "Ttulo": "Titulo",
  "T\uFFFDto": "Titulo",
  "Fotografa": "Fotografia",
  "Fotografa": "Fotografia",
  "Fotograf\uFFFDa": "Fotografia",
  "Duracin": "Duracion",
  "Duracin": "Duracion",
  "Duraci\uFFFDn": "Duracion",
  "Aǧn": "Aun",
  "An": "Aun",
  "rǭpido": "rapido",
  "Rǭpidas": "Rapidas",
  "rǭpida": "rapida",
  "peluquera": "peluqueria",
  "peluquera": "peluqueria",
  "peluquer\uFFFDa": "peluqueria",
  "Actualizacin": "Actualizacion",
  "Actualizacin": "Actualizacion",
  "Actualizaci\uFFFDn": "Actualizacion",
  "Prximas": "Proximas",
  "Prximas": "Proximas",
  "Pr\uFFFDximas": "Proximas",
  "invǭlidas": "invalidas",
  "conexin": "conexion",
  "conexin": "conexion",
  "conexi\uFFFDn": "conexion",
  "Contrasea": "Contrasena",
  "Contrasea": "Contrasena",
  "Contrase\uFFFDa": "Contrasena",
  "autnomo": "autonomo",
  "autnomo": "autonomo",
  "aut\uFFFDnomo": "autonomo",
  "va": "via",
  "va": "via",
  "v\uFFFDa": "via",
  "nǧmero": "numero",
  "nmero": "numero",
  "n\uFFFDmero": "numero",
  "aqu": "aqui",
  "aqu": "aqui",
  "aqu\uFFFD": "aqui",
  "Regstrate": "Registrate",
  "Regstrate": "Registrate",
  "Reg\uFFFDstrate": "Registrate",
  "atrǭs": "atras",
  "QuǸ": "Que",
  "Fidelizacin": "Fidelizacion",
  "Fidelizacin": "Fidelizacion",
  "Fidelizaci\uFFFDn": "Fidelizacion",
  "Atencin": "Atencion",
  "Atencin": "Atencion",
  "Atenci\uFFFDn": "Atencion",
  "estǭs": "estas",
  "avsanos": "avisanos",
  "avsanos": "avisanos",
  "av\uFFFDsanos": "avisanos",
  "estǭ": "esta",
  "Cuadrcula": "Cuadricula",
  "Cuadrcula": "Cuadricula",
  "Cuadr\uFFFDcula": "Cuadricula",
  "SECCI\"N": "SECCION",
  "SECCI\"N": "SECCION",
  "sltima": "Ultima",
  "sltima": "Ultima",
  "Ramrez": "Ramirez",
  "Ramrez": "Ramirez",
  "Ram\uFFFDrez": "Ramirez",
  "Galera": "Galeria",
  "Galera": "Galeria",
  "Galer\uFFFDa": "Galeria",
  "galera": "galeria"
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
          content = content.split(bad).join(good);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));

// Check index.html for utf-8
let indexContent = fs.readFileSync('index.html', 'utf8');
if (!indexContent.includes('<meta charset="UTF-8" />')) {
  indexContent = indexContent.replace('<head>', '<head>\n    <meta charset="UTF-8" />');
  fs.writeFileSync('index.html', indexContent, 'utf8');
  console.log('Added meta charset to index.html');
}
