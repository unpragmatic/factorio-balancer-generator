import { visualize, FactorioNode, display_grid } from "./visualize";
import { smartSolve} from "./generate"
import convertGridToFactorioBlueprint, { Blueprint } from './blueprintConverter'

const nodes = smartSolve(1, 2);
const factorioNodes: FactorioNode[] = nodes.map(node => ({
        id: node.id,
        connection: node.connection,
        type: node.type == "connector" ? "splitter" : node.type,
        connected_to: [],
        connection_from: [],
        squares: []
}));

const grid = visualize(factorioNodes);
const blueprint = convertGridToFactorioBlueprint(grid);

display_grid(grid)
console.log(JSON.stringify(blueprint))