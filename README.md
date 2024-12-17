## Getting Started

For building your docs:

```bash 
npx docoru build
```

To start simple http server:

```bash 
npx http-server ./build --hostname 0.0.0.0 --port 3000
```

## Development

### Prepare

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

nvm install 18
nvm use 18
```

### Run

```bash
npm run dev
```