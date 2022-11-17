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

  await https.get({ host: 'pokeapi.co',  path: '/api/v2/pokemon/', agent: keepAliveAgent},
    (result) => {
      var str = '';

      result.on('data', (chunk) => {
        str += chunk;
      })
      result.on('end', async function() {
        console.log("str");
        console.log(str);
        response = str
        console.log("response");
        const pokemonTypes = await computeResponse(JSON.parse(response).results, reply)
        // reply.send(pokemonTypes)

        // return reply
      });
      result.on('socket', function (x) {
        console.log(x);
      })
    }).end()
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
    await https.get({ host: 'pokeapi.co',  path: '/api/v2/pokemon/' + element.split('/')[6], agent: keepAliveAgent },
      (result) => {
        var str = '';

        result.on('data', (chunk) => {
          str += chunk;
        })
        result.on('end', () => {
          console.log("str");
          console.log(str);
          const response2 = str
          console.log("response");
          pokemonTypes.push(JSON.parse(response2))

        });
        result.on('socket', (x) => {
          console.log(x);
        })
      }).end()
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

  reply.send(pokemonTypes.slice(0,3))

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
