#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const scssToCss_1 = require("./scssToCss");
const program = new commander_1.Command();
program.version("1.0.0");
program
    .command("greet [name]")
    .description("Greet the user by name")
    .action((name) => {
    console.log(`Hello, ${name || "World"}!`);
});
program
    .command("compile [scss]")
    .option("-o, --output <string>", "path to output file", "out.css")
    .description("Creates a CSS file")
    .action((scss, options) => {
    try {
        const css = (0, scssToCss_1.scssToCss)(`$primary: blue;`, options.output);
    }
    catch (error) {
        console.error(`Error executing command: ${error.message}`);
    }
});
// Parse the arguments passed to the CLI
program.parse(process.argv);
// Show help if no command is provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
