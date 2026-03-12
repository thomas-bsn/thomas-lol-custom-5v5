"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createInitialState } from "@/lib/appState";
import { useAppState } from "@/lib/useAppState";

type Player = {
  prenom: string;
  riotid: string;
};

export default function SetupPage() {
  const router = useRouter();
  const { update, hydrated } = useAppState();

  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [newPrenom, setNewPrenom] = useState("");
  const [newRiotId, setNewRiotId] = useState("");

  useEffect(() => {
    fetch("/mock/players_bdd.json")
      .then((r) => r.json())
      .then((data) => setPlayers(data));
  }, []);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) =>
      `${p.prenom} ${p.riotid}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [players, search]);

  if (!hydrated) {
    return (
      <main className="p-6 w-full">
        <div className="max-w-xl mx-auto">Chargement…</div>
      </main>
    );
  }

  function addPlayer(player: Player) {
    if (selected.length >= 10) return;
    if (selected.some((p) => p.riotid === player.riotid)) return;
    setSelected([...selected, player]);
  }

  function removePlayer(riotid: string) {
    setSelected(selected.filter((p) => p.riotid !== riotid));
  }

  function onContinue() {
    if (selected.length !== 10) {
      setError("Il faut sélectionner exactement 10 joueurs.");
      return;
    }

    const names = selected.map((p) => p.prenom);
    update(createInitialState(names));
    router.push("/mode");
  }

  // MOCK CREATE PLAYER (plus tard → backend)
  function createPlayer(player: Player) {
    setPlayers((prev) => [...prev, player]);
  }

  function handleCreatePlayer() {
    if (!newPrenom.trim() || !newRiotId.trim()) return;

    const player: Player = {
      prenom: newPrenom.trim(),
      riotid: newRiotId.trim(),
    };

    createPlayer(player);

    setNewPrenom("");
    setNewRiotId("");
    setShowModal(false);
  }

  return (
    <main className="p-6 w-full">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold">Picker</h1>
        <p className="text-sm opacity-80 mt-2">
          Sélectionne 10 joueurs dans la liste.
        </p>

        {/* SEARCH */}
        <input
          className="w-full mt-6 rounded-lg border px-3 py-2"
          placeholder="Chercher un joueur ou riot id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm opacity-70">Liste des joueurs</span>

          <button
            onClick={() => setShowModal(true)}
            className="border rounded px-3 py-1 text-sm hover:bg-white/10"
          >
            + Ajouter joueur
          </button>
        </div>

        {/* LISTE JOUEURS */}
        <div className="mt-4 max-h-60 overflow-y-scroll border rounded-lg">
          {filteredPlayers.length === 0 && (
            <div className="p-6 text-center opacity-70 flex flex-col gap-3">
              <span>Aucun joueur trouvé</span>

              <button
                onClick={() => {
                  setNewPrenom(search)
                  setShowModal(true)
                }}
                className="border rounded px-3 py-1 text-sm hover:bg-white/10 self-center"
              >
                Ajouter "{search}"
              </button>
            </div>
          )}
          {filteredPlayers.map((p) => {
            const isSelected = selected.some(
              (s) => s.riotid === p.riotid
            );

            return (
              <div
                key={p.riotid}
                onClick={() => !isSelected && addPlayer(p)}
                className={`flex justify-between items-center px-3 py-2 cursor-pointer transition
                ${isSelected ? "opacity-40" : "hover:bg-white/10"}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{p.prenom}</span>
                  <span className="text-xs opacity-60">{p.riotid}</span>
                </div>

                <button
                  disabled={isSelected}
                  className={`text-xs border rounded px-2 py-1
                  ${
                    isSelected
                      ? "bg-green-600 border-green-600 text-white"
                      : ""
                  }`}
                >
                  {isSelected ? "Sélectionné" : "Ajouter"}
                </button>
              </div>
            );
          })}
        </div>

        {/* JOUEURS SELECTIONNES */}
        <div className="mt-6">
          <h2 className="font-semibold">
            Sélection ({selected.length}/10)
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-2">
            {selected.map((p) => (
              <div
                key={p.riotid}
                className="flex justify-between items-center border rounded px-3 py-2"
              >
                <div>
                  <span className="font-medium">{p.prenom}</span>
                  <span className="text-xs opacity-60 ml-2">
                    {p.riotid}
                  </span>
                </div>

                <button
                  onClick={() => removePlayer(p.riotid)}
                  className="text-red-500 text-sm"
                >
                  retirer
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-6 flex gap-3">
          <button
            className="rounded-lg bg-black text-white px-4 py-2"
            onClick={onContinue}
          >
            Continuer
          </button>

          <button
            className="rounded-lg border px-4 py-2"
            onClick={() => {
              setSelected([]);
              setError(null);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* MODAL AJOUT JOUEUR */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-neutral-900 p-6 rounded-xl w-80 border">
            <h2 className="text-lg font-semibold mb-4">
              Ajouter un joueur
            </h2>

            <input
              placeholder="Prénom"
              className="w-full mb-3 rounded border px-3 py-2 bg-transparent"
              value={newPrenom}
              onChange={(e) => setNewPrenom(e.target.value)}
            />

            <input
              placeholder="Riot ID (ex: player#EUW)"
              className="w-full mb-4 rounded border px-3 py-2 bg-transparent"
              value={newRiotId}
              onChange={(e) => setNewRiotId(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="border px-3 py-1 rounded"
              >
                Annuler
              </button>

              <button
                onClick={handleCreatePlayer}
                className="bg-white text-black px-3 py-1 rounded"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}