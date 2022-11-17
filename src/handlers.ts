import { FastifyRequest, FastifyReply } from "fastify";
import { PokemonWithStats } from "models/PokemonWithStats";
import * as https from 'https';
const keepAliveAgent = new https.Agent({ keepAlive: true });

export async function getPokemonByName(request: FastifyRequest, reply: FastifyReply) {
  var name: string = request.params['name']

  reply.headers['Accept'] = 'application/json'

  var urlApiPokeman = `https://pokeapi.co/api/v2/pokemon/`;




  var params = {}

  name == null
    ? name.trim() != ''
      ? (console.log('Here 1'),params["name"] = name, /*urlApiPokeman = urlApiPokeman + '/', */urlApiPokeman = urlApiPokeman + name)
      : (urlApiPokeman = urlApiPokeman + "offset=20", urlApiPokeman = urlApiPokeman + "&limit=20")
    : (console.log('Here 2'), urlApiPokeman = urlApiPokeman + name + "?offset=20", urlApiPokeman = urlApiPokeman + "&limit=20")


  let response: any = ""

        response = await fetch('https://pokeapi.co/api/v2/pokemon/').then(data => data.json());
        console.log("response");
        const pokemonTypes = await computeResponse(response.results, reply)
        reply.send(pokemonTypes)

        return reply
  // response = await superagent.get(urlApiPokeman);

  if (response == null) {
    reply.code(404)
  }



  // reply.send(response)
}

export const computeResponse = async (response: unknown, reply: FastifyReply) => {
  const resp = response as any
  // console.log("resp", resp);

  let results = resp.map(type => type.url);
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
