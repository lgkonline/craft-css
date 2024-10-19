#!/usr/bin/env node

import { Command } from "commander"
import { scssToCss } from "./scssToCss"

const program = new Command()
program.version("1.0.0")

program
    .command("greet [name]")
    .description("Greet the user by name")
    .action((name: string) => {
        console.log(`Hello, ${name || "World"}!`)
    })

program
    .command("compile [scss]")
    .option("-o, --output <string>", "path to output file", "out.css")
    .description("Creates a CSS file")
    .action((scss: string, options) => {
        try {
            const css = scssToCss(`$primary: blue;`, options.output)
        } catch (error: any) {
            console.error(`Error executing command: ${error.message}`)
        }
    })

// Parse the arguments passed to the CLI
program.parse(process.argv)

// Show help if no command is provided
if (!process.argv.slice(2).length) {
    program.outputHelp()
}
