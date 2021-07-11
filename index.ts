import { visualize, FactorioNode } from "./visualize";
import { solve2 } from "./generate"
import convertGridToFactorioBlueprint, { Blueprint } from './blueprintConverter'

export default function generate(inputs: number, outputs: number, splitters: number): Blueprint {

    const ratios = Array(outputs).fill(1)
    const nodes = solve2(inputs, outputs, splitters, ratios, [])!;
    const factorioNodes: FactorioNode[] = nodes.map(node => ({
            id: node.id,
            connection: node.connection,
            type: node.type == "connector" ? "splitter" : node.type,
            connected_to: [],
            connection_from: [],
            squares: []
    }));

    const grid = visualize(factorioNodes);
    return convertGridToFactorioBlueprint(grid);
}