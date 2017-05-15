# Contributing to ui-migration-stats

## Getting Started

To get started run:

```sh
git clone git@github.com:cloudflare/ui-migration-stats.git
```

or for https
```sh
git clone https://github.com/cloudflare/ui-migration-stats.git
cd ui-migration-stats
yarn install
yarn build
yarn demo
```
The demo task runs the tool on the example app found in `example`. 
Example code is from various random open source libraries.


## Development tasks

```sh
yarn build # Build the lib folder
yarn dev # Watch for changes in src and rebuild
yarn dev-test # Watch for changes in src,test and rebuild
yarn run clean # Delete node_modules and coverage folders
yarn lint # Run the eslint
yarn test # Run the tests
```

### Tests :)
```
yarn build
yarn test
```

### Linting
```
yarn lint
```
You can also format your code using
```
yarn format
``` 