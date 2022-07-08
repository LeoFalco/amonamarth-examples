# Amon Amarth Examples

![Field Control ♥](https://img.shields.io/badge/Field%20Control-♥-blue.svg)

:volcano: Amon Amarth ou Api publica do gestão de fornecedores é um web service rest que expõe os recursos afim de facilitar a que empresas façam integrações com seus outros sistemas.

Este é um repositório auxiliar contendo trechos de código e exemplos de uso.

## Pré-requisitos para executar o projeto

- Node version manager, caso não tenha o nvm instale seguindo estes passos
  - nvm para windows: https://github.com/coreybutler/nvm-windows
  - nvm pra mac/linux: https://github.com/nvm-sh/nvm#installing-and-updating

- Clonar este repo localmente `git clone https://github.com/LeoFalco/amonamarth-examples.git`

- Na pasta do projeto executar os seguintes comandos

  ```sh
  nvm install # para instalar o nome
  nvm use # troca para a versão do node instalada
  npm install # instala as dependências do projeto
  ```

- O projeto usa autenticação por de api key você pode declarar a sua dentro de um arquivo chamado `.env`
assim como na imagem:

  ![image](https://user-images.githubusercontent.com/25820906/178081437-c5939851-116e-44e1-8527-91dc6a63900c.png)

## Executando arquivos

Os arquivos de exemplos estão na pasta `src/examples` é possível executa-los diretamente pelo node

```sh
  node src/create-maintenance-with-attachment.js
```
