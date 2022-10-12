# Twitch Player API
Twitch Player API is a RESTful API which allow getting VOD from free and sub-only Twitch channels.

## Production
### Configuration
Copy `env.example` and edit the environment variables:
```sh
cp .env.example .env
nano .env.example
```

### Installation
Move `docker-compose.yml` to te deploy folder and run:
```sh
docker compose up -d
```


## Development
Run the project:
```sh
yarn dev
```

Build the docker image:
```sh
yarn docker
```