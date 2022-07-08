import { client } from '../core/client.js'
import { getData, getFistItem, getItems } from '../core/utils.js'
import FormData from 'form-data'
import { readFileSync, readdirSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert'

// Exemplo de upload em node js baseado na doc oficial da aws
// Adaptações foram feitas pois na doc oficial é usado somente html puro
// link para a doc original: https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-post-example.html#sigv4-post-example-file-upload

// função utilitária que retorna um buffer e metadados do arquivo a partir de um caminho absoluto
async function readFile (absoluteFilePath) {
  const extension = extname(absoluteFilePath).replace('.', '')
  const buffer = readFileSync(absoluteFilePath)
  const name = basename(absoluteFilePath)
  const size = buffer.byteLength
  return {
    name,
    buffer,
    size,
    extension
  }
}

// função utilitária para montar payload no formato de multipart/form-data
async function buildFormData ({ credentials, file }) {
  const form = new FormData()
  for (const [key, value] of Object.entries(credentials.fields)) {
    form.append(key, value)
  }

  form.append('file', file.buffer)

  return form
}

// função que retorna os headers requeridos pelo endpoint de upload da aws
async function buildUploadHeaders ({ formData }) {
  const boundary = formData.getBoundary()
  const contentLength = formData.getLengthSync()
  const contentType = `multipart/form-data; boundary=${boundary}`

  return {
    'content-type': contentType,
    'content-length': contentLength
  }
}

async function run () {
  // lendo arquivos de exemplo que estão na pasta "data" na raiz desse projeto
  const currentDirPath = fileURLToPath(import.meta.url)
  const dataDirPath = join(currentDirPath, '../../../data')
  const fileNames = readdirSync(dataDirPath)
  const absoluteFileNames = fileNames.map(fileName => join(dataDirPath, fileName))

  // array contento metadados e buffer para os arquivos
  const files = await Promise.all(absoluteFileNames.map(readFile))

  const attachments = []

  for (const file of files) {
    // requisição para obter as credenciais que serão usadas para o upload posteriormente
    const credentials = await client
      .post('/attachments/actions/generate-upload-credentials', {
        size: file.size,
        extension: file.extension
      })
      .then(getData)

    // montando payload com arquivo no formato de multipart/form-data
    // e campos adicionais com as credências necessárias para autenticação
    const formData = await buildFormData({ credentials, file })

    // montando headers requeridos pelo endpoint de upload
    const headers = await buildUploadHeaders({ formData })

    // fazendo upload diretamente para aws s3
    await client.post(credentials.baseUrl, formData, { headers })

    // salvando nome e link para o arquivo para vincular na manutenção posteriormente
    attachments.push({
      title: file.name,
      link: credentials.link
    })
  }

  // consultando um local qualquer para usar na abertura de manutenção
  const location = await client.get('/locations', {
    params: {
      page: 1,
      perPage: 1,
      documentNumberEq: '46849145851'
    }
  }).then(getFistItem)

  // consultando um segmento qualquer para usar na abertura de manutenção
  const segment = await client.get('/segments', {
    params: {
      page: 1,
      perPage: 1,
      nameEq: 'Ar condicionado'
    }
  }).then(getFistItem)

  // consultando um tipo de manutenção qualquer para usar na abertura de manutenção
  const maintenanceType = await client.get('/maintenance-types', {
    params: {
      page: 1,
      perPage: 1,
      nameEq: 'Manutenção corretiva'
    }
  }).then(getFistItem)

  // criando manutenção passando os anexos como argumento
  const maintenance = await client.post('/maintenances', {
    message: 'Manutenção de com anexos vinculados',
    location: { id: location.id },
    segment: { id: segment.id },
    maintenanceType: { id: maintenanceType.id },
    attachments
  }).then(getData)

  // consultando página de anexos vinculados a manutenção
  const createdAttachments = await client.get(`maintenances/${maintenance.id}/attachments`, {
    params: {
      page: 1,
      perPage: 10
    }
  }).then(getItems)

  // checa se a quantidade de anexos na manutenção é igual a esperada
  assert.equal(createdAttachments.length, files.length)

  for (const attachment of createdAttachments) {
    const file = files.find((file) => file.name === attachment.title)

    // checa se o titulo é igual ao esperado
    assert.equal(attachment.title, file.name)

    // consulta headers do arquivo usando o link que foi gerado
    const { status, headers } = await client.head(attachment.link)

    // checa se é retornado 200 ao acessar link do arquivo
    assert.equal(status, 200)

    // checa se o tamanho do arquivo é igual ao esperado
    assert.equal(headers['content-length'], file.size)
  }
}

run()
  .catch(err => {
    const error = err.isAxiosError ? err.toJSON() : err
    console.log('error: ', error)
    process.exit(1)
  })
