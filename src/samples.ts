export interface PlantSample {
  name: string;
  scientificName: string;
  organ: "flower" | "leaf" | "habit";
  dataUrl: string;
}

// Inline custom vectorized SVG illustrations representing common plants for interactive play
export const PLANT_SAMPLES: PlantSample[] = [
  {
    name: "Dog Rose",
    scientificName: "Rosa canina",
    organ: "flower",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><rect width="400" height="400" fill="%231e1b4b"/><circle cx="200" cy="200" r="140" fill="%23da1e37" opacity="0.15"/><g transform="translate(200, 200)"><path d="M-80,-20 C-140,-100 -60,-150 0,-70 C60,-150 140,-100 80,-20 C140,60 60,110 0,60 C-60,110 -140,60 -80,-20 Z" fill="%23f43f5e" opacity="0.85"/><path d="M-50,-10 C-90,-60 -40,-90 0,-40 C40,-90 90,-60 50,-10 C90,40 40,70 0,40 C-40,70 -90,40 -50,-10 Z" fill="%23fda4af"/><circle cx="0" cy="0" r="22" fill="%23fbbf24"/><circle cx="0" cy="0" r="16" fill="%23f59e0b"/><line r="10" x1="0" y1="0" x2="30" y2="30" stroke="%23fbbf24" stroke-width="3"/><line r="10" x1="0" y1="0" x2="-35" y2="-20" stroke="%23fbbf24" stroke-width="3"/><line r="10" x1="0" y1="0" x2="20" y2="-35" stroke="%23fbbf24" stroke-width="3"/><line r="10" x1="0" y1="0" x2="-25" y2="30" stroke="%23fbbf24" stroke-width="3"/></g><path d="M 200 280 Q 180 340 120 370" fill="none" stroke="%2310b981" stroke-width="8" stroke-linecap="round"/><path d="M 170 320 Q 140 310 110 325" fill="%23047857"/><path d="M 190 295 Q 220 285 240 300" fill="%23047857"/><text x="200" y="50" fill="%23fda4af" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">Rose Flower Sample</text></svg>`
  },
  {
    name: "Monstera Deliciosa",
    scientificName: "Monstera deliciosa",
    organ: "leaf",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><rect width="400" height="400" fill="%23022c22"/><circle cx="200" cy="200" r="140" fill="%2310b981" opacity="0.1"/><g transform="translate(200, 200)"><path d="M-10,120 C-120,60 -130,-120 0,-140 C130,-120 120,60 10,120 Z" fill="%23059669"/><path d="M 0 -138 L 0 118" stroke="%2310b981" stroke-width="5" stroke-linecap="round"/><path d="M-80,-20 Q-40,-50 0,-80 M-90,20 Q-30,-20 0,-50 M-70,60 Q-20,20 0,-20" stroke="%23022c22" stroke-width="12" stroke-linecap="round"/><path d="M80,-20 Q40,-50 0,-80 M90,20 Q30,-20 0,-50 M70,60 Q20,20 0,-20" stroke="%23022c22" stroke-width="12" stroke-linecap="round"/><path d="M-80,-20 Q-40,-50 0,-80 M-90,20 Q-30,-20 0,-50 M-70,60 Q-20,20 0,-20" stroke="%2334d399" stroke-width="3" stroke-linecap="round"/><path d="M80,-20 Q40,-50 0,-80 M90,20 Q30,-20 0,-50 M70,60 Q20,20 0,-20" stroke="%2334d399" stroke-width="3" stroke-linecap="round"/></g><text x="200" y="50" fill="%2334d399" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">Monstera Leaf Sample</text></svg>`
  },
  {
    name: "French Lavender",
    scientificName: "Lavandula dentata",
    organ: "flower",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><rect width="400" height="400" fill="%231e1b4b"/><g fill="%23818cf8" stroke="none"><line x1="200" y1="100" x2="200" y2="350" stroke="%2310b981" stroke-width="4"/><circle cx="200" cy="110" r="14"/><circle cx="185" cy="130" r="12"/><circle cx="215" cy="130" r="11"/><circle cx="200" cy="150" r="14"/><circle cx="182" cy="170" r="13"/><circle cx="218" cy="170" r="12"/><circle cx="200" cy="195" r="14"/><circle cx="180" cy="220" r="12"/><circle cx="220" cy="220" r="12"/><path d="M 200 240 Q 250 210 270 250" fill="none" stroke="%2310b981" stroke-width="3"/><path d="M 200 280 Q 150 250 130 290" fill="none" stroke="%2310b981" stroke-width="3"/></g><g fill="%23a78bfa"><circle cx="200" cy="115" r="8"/><circle cx="190" cy="140" r="9"/><circle cx="210" cy="140" r="8"/><circle cx="200" cy="165" r="9"/><circle cx="188" cy="185" r="8"/><circle cx="212" cy="185" r="8"/><circle cx="200" cy="210" r="9"/></g><text x="200" y="50" fill="%23c084fc" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">Lavender Flower Sample</text></svg>`
  },
  {
    name: "Sun Orchid",
    scientificName: "Thelymitra carnea",
    organ: "flower",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><rect width="400" height="400" fill="%232e1065"/><circle cx="200" cy="200" r="130" fill="%23d8b4fe" opacity="0.1"/><g transform="translate(200, 200)"><path d="M 0 0 C -40 -120 40 -120 0 0 Z" fill="%23c084fc"/><path d="M 0 0 C -120 -40 -120 40 0 0 Z" fill="%23e879f9" opacity="0.8"/><path d="M 0 0 C 120 -40 120 40 0 0 Z" fill="%23e879f9" opacity="0.8"/><path d="M 0 0 C -60 110 60 110 0 0 Z" fill="%23c084fc"/><path d="M 0 0 C -50 -50 50 -50 0 0 Z" fill="%23a78bfa" opacity="0.9"/><circle cx="0" cy="0" r="14" fill="%23facc15"/><circle cx="0" cy="5" r="6" fill="%23ca8a04"/></g><text x="200" y="50" fill="%23f472b6" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">Orchid Flower Sample</text></svg>`
  },
  {
    name: "English Oak",
    scientificName: "Quercus robur",
    organ: "habit",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><rect width="400" height="400" fill="%2306201e"/><path d="M 200 340 L 200 240 M 200 290 L 170 240 M 200 270 L 230 230" stroke="%2378350f" stroke-width="12" stroke-linecap="round"/><circle cx="200" cy="180" r="75" fill="%2315803d" opacity="0.95"/><circle cx="160" cy="170" r="65" fill="%23166534" opacity="0.9"/><circle cx="240" cy="170" r="65" fill="%23166534" opacity="0.9"/><circle cx="200" cy="130" r="60" fill="%2322c55e" opacity="0.4"/><text x="200" y="50" fill="%234ade80" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">Oak Tree Habit Sample</text></svg>`
  }
];
