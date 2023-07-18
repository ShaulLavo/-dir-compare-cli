#!/usr/bin/env node
import { compare } from 'dir-compare';
import fs from 'fs';
import { Command } from 'commander';
import inquirer from 'inquirer';
//@ts-ignore
import inquirerFilePath from 'inquirer-file-path';
import inquirerFuzzyPath from 'inquirer-fuzzy-path';
inquirer.registerPrompt('filePath', inquirerFilePath);
inquirer.registerPrompt('fuzzypath', inquirerFuzzyPath);
import os from "os";
const userHomeDir = os.homedir();
const program = new Command();
program
    .version('1.0.0')
    .description('A CLI tool to compare directories and write the differences to a file')
    .option('-d1, --dir1 <dir1>', 'first directory to compare')
    .option('-d2, --dir2 <dir2>', 'second directory to compare')
    .option('-o, --output <output>', 'output file name')
    .option('-i, --ignore <ignoreDirs...>', 'directories to ignore')
    .exitOverride();
program.parse();
async function compareAndWriteDifferences(dir1, dir2, outputFileName, ignoreDirs) {
    const options = {
        compareContent: true,
    };
    try {
        const res = await compare(dir1, dir2, options);
        const differences = res.diffSet?.filter((entry) => entry.state !== 'equal') ?? [];
        const ignorePatterns = ignoreDirs.flatMap((ignoreDir) => {
            const dotPrefixed = `.${ignoreDir}`;
            return [ignoreDir, dotPrefixed];
        });
        const filteredOutputLines = differences.filter((entry) => {
            const lowercasePath = entry.relativePath.toLowerCase();
            return !ignorePatterns.some((ignorePattern) => lowercasePath.includes(ignorePattern.toLowerCase()));
        });
        const outputLines = filteredOutputLines.map((entry) => {
            const path = entry.relativePath;
            const type = entry.type1 === 'missing' ? entry.type1 : entry.type2;
            const state = entry.state;
            const reason = entry.reason;
            const size1 = entry.size1?.toString();
            const size2 = entry.size2?.toString();
            const date1 = entry.date1?.toISOString();
            const date2 = entry.date2?.toISOString();
            return { path, type, state, reason, size1, size2, date1, date2 };
        });
        const output = outputLines
            .map((entry) => {
            const lines = [
                `Path: ${entry.path}`,
                `Type: ${entry.type}`,
                `State: ${entry.state}`,
                `Reason: ${entry.reason ?? ''}`,
                `Size1: ${entry.size1 ?? ''}`,
                `Size2: ${entry.size2 ?? ''}`,
                `Date1: ${entry.date1 ?? ''}`,
                `Date2: ${entry.date2 ?? ''}`,
            ];
            return lines.filter((line) => line.trim() !== '').join('\n');
        })
            .join('\n\n');
        const outputFilePath = `./${outputFileName}`;
        fs.writeFileSync(outputFilePath, output);
        console.log(`Differences written to ${outputFileName} in the current directory successfully!`);
    }
    catch (err) {
        console.error('Error occurred during directory comparison:', err);
    }
}
async function runProgram() {
    const { dir1, dir2, output, ignore } = program.opts();
    if (!dir1 || !dir2 || !output) {
        const questions = [];
        if (!dir1) {
            questions.push({
                type: 'fuzzypath',
                itemType: 'any',
                excludePath: (nodePath) => nodePath.startsWith('node_modules'),
                excludeFilter: (nodePath) => nodePath == '.',
                default: userHomeDir,
                name: 'dir1',
                message: 'Please enter the first directory to compare (e.g., /path/to/dir1): ',
                validate: (input) => {
                    return input.trim() !== '' ? true : 'First directory is required';
                },
            });
        }
        if (!dir2) {
            questions.push({
                type: 'fuzzypath',
                excludePath: (nodePath) => nodePath.startsWith('node_modules'),
                excludeFilter: (nodePath) => nodePath == '.',
                itemType: 'any',
                default: userHomeDir,
                name: 'dir2',
                message: 'Please enter the second directory to compare (e.g., /path/to/dir2): ',
                validate: (input) => {
                    return input.trim() !== '' ? true : 'Second directory is required';
                },
            });
        }
        if (!output) {
            questions.push({
                type: 'fuzzypath',
                excludePath: (nodePath) => nodePath.startsWith('node_modules'),
                excludeFilter: (nodePath) => nodePath == '.',
                itemType: 'any',
                name: 'output',
                message: 'Please enter the output file name (e.g., differences.txt): ',
                default: userHomeDir,
                validate: (input) => {
                    return input.trim() !== '' ? true : 'Output file name is required';
                },
            });
        }
        const answers = await inquirer.prompt(questions);
        await compareAndWriteDifferences(answers.dir1 || dir1, answers.dir2 || dir2, answers.output || output, ignore ?? []);
    }
    else {
        await compareAndWriteDifferences(dir1, dir2, output, ignore ?? []);
    }
}
await runProgram();
