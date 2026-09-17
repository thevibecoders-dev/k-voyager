# Kosmos Voyager: bronnen en grenzen

Bijgewerkt op 17 september 2026.

- Planeetcentra, de aardmaan en Galileïsche manen: Astronomy Engine 2.1.19 (MIT), https://github.com/cosinekitty/astronomy. Educatieve nauwkeurigheid; geometrische heliocentrische posities, ecliptica J2000. Geen apparent-place navigatie, relativistische vlucht of lokale hemel vanaf een aardobservator.
- Onafhankelijke steekproef: NASA/JPL Horizons DE441, Earth 399 t.o.v. Sun 10, ecliptica J2000, 2026-09-17 00:00 TDB. Tests vergelijken deze met de UTC-berekening binnen 0,0003 AE; dit is geen validatie van alle objecten/datums. https://ssd.jpl.nasa.gov/horizons/
- HYG v4.1, David Nash / Astronomy Nexus: https://github.com/astronexus/HYG-Database. Selectie magnitude ≤ 7,5: 25.791 sterren. Afgeleide JSON onder CC BY-SA 4.0. Lineaire ruimtebeweging vanaf J2000; parallaxonzekerheden niet weergegeven. Afstandwaarde 100.000 pc betekent onbekend en wordt niet gebruikt in de ruimtelijke sterrenkaart, wel voor de hemelrichting. Dit is geen volledige catalogus van alle sterren.
- Oppervlakken: Solar System Scope / INOVE, https://www.solarsystemscope.com/textures/, CC BY 4.0. Lokale credits en herkomst per bestand: dist/assets/planets/credits.json. Kaarten zijn illustratieve composites met versterkte kleur en mogelijk aangevulde hiaten. Rotatiemeridianen zijn niet gekalibreerd; wolken geen live weer.
- Kuipergordel: https://science.nasa.gov/solar-system/kuiper-belt/. Weergegeven deeltjesverdeling 30–50 AE, geen echte individuele baanobjecten. Ook asteroïdengordel en zodiacale stof zijn illustratieve deeltjes.
- Webb/Hubble: NASA / ESA / CSA / STScI, oorspronkelijke beeldcredits in de app en bestaande atlas. Deze telescoopbeelden zijn geen realtime waarnemingen.
- NASA Exoplanet Archive, momentopname 17 september 2026: 6.366 planeten, 4.775 stelsels, bestaande atlas. Dit betekent niet dat alle planeten in het heelal bekend zijn. Exoplaneetoppervlakken en actuele fasen zijn meestal onbekend. De atlas is schematisch; 3D Voyager bevat ons zonnestelsel, 22 geselecteerde manen en HYG-sterren.

## Weergave

Three.js 0.180 WebGL2, logaritmische diepte, ACES tone mapping, bloom, lokaal gebundelde modules. Aarde/Mars 8192×4096, Jupiter/Saturnus 4096×2048, overige texturen 2048×1024. Geen runtime CDN. UHD is apparaatgebonden, niet een garantie van 4K op elk scherm. Touch/OrbitControls en handmatige ruimtevlucht met toetsen of schermknoppen. Fysieke schaal gebruikt 100 eenheden per AE voor zowel stralen als afstanden; verkenbare schaal comprimeert afstanden en vergroot objecten expliciet.

Tests controleren bouw, numerieke data en lokale assets. Geen claim van visuele of fysieke mobiele-apparaatvalidatie.
