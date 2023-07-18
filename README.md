
# dir-compare-cli
**Note: This document is a work in progress and may contain inaccuracies.**

## Installation

You can install `dir-compare-cli` globally using npm:

```shell
npm install -g dir-compare-cli
```

Make sure you have Node.js installed on your machine.

## Usage

To compare directories and generate a differences report, use the `dir-compare` command followed by the directory paths and options:

```shell
dir-compare <dir1> <dir2> [options]
```

**Options:**

- `-o, --output <file>`: Specify the output file name. Default is `differences.txt`.
- `-i, --ignore <dirs>`: Specify directories to ignore during the comparison. Separate multiple directories with a comma.
- `-h, --help`: Display the help message.

**Example usage:**

```shell
dir-compare path/to/first/directory path/to/second/directory -o output.txt -i git,fit
```

The command above compares the directories `path/to/first/directory` and `path/to/second/directory`, ignores the directories `git` and `fit`, and saves the differences report to `output.txt`.
## Contributing

Contributions are welcome! If you find any issues or have suggestions, please create an issue on the GitHub repository.

## License
This project is licensed under the MIT License. See the `LICENSE` file for more details.

