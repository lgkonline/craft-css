import sass from "sass"
import { promises as fs } from "fs"
import { exec } from "child_process"
import util from "util"
import path from "path"
import postcss from "postcss"
// @ts-expect-error
import postcssOnlyVars from "postcss-only-vars"
// @ts-expect-error
import postcssMinify from "postcss-minify"
import autoprefixer from "autoprefixer"
import { Command } from "commander"
import { StyleKey, styleKeys, styles, validateStyle } from "./styles"

const execPromise = util.promisify(exec)

const currentDir = process.cwd()
const cliRootDir = path.resolve(__dirname, "..")

type Options = {
    primary?: string
    output: string
    full: boolean
    style?: StyleKey
    minify?: boolean
    importBefore?: string
    importAfter?: string
    bootstrapVersion?: string
}

export const compile = new Command()
    .name("compile")
    .description("creates CSS")
    .option("-o, --output <path>", "path to output file", "out.css")
    .option("-f, --full", "export full CSS, not just the variables")
    .option("-p, --primary <color>", "primary color")
    .option(
        `-s, --style <${styleKeys.join("|")}>`,
        "type of style",
        validateStyle
    )
    .option(
        "--import-before <path>",
        "could be a path to file with custom Sass"
    )
    .option(
        "--import-after <path>",
        "could be a path to a file that overwrites CSS variables"
    )
    .option("--minify <true|false>", "minify output", true)
    .option(
        "--bootstrap-version <version>",
        "set version of Bootstrap",
        "latest"
    )
    .description("Creates a CSS file")
    .action((options) => {
        try {
            options.minify =
                options.minify === "true" || options.minify === true
            runCompile(options)
        } catch (error: any) {
            console.error(`Error executing command: ${error.message}`)
        }
    })

async function installDependencies(bootstrapVersion: string = "latest") {
    const installCommand = `npm i --prefix ${cliRootDir} bootstrap@${bootstrapVersion}`

    try {
        const { stdout, stderr } = await execPromise(installCommand)
        if (stdout) {
            console.log(`stdout: ${stdout}`)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`)
        }
    } catch (error: any) {
        console.error(`Error during npm install: ${error.message}`)
    }
}

async function scssImport(scssFile?: string) {
    if (scssFile) {
        const importBeforePath = path.resolve(currentDir, scssFile)
        return await fs.readFile(importBeforePath, {
            encoding: "utf-8"
        })
    }
    return ""
}

export async function runCompile({
    primary,
    output,
    full,
    style,
    minify = true,
    importBefore,
    importAfter,
    bootstrapVersion = "latest"
}: Options) {
    await installDependencies(bootstrapVersion)

    const outputFilePath = path.resolve(currentDir, output)

    const scssBefore = await scssImport(importBefore)
    const scssAfter = await scssImport(importAfter)

    const scss = `${scssBefore}${primary ? `$primary: ${primary};` : ""}${
        style ? styles[style] : ""
    }
    @import "node_modules/bootstrap/scss/bootstrap.scss";${scssAfter}`

    const sassResult = sass.compileString(scss, {
        loadPaths: [cliRootDir]
    })

    const postcssPlugins: postcss.AcceptedPlugin[] = [autoprefixer]

    if (minify) {
        postcssPlugins.push(postcssMinify)
    }

    if (!full) {
        postcssPlugins.push(postcssOnlyVars())
    }

    const result = await postcss(postcssPlugins).process(sassResult.css, {
        from: undefined,
        to: outputFilePath
    })

    await fs.writeFile(outputFilePath, result.css)
    if (result.map) {
        await fs.writeFile(outputFilePath + ".map", result.map.toString())
    }
}
