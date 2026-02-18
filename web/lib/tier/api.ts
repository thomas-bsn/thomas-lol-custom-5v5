import type { Player, PlayerDetails } from './types';

function stripAccents(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// slug safe pour URL + nom de fichier
export function playerIdFromName(name: string) {
  const base = stripAccents(name.trim().toLowerCase());

  // garde lettres/chiffres, remplace le reste par "-"
  // ça évite les espaces, accents, etc.
  const slug = base
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // fallback au cas où le nom est juste des symboles
  return slug || 'player';
}

function assertBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('This function must be called in the browser (client component).');
  }
}

function parsePlayersTxt(txt: string) {
  const lines = txt
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  const players = [];

  for (const line of lines) {
    const parts = line.split(';');

    // id;name;cost;score;games;mainRole;roles;avatarUrl
    const [id, name, costStr, scoreStr, gamesStr, mainRole, rolesStr, avatarUrl] = parts;

    // lignes invalides -> skip
    if (!id || !name) continue;

    const cost = costStr ? Number(costStr) : null;
    const score = scoreStr ? Number(scoreStr) : 0;
    const games = gamesStr ? Number(gamesStr) : 0;

    const roles = rolesStr
      ? rolesStr.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    players.push({
      id: id.trim(),
      name: name.trim(),
      cost: Number.isFinite(cost) ? cost : null,
      score: Number.isFinite(score) ? score : 0,
      games: Number.isFinite(games) ? games : 0,
      mainRole: mainRole?.trim() || undefined,
      roles,
      avatarUrl: avatarUrl?.trim() || undefined,
    });
  }

  return players;
}

export async function getPlayers() {
  assertBrowser();
  const res = await fetch('/mock/players.txt', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} (/mock/players.txt)`);
  const txt = await res.text();
  return parsePlayersTxt(txt);
}


export async function getPlayerDetailsById(id: string): Promise<any> {
  const res = await fetch(`/mock/players/${encodeURIComponent(id)}.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} (/mock/players/${id}.json)`);
  return res.json();
}
