import { visualize, FactorioNode } from "./visualize";
import { solve2 } from "./generate"
import convertGridToFactorioBlueprint, { Blueprint } from './blueprintConverter'

export { FactorioNode } from "./visualize"
export { Blueprint } from "./blueprintConverter"

export interface Result {
    blueprint?: Blueprint,
    nodes: FactorioNode[]
}

export function generateBlueprint(inputs: number, outputs: number, splitters: number): Result {

    const factorioNodes = generateNodes(inputs, outputs, splitters)
    let blueprint: Blueprint | undefined

    try {
        const grid = visualize(factorioNodes);
        blueprint = convertGridToFactorioBlueprint(grid);
    }
    catch {
        console.log("Unable to generate blueprint")
    }

    return {
        blueprint: blueprint,
        nodes: factorioNodes
    }
}

function generateNodes(inputs: number, outputs: number, splitters: number): FactorioNode[] {
    const ratios = Array(outputs).fill(1)
    const nodes = solve2(inputs, outputs, splitters, ratios, [])!;
    return nodes.map(node => ({
            id: node.id,
            connection: node.connection,
            type: node.type == "connector" ? "splitter" : node.type,
            connected_to: [],
            connection_from: [],
            squares: []
    }));
}