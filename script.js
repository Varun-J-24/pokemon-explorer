async function getPokemon() {
  let response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=50");
  let data = await response.json();

  let pokemonList = data.results;

  displayPokemon(pokemonList);
}

function displayPokemon(pokemonList) {
  let container = document.getElementById("container");
  container.innerHTML = "";

  pokemonList.forEach((pokemon, index) => {
    let div = document.createElement("div");

    let id = index + 1;

    let image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

    div.innerHTML = `
      <p>#${id}</p>
      <img src="${image}" alt="${pokemon.name}">
      <h3>${pokemon.name}</h3>
    `;

    container.appendChild(div);
  });
}

getPokemon();