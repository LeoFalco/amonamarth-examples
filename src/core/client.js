import axios from 'axios'
import 'dotenv/config'
import { XMLParser } from 'fast-xml-parser'
import { URL } from 'url'
const xmlParser = new XMLParser({ ignoreDeclaration: true })

const apiKey = process.env.API_KEY
console.log('loaded api key: ' + apiKey)

export const client = axios.create({
  baseURL: 'https://amonamarth.fieldcontrol.com.br',
  headers: {
    'content-type': 'application/json',
    'x-api-key': apiKey
  },
  validateStatus: () => true
})

function hasContentType (response, type) {
  return (response.headers['content-type'] || '').includes(type)
}

function xmlParserInterceptor (response) {
  if (hasContentType(response, 'application/xml')) {
    response.data = xmlParser.parse(response.data)
  }

  return response
}

function responseLoggerInterceptor (response) {
  const lines = []

  lines.push('### response')
  lines.push(`${response.status} ${response.statusText}`)

  if (response.data) {
    lines.push(JSON.stringify(response.data, null, 2))
  }

  lines.push('### end response')
  lines.push('')
  console.log(lines.join('\n'))

  return response
}

function requestLoggerInterceptor (config) {
  const url = new URL(config.url, config.baseURL)
  for (const param in config.params) {
    url.searchParams.append(param, config.params[param])
  }

  const lines = []
  lines.push('### request')
  lines.push(`${config.method.toUpperCase()} ${url.toString()}`)

  for (const key in config.headers) {
    const value = config.headers[key]
    if (typeof value !== 'object') {
      lines.push(`${key}: ${value}`)
    }
  }

  if (hasContentType(config, 'application/json')) {
    lines.push(JSON.stringify(config.data, null, 2))
  }

  lines.push('### end request')
  lines.push('')
  console.log(lines.join('\n'))
  return config
}

client.interceptors.request.use(requestLoggerInterceptor)
client.interceptors.response.use(xmlParserInterceptor)
client.interceptors.response.use(responseLoggerInterceptor)
