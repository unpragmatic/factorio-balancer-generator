import { visualize, FactorioNode } from "./visualize";
import { smartSolve} from "./generate"
import convertGridToFactorioBlueprint, { Blueprint } from './blueprintConverter'

export default function generate(inputs: number, outputs: number): Blueprint {

    const nodes = smartSolve(inputs, outputs);
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