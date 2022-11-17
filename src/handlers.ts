import { FastifyReply, FastifyRequest } from "fastify";

export async function getPokemonByName(request: FastifyRequest, reply: FastifyReply) {
  const name: string = request.params["name"];

  reply.headers["Accept"] = "application/json";

  let urlApiPokemon = "https://pokeapi.co/api/v2/pokemon/";

  name ? urlApiPokemon += name + "?offset=20&limit=20" : urlApiPokemon += "?offset=20&limit=20";

  let response;

  try {
    response = await fetch(urlApiPokemon).then(data => data.json());
  } catch (err) {
    // bad name input => removing name from url
    response = await fetch("https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20").then(data => data.json());
  }

  const pokemonTypes = await computeResponse(response, reply);
  reply.send(pokemonTypes);
  return reply;
}


export const computeResponse = async (response: unknown, reply: FastifyReply) => {
  const resp = response as any;
  let results;
  if (resp.results)
    results = resp.results.map(type => type.url);
  else
    // get pokemon url
    results = [resp.location_area_encounters];

  let pokemonTypes = [];

  for (const element of results) {

    // 2nd url
    const response2 = await fetch("https://pokeapi.co/api/v2/pokemon/" + element.split("/")[6]).then(data => data.json());
    pokemonTypes.push(response2);

  }


  pokemonTypes.forEach(element => {
    const stats = [];

    pokemonTypes.map(pok =>
      pok.stats.map(st =>
        pok.name.toUpperCase() == element.name.toUpperCase()
          ? stats.push(st.base_stat)
          : ([])
      )
    );

    if (stats)
      element.averageStat = stats.reduce((a, b) => a + b) / stats.length;
    else
      element.averageStat = 0;
  });

  return pokemonTypes.map((pokemon) => {
    return {
      name: pokemon.name,
      height: pokemon.height,
      base_experience: pokemon.base_experience,
      id: pokemon.id,
      url: pokemon.url,
      stats: pokemon.stats,
      averageStat: pokemon.averageStat
    };
  });

};
