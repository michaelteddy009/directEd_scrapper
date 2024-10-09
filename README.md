
## NOTE
This code was tested on node version 22.7 and npm version 10.8.2

## Installation

You can install the package via npm:

```bash
npm install
```

## Usage
Scrap data from San Jose

```
npm run scrap san_jose 2
```

NB: notice how we join the name with an _ and all letters are small. 2 is an optional field that represents cpu cores your computer can handle, default is 1, use it to speed request but know that you avvo might block you if the requests exhausts the server.
