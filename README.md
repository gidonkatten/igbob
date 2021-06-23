# Issuing Green Bonds On Algorand Blockchain - Frontend

## Hosted 
Hosted at https://blockchain-bonds.herokuapp.com. To host the application yourself, one has to change the github actions YML file.

## Requirements
* Linux or macOS
* NPM

## Setup
Run `npm install`.

## Usage
To run locally use command `npm run dev`. If encounter `Failed to Compile` due to optional chaining in [IPFS](https://discuss.ipfs.io/t/react-ipfs-cannot-compile/11266) then I fixed this by changing line in file `node_modules/ipfs-core/src/components/add-all` to `const isRootDir = ! (file.path ? file.path.includes('/') : undefined)`.

## Backend Server
Throughout the code there are fetch requests to the server hosted at `https://igbob.herokuapp.com`. See https://github.com/gidonkatten/igbob-server.

## User Accounts
Authentication and accounts are handled using Auth0.
