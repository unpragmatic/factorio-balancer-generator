import { visualize, FactorioNode } from "./visualize";
import { runSimulation } from "./generate"
import convertGridToFactorioBlueprint, { Blueprint } from './blueprintConverter'

export default function generate(inputs: number, outputs: number, connectors: number): Blueprint {
    
    const nodes = runSimulation(inputs, outputs, connectors)
    const factorioNodes: FactorioNode[] = []
    nodes.forEach(node => {
        factorioNodes.push({
            id: node.id,
            connection: node.connection,
            type: node.type,
            connected_to: [],
            connection_from: [],
            squares: []
        })
    })

    const grid = visualize(factorioNodes)
    return convertGridToFactorioBlueprint(grid)
}