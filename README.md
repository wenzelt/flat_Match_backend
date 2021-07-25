# FlatMatch backend

## Setup (before first run)

Go to your project root folder via command line
```
cd path/to/workspace/backend
```

**Install node dependencies**

```
npm install
```

**Set the environment variables**

1. Copy the pre-distributed .env.dist file to a .env file in the root directory of the backend project.

2. Modify the .env file if necessary.

## Start the project

**Development environment**

Run the backend (dev mode)
```sh
npm run dev
```

**Production environment**
Run the backend (quick run)
```sh
# build only once before running (no need, if dist/ is generated)
npm run build

# run the server
npm run start
```

**DB Access**
How to access DB with 3rd party tools
# Use the credentials and your tool of choice to connect to mongoDB through GUI tools

```mongodb+srv://${DB_USER}:${DB_PASS}@flatmatch-frankfurt.mhfhi.mongodb.net/FlatMatch?retryWrites=true&w=majority```