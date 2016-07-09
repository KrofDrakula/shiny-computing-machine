# Code Challenge Solutions

This repo contains the solutions to the code challenge presented
by Resource Guru. The _"cryptographic"_ puzzle source is in
[this Gist](https://gist.github.com/kmckelvin/41a4a69e397b510274373aa241698561).

## Usage

Both solutions are presented as JS functions and CLI commands.
Should work with any recent node version (6.x).

After checking out, install the dependencies:

```bash
npm install
```

To run the suite of tests:

```bash
npm test
```

The tests are located in the `/test` directory and contain BDD-style
tests as documentation for each of the functions.

### Flatten

![](http://media.giphy.com/media/QfPdIVqn41bag/giphy.gif)

To use the `flatten` function, you can use `require()` it directly:

```js
var flatten = require('./src/flatten.js');
console.log(flatten([1,[2, [3]], 4]));
```

To use on JSON data via CLI, use the `flattenize` script:

```bash
cat file.json | bin/flattenize
```

Use `--help` or `--about` for command-line usage.

### Secrecy

![](https://i.imgur.com/OZPQZww.gif)

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

### BONUS SHOT

![](http://scoopempire.com/wp-content/uploads/2016/02/tumblr_ndndzohztZ1ru8wu1o1_400-1.gif)

Try this:

```bash
cat sample/cry-for-help.txt | bin/hush | bin/hush -d
```
