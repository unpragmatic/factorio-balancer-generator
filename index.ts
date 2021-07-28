import { visualize, FactorioNode } from "./visualize";
import { solve2 } from "./generate"
import convertGridToFactorioBlueprint, { Blueprint } from './blueprintConverter'

export function generateBlueprint(inputs: number, outputs: number, splitters: number): Blueprint {

    const factorioNodes = generateNodes(inputs, outputs, splitters)

    const grid = visualize(factorioNodes);
    return convertGridToFactorioBlueprint(grid);
}

export function generateNodes(inputs: number, outputs: number, splitters: number): FactorioNode[] {
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
