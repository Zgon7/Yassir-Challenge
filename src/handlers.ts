import { FastifyReply, FastifyRequest } from "fastify";

export async function getPokemonByName(request: FastifyRequest, reply: FastifyReply) {
  var name: string = request.params['name']

  reply.headers['Accept'] = 'application/json'

  var urlApiPokeman = 'https://pokeapi.co/api/v2/pokemon/';






  name ? urlApiPokeman += name + "?offset=20" + "&limit=20" : urlApiPokeman += "?offset=20&limit=20"

  console.log('urlApiPokeman', urlApiPokeman);


  let response: any = ""


        console.log("response");
        try {
          response = await fetch(urlApiPokeman).then(data => data.json());
        }
        catch (err) {
          // bad name input => removing name from url
          response = await fetch('https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20').then(data => data.json());
        }

  const pokemonTypes = await computeResponse(response, reply)




  reply.send(pokemonTypes)
  return reply;
}

export const computeResponse = async (response: unknown, reply: FastifyReply) => {
  const resp = response as any
  console.log("resp", resp);
  let results;
  if (resp.results)
    results = resp.results.map(type => type.url);
  else
    // get pokemon url
    results = [resp.location_area_encounters];
  console.log("results", results);

  let pokemonTypes = []

  for (const element of results) {

    // 2nd url
          const response2 = await fetch('https://pokeapi.co/api/v2/pokemon/' + element.split('/')[6]).then(data => data.json());
          console.log("response");
          pokemonTypes.push(response2)

  }


  pokemonTypes.forEach(element => {
    var stats = []

    pokemonTypes.map(pok =>
      pok.stats.map(st =>
        pok.name.toUpperCase() == element.name.toUpperCase()
          ? stats.push(st.base_stat)
          : ([])
      )
    )

    if (stats) {
      console.log("stats", stats);
      element.averageStat = stats.reduce((a, b) => a + b) / stats.length
    } else {
      element.averageStat = 0
    }
  });

  return pokemonTypes.slice(0,3).map((pokemon) =>{
    return {
      name: pokemon.name,
      height: pokemon.height,
      base_experience: pokemon.base_experience,
      id: pokemon.id,
      url: pokemon.url,
      stats: pokemon.stats,
      averageStat: pokemon.averageStat
    }
  })

}
