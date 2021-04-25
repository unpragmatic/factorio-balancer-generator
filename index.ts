import { Grid, visualize, FactorioNode } from "./visualize";
import { runSimulation } from "./generate"

export default function generate(inputs: number, outputs: number, connectors: number): Grid {
    
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

    return visualize(factorioNodes)
}