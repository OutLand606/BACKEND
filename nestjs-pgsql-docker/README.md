<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn add || npm i
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](LICENSE).

## Setup Test
+ You need to install Docker and Docker Compose on the server.

+ Clone the project from GitHub and navigate to the project directory.

+ Run yarn add or npm i to install dependencies.

+ Execute docker-compose -f ./docker-compose.yml up -d to initialize and start project containers.

+ Access the pgAdmin4 homepage at localhost:80 to access the PostgreSQL manager.

+ Verify the connection and initialize the table using the following command to create a test table:
    CREATE TABLE scams_table (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      is_scam BOOLEAN DEFAULT FALSE);

# API Test

## Get
http://localhost:3000/scams/2000 (find data by id)

http://localhost:3000/scams?limit=1000000 (get data, limit 1000000 records)

http://localhost:3000/scams (get data all data, limit 1000000 records)

http://localhost:3000/scams/dummy-data (generate 1 million records insert to database)

http://localhost:3000/scams/search-engine?email=Destin (check mail scam by email, search by string)

http://localhost:3000/scams/check-scam-email?email=Zackery29@hotmail.com (check mail scam by email)(test)

## Post
http://localhost:3000/scams (body = [{}] || {})

# AWS
## connect ssh 
sudo ssh -i outland-aws.pem ubuntu@175.41.153.97

## Check docker-compose.yml
Adjust the CPU and RAM according to the configuration if using AWS. default 4core, 4gbRam