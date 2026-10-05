const fs = require('fs');
const path = require('path');

const patterns = [
  { rx: /Transacci.n/g, rep: "Transaccion" },
  { rx: /Categor.a/g, rep: "Categoria" },
  { rx: /Marat.n/g, rep: "Maraton" },
  { rx: /Descripci.n/g, rep: "Descripcion" },
  { rx: /todav.a/g, rep: "todavia" },
  { rx: /informaci.n/g, rep: "informacion" },
  { rx: /f.rmulas/g, rep: "formulas" },
  { rx: /colorimetr.a/g, rep: "colorimetria" },
  { rx: /P.rez/g, rep: "Perez" },
  { rx: /Tel.fono/g, rep: "Telefono" },
  { rx: /Gesti.n/g, rep: "Gestion" },
  { rx: /Cat.logo/g, rep: "Catalogo" },
  { rx: /cat.logo/g, rep: "catalogo" },
  { rx: /dise.os/g, rep: "disenos" },
  { rx: /Dise.o/g, rep: "Diseno" },
  { rx: /liquidaci.n/g, rep: "liquidacion" },
  { rx: /T.tulo/g, rep: "Titulo" },
  { rx: /Fotograf.a/g, rep: "Fotografia" },
  { rx: /Duraci.n/g, rep: "Duracion" },
  { rx: /A.n /g, rep: "Aun " },
  { rx: /r.pido/g, rep: "rapido" },
  { rx: /R.pidas/g, rep: "Rapidas" },
  { rx: /r.pida/g, rep: "rapida" },
  { rx: /peluquer.a/g, rep: "peluqueria" },
  { rx: /Actualizaci.n/g, rep: "Actualizacion" },
  { rx: /Pr.ximas/g, rep: "Proximas" },
  { rx: /inv.lidas/g, rep: "invalidas" },
  { rx: /conexi.n/g, rep: "conexion" },
  { rx: /Contrase.a/g, rep: "Contrasena" },
  { rx: /aut.nomo/g, rep: "autonomo" },
  { rx: /v.a Vista/g, rep: "via Vista" },
  { rx: /n.mero/g, rep: "numero" },
  { rx: /Reg.strate/g, rep: "Registrate" },
  { rx: /atr.s/g, rep: "atras" },
  { rx: /Qu. bueno/g, rep: "Que bueno" },
  { rx: /Fidelizaci.n/g, rep: "Fidelizacion" },
  { rx: /Atenci.n/g, rep: "Atencion" },
  { rx: /est.s /g, rep: "estas " },
  { rx: /av.sanos/g, rep: "avisanos" },
  { rx: /est. LIBRE/g, rep: "esta LIBRE" },
  { rx: /est. disponible/g, rep: "esta disponible" },
  { rx: /Cuadr.cula/g, rep: "Cuadricula" },
  { rx: /SECCI.N/g, rep: "SECCION" },
  { rx: /Ram.rez/g, rep: "Ramirez" },
  { rx: /Galer.a/g, rep: "Galeria" },
  { rx: /galer.a/g, rep: "galeria" },
  { rx: /D.a de/g, rep: "Dia de" },
  { rx: /D.a/g, rep: "Dia" },
  { rx: /l.mite/g, rep: "limite" },
  { rx: /recepci.n/g, rep: "recepcion" },
  { rx: /Inmedata/g, rep: "Inmediata" },
  { rx: /aqui./g, rep: "aqui" },
  { rx: /Auna/g, rep: "Ana" },
  { rx: /Mar.a/g, rep: "Maria" },
  { rx: /G.mez/g, rep: "Gomez" },
  { rx: /\?\?\?\?\?\?\?\?/g, rep: "********" }, 
  { rx: /\?/g, rep: "-" }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      content = content.replace(/aqui/g, "aqui");
      content = content.replace(/sUltimos/g, "Ultimos");
      content = content.replace(/sltimos/g, "Ultimos");
      content = content.replace(/sltima/g, "Ultima");
      content = content.replace(/Diate/g, "Date"); 
      content = content.replace(/Auna/g, "Ana");
      
      for (const {rx, rep} of patterns) {
        content = content.replace(rx, rep);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));

let indexContent = fs.readFileSync('index.html', 'utf8');
if (!indexContent.includes('<meta charset="UTF-8" />')) {
  indexContent = indexContent.replace('<head>', '<head>\n    <meta charset="UTF-8" />');
  fs.writeFileSync('index.html', indexContent, 'utf8');
  console.log('Added meta charset to index.html');
}
