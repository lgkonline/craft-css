import sass from "sass"
import fs from "fs"
import path from "path"

export function scssToCss(variables: string, outputFile: string) {
    const scss = `${variables}
    @import "node_modules/bootstrap/scss/bootstrap.scss";`

    const result = sass.compileString(scss, {
        loadPaths: [path.resolve(__dirname, "..")]
    })

    const currentDir = process.cwd()
    const outputFilePath = path.resolve(currentDir, outputFile)
    fs.writeFileSync(outputFilePath, result.css)
}
