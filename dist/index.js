#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const compile_1 = require("./compile");
const package_json_1 = __importDefault(require("../package.json"));
const program = new commander_1.Command()
    .name("craft-css")
    .description("helps you to add Bootstrap CSS and customize it")
    .version(package_json_1.default.version || "1.0.0", "-v, --version", "display the version number")
    .addCommand(compile_1.compile)
    .parse(process.argv);
// Show help if no command is provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
