import { deflateSync } from 'zlib'

import { visualize, FactorioNode, display_grid } from "./visualize";
import { smartSolve} from "./generate"
import convertGridToFactorioBlueprint, { Blueprint } from './blueprintConverter'

const nodes = smartSolve(2, 3);
const factorioNodes: FactorioNode[] = nodes.map(node => ({
        id: node.id,
        connection: node.connection,
        type: node.type == "connector" ? "splitter" : node.type,
        connected_to: [],
        connection_from: [],
        squares: []
}));

console.log(factorioNodes)
const grid = visualize(factorioNodes);
const blueprint = convertGridToFactorioBlueprint(grid);

display_grid(grid)
var blueprintString = JSON.stringify(blueprint)
var input = Buffer.from(blueprintString, 'utf8')

const result = deflateSync(input)
const encode = Buffer.from(result).toString("base64")

console.log('0' + encode)
