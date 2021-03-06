import request from 'superagent'
import QuickLRU from 'quick-lru'
import { Agent } from 'http'

const { pelias } = global.__vandelay_util_config
const agent = new Agent({ keepAlive: true })
const lru = new QuickLRU({ maxSize: 10000 })

const makeRequest = (opts) =>
  request.get(opts.host)
    .retry(10)
    .type('json')
    .agent(agent)
    .set('apikey', pelias.key)
    .query(opts.query)

const parseResponse = (body) => {
  const res = body.features[0]
  return {
    type: res.geometry.type,
    coordinates: res.geometry.coordinates,
    properties: {
      short: res.properties.name,
      full: res.properties.label,
      city: res.properties.locality,
      county: res.properties.county,
      region: res.properties.region,
      country: res.properties.country
    }
  }
}
const handleQuery = async (opts) => {
  try {
    const { body } = await makeRequest(opts)
    if (!body || !body.features || !body.features[0]) return
    return parseResponse(body)
  } catch (err) {
    if (err.response && err.response.body && err.response.body.error) {
      throw new Error(`${err.response.body.error} (in geo.search)`)
    }
    throw new Error(`${err.message || err} (in geo.search)`)
  }
}

export default async ({ text }) => {
  if (!pelias) throw new Error('Missing pelias configuration option (in geo.search)')
  if (!text) throw new Error('Missing address text (in geo.search)')
  const query = { text }

  const lruKey = JSON.stringify(query)
  if (lru.has(lruKey)) return lru.get(lruKey)

  const opts = {
    query,
    host: pelias.hosts.search
  }

  const out = handleQuery(opts)

  if (!out) return
  // put it in cache for later
  lru.set(lruKey, out)
  return out
}
