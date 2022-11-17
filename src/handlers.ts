import { FastifyRequest, FastifyReply } from "fastify";

export async function getPokemonByName(request: FastifyRequest, reply: FastifyReply) {
  var name: string = request.params['name']

  reply.headers['Accept'] = 'application/json'

  var urlApiPokeman = 'https://pokeapi.co/api/v2/pokemon/';





/*  name == null
    ? name.trim() != ''
      ? (console.log('Here 1'),params["name"] = name, /!*urlApiPokeman = urlApiPokeman + '/', *!/urlApiPokeman = urlApiPokeman + name)
      : (urlApiPokeman = urlApiPokeman + "offset=20", urlApiPokeman = urlApiPokeman + "&limit=20")
    : (console.log('Here 2'), urlApiPokeman = urlApiPokeman + name + "?offset=20", urlApiPokeman = urlApiPokeman + "&limit=20")*/

  name ? urlApiPokeman += name + "?offset=20" + "&limit=20" : urlApiPokeman += "?offset=20&limit=20"

  console.log('urlApiPokeman', urlApiPokeman);


  let response: any = ""


        console.log("response");
        try {
          response = await fetch(urlApiPokeman).then(data => data.json());
          // console.log("response", response);
          // reply.send(response);
          // return
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
  // let results = await resp.map(type => { return type.url })/*.reduce((results, typeUrl) => results.push(typeUrl));*/
  console.log("results", results);

  let pokemonTypes = []

  for (const element of results) {

    // http.request({ hostname: element }, (response) => pokemonTypes.push(response))
    // 2nd url
          const response2 = await fetch('https://pokeapi.co/api/v2/pokemon/' + element.split('/')[6]).then(data => data.json());
          console.log("response");
          pokemonTypes.push(response2)

  }

  if (pokemonTypes == undefined)
    throw pokemonTypes

  pokemonTypes.forEach(element => {
    var stats = []

    pokemonTypes.map(pok =>
      pok.stats.map(st =>
        // st.stat.name.toUpperCase() == element.name
        pok.name.toUpperCase() == element.name.toUpperCase()
          ? stats.push(st.base_stat)
          : ([])
      )
    )

    if (stats) {
      console.log("stats", stats);
      let avg = stats.reduce((a, b) => a + b) / stats.length
      element.averageStat = avg
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
