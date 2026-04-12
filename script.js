const API_BASE = "https://pokeapi.co/api/v2/pokemon";
const LIMIT = 151; // first generation, fast to load

const grid = document.getElementById("grid");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");
const searchInput = document.getElementById("searchInput");
const typeSelect = document.getElementById("typeSelect");
const sortSelect = document.getElementById("sortSelect");
const loadedCount = document.getElementById("loadedCount");
const totalCount = document.getElementById("totalCount");
const themeToggle = document.getElementById("themeToggle");

let pokemonData = [];

const typeColors = {
  grass: "#4ade80",
  fire: "#fb7185",
  water: "#60a5fa",
  electric: "#facc15",
  bug: "#a3e635",
  normal: "#94a3b8",
  poison: "#c084fc",
  ground: "#eab308",
  fairy: "#f9a8d4",
  fighting: "#f97316",
  psychic: "#22d3ee",
  rock: "#d6d3d1",
  ghost: "#a78bfa",
  ice: "#67e8f9",
  dragon: "#7dd3fc",
  dark: "#475569",
  steel: "#cbd5e1",
};

initTheme();
init();

async function init() {
  try {
    showLoader();
    const listResponse = await fetch(`${API_BASE}?limit=${LIMIT}`);
    const listData = await listResponse.json();

    const details = await Promise.all(
      listData.results.map(async (item) => {
        const res = await fetch(item.url);
        return res.json();
      })
    );

    pokemonData = details.map((p) => ({
      id: p.id,
      name: p.name,
      image: p.sprites.other["official-artwork"].front_default || p.sprites.front_default,
      types: p.types.map((t) => t.type.name),
      stats: p.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
      }, {}),
    }));

    populateTypes(pokemonData);
    totalCount.textContent = pokemonData.length;
    render();
  } catch (err) {
    console.error(err);
    showError("Could not load Pokémon. Please retry.");
  } finally {
    hideLoader();
  }
}

function populateTypes(data) {
  const types = new Set();
  data.forEach((p) => p.types.forEach((t) => types.add(t)));
  [...types].sort().forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeSelect.appendChild(option);
  });
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const typeFilter = typeSelect.value;
  const sortBy = sortSelect.value;

  const filtered = pokemonData
    .filter((p) => p.name.includes(query))
    .filter((p) => (typeFilter === "all" ? true : p.types.includes(typeFilter)))
    .sort((a, b) => sortPokemon(a, b, sortBy));

  loadedCount.textContent = filtered.length;
  grid.innerHTML = filtered
    .map((p) => cardTemplate(p))
    .join("");
}

function sortPokemon(a, b, sortBy) {
  if (sortBy === "number") return a.id - b.id;
  if (sortBy === "name") return a.name.localeCompare(b.name);
  const stat = sortBy;
  return (b.stats[stat] || 0) - (a.stats[stat] || 0);
}

function cardTemplate(p) {
  return `
    <article class="card" aria-label="${p.name}">
      <div class="card__top">
        <span class="card__id">#${String(p.id).padStart(3, "0")}</span>
        <div class="types">${p.types
          .map((t) => `<span class="type" style="background:${typeColors[t] || "#e5e7eb"}">${t}</span>`)
          .join("")}</div>
      </div>
      <img src="${p.image}" alt="${p.name}">
      <div class="name">${p.name}</div>
      <div class="stats">
        <div class="stat">HP <span>${p.stats.hp}</span></div>
        <div class="stat">ATK <span>${p.stats.attack}</span></div>
        <div class="stat">DEF <span>${p.stats.defense}</span></div>
        <div class="stat">SPD <span>${p.stats.speed}</span></div>
      </div>
    </article>
  `;
}

function showLoader() { loader.hidden = false; }
function hideLoader() { loader.hidden = true; }
function showError(msg) {
  errorBox.hidden = false;
  errorBox.textContent = msg;
}

// Events
searchInput.addEventListener("input", render);
typeSelect.addEventListener("change", render);
sortSelect.addEventListener("change", render);
themeToggle.addEventListener("click", toggleTheme);

function initTheme() {
  const saved = localStorage.getItem("pokedex-theme");
  if (saved === "light") document.documentElement.classList.add("light");
  updateThemeToggle();
}

function toggleTheme() {
  document.documentElement.classList.toggle("light");
  const mode = document.documentElement.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("pokedex-theme", mode);
  updateThemeToggle();
}

function updateThemeToggle() {
  const light = document.documentElement.classList.contains("light");
  themeToggle.textContent = light ? "🌞 Light" : "🌙 Dark";
}
