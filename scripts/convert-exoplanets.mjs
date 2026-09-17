import { readFileSync, writeFileSync } from "node:fs";

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ""; }
    else if (c === '\n') { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift();
  return rows.filter(r => r.length === headers.length).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}

const num = value => value === "" || value == null ? null : Number(value);
const raw = parseCsv(readFileSync(process.argv[2], "utf8"));
const planets = raw.map((p, index) => ({
  id: index,
  name: p.pl_name,
  host: p.hostname,
  stars: num(p.sy_snum),
  systemPlanets: num(p.sy_pnum),
  method: p.discoverymethod,
  year: num(p.disc_year),
  periodDays: num(p.pl_orbper),
  semiMajorAu: num(p.pl_orbsmax),
  radiusEarth: num(p.pl_rade),
  massEarth: num(p.pl_bmasse),
  equilibriumK: num(p.pl_eqt),
  insolationEarth: num(p.pl_insol),
  density: num(p.pl_dens),
  eccentricity: num(p.pl_orbeccen),
  distancePc: num(p.sy_dist),
  ra: num(p.ra),
  dec: num(p.dec),
  spectralType: p.st_spectype || null,
  starTempK: num(p.st_teff),
  starRadiusSun: num(p.st_rad),
  starMassSun: num(p.st_mass)
}));
const systems = new Map();
for (const p of planets) {
  if (!systems.has(p.host)) systems.set(p.host, {
    name: p.host, ra: p.ra, dec: p.dec, distancePc: p.distancePc,
    spectralType: p.spectralType, starTempK: p.starTempK,
    starRadiusSun: p.starRadiusSun, starMassSun: p.starMassSun, planets: []
  });
  systems.get(p.host).planets.push(p.id);
}
const out = {
  meta: {
    source: "NASA Exoplanet Archive / PSCompPars",
    sourceUrl: "https://exoplanetarchive.ipac.caltech.edu/",
    retrieved: new Date().toISOString(),
    planetCount: planets.length,
    systemCount: systems.size
  },
  systems: [...systems.values()],
  planets
};
writeFileSync(process.argv[3], JSON.stringify(out));
console.log(JSON.stringify(out.meta));
