# Code Challenge Solutions

This repo contains the solutions to the code challenges.

## Usage

Both solutions are presented as JS functions and CLI commands.

### Flatten

To use the `flatten` function, you can use `require()` it directly:

```js
var flatten = require('./src/flatten.js');

console.log(flatten([1,[2, [3]], 4]));
```

To use on JSON data via CLI, use the `flattenize` script:

```bash
cat <file> | bin/flattenize
```

Use `--help` or `--about` for command-line usage.

### Secrecy

To encode a message, use the `hush` script:

```bash
# use STDIN to process a message
cat myMessage.txt | bin/hush

# optional: output to a file
cat myMessage.txt | bin/hush > encodedMessage.txt
```

To decode the message, you can use the `hush -d` command:

```bash
# use STDIN
cat encodedMessage.txt | bin/hush --decode

# optional: output to a file
cat encodedMessage.txt | bin/unhush -d > decodedMessage.txt
```
