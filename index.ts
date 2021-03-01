interface NodeInfo {
    id: number
    type: 'input' | 'output' | 'connector'
    connection: number[]
}

type Graph = NodeInfo[]

function getRandomArbitrary(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

function generate(inputs: number, outputs: number, connectors: number): Graph {
    const numberOfconnectors = connectors;
    const graph: Graph = []
    const inputNodeIds: number[] = []
    const outputNodeIds: number[] = []

    let nodeCount = 0
    for (let i = 0; i < inputs; i++) {
        const nodeId = nodeCount++;
        graph.push({ id: nodeId, type: 'input', connection: [] })
        inputNodeIds.push(nodeId)
    }

    for (let i = 0; i < numberOfconnectors; i++) {
        graph.push({ id: nodeCount++, type: 'connector', connection: [] })
    }

    for (let i = 0; i < outputs; i++) {
        const nodeId = nodeCount++;
        graph.push({ id: nodeId, type: 'output', connection: [] })
        outputNodeIds.push(nodeId)
    }

    const pathFromToOneOf = (sourceNodeId: number, destinationNodeId: number[]): boolean => {
        return graph[sourceNodeId].connection.some(connectionId => destinationNodeId.includes(connectionId))
            || graph[sourceNodeId].connection.some(connectionId => pathFromToOneOf(connectionId, destinationNodeId))
    }

    const inputsConnected = (): boolean => {
        return inputNodeIds.every(inputNodeId => pathFromToOneOf(inputNodeId, outputNodeIds))
    }

    while (!inputsConnected()) {
        const sourceId = getRandomArbitrary(0, graph.length - outputs);
        const destinationId = getRandomArbitrary(0, graph.length);
        if (sourceId == destinationId || inputNodeIds.includes(destinationId)) {
            continue;
        }
        const sourceOutputCount = graph[sourceId].connection.length;
        const destinationInputCount = graph.map(node => node.connection.includes(destinationId) ? 1 as number : 0).reduce((sum, value) => sum + value, 0);

        if (graph[sourceId].type === 'input' && sourceOutputCount >= 1) {
            continue;
        }

        if (sourceOutputCount < 2 && destinationInputCount < 2) {
            graph[sourceId].connection.push(destinationId);
        }
    }

    return graph;

    // return [
    //         { id: 0, type: 'input', connection: [3] }, 
    //         { id: 1, type: 'input', connection: [3] }, 
    //         { id: 2, type: 'input', connection: [4] }, 
    //         { id: 3, type: 'connector', connection: [5, 6] }, 
    //         { id: 4, type: 'connector', connection: [5, 6] }, 
    //         { id: 5, type: 'connector', connection: [7, 4] }, 
    //         { id: 6, type: 'connector', connection: [8, 9] }, 
    //         { id: 7, type: 'output', connection: [ ] },
    //         { id: 8, type: 'output', connection: [ ] },
    //         { id: 9, type: 'output', connection: [ ] }
    // ]
}

// function generate(inputs: number, outputs: number): Graph { 
//     return [
//         { id: 0, type: 'input', connection: [1] },
//         { id: 1, type: 'connector', connection: [1] },
//         { id: 2, type: 'output', connection: [] }
//     ]
// }


function getInputAndConnectionNodes(graph: Graph): NodeInfo[] {
    return graph.filter(node => node.type === 'input' || node.type === 'connector')
}

function getOutputNodes(graph: Graph): NodeInfo[] {
    return graph.filter(node => node.type === 'output')
}

function simulate(graph: Graph, inputState: number[]) {
    let iterationCount = 0;
    const iterationLimit = 100
    const acceptableDelta = 0.000001;
    const inputAndConnectionNodes = getInputAndConnectionNodes(graph);
    const outputNodes = getOutputNodes(graph)
    // const nodeInputs: number[] = graph.map(node => node.type === 'input' ? 1 : 0)
    const nodeInputs = inputState.map(v => v)
    const nodeInputsHistory = inputState.map(v => [v])

    // const nodeInputsSum: number[] = graph.map(node => node.type === 'input' ? [1] : [0])
    // const nodeInputsAverageHistory: number[][] = graph.map(node => node.type === 'input' ? [1] : [0])

    const adjustNodeInput = (nodeId: number, delta: number) => {
        const prev = nodeInputs[nodeId]
        nodeInputs[nodeId] += delta
        if (!Number.isNaN(prev) && Number.isNaN(nodeInputs[nodeId])) {
            console.log(nodeId, prev, delta, nodeInputs[nodeId])
        }
        nodeInputsHistory[nodeId].push(nodeInputs[nodeId])
    }

    const isSteadyState = () => {
        const terminated = inputAndConnectionNodes.every(node => nodeInputs[node.id] <= acceptableDelta);
        return terminated;
    }

    while (!(isSteadyState() || iterationCount > iterationLimit)) {
        for (const node of inputAndConnectionNodes) {
            if (node.connection.length == 0) {
                adjustNodeInput(node.id, -1 * nodeInputs[node.id])
                continue;
            }
            // console.log(node.id)
            // console.log(Object.entries(nodeInputs))
            const outputDelta = nodeInputs[node.id] / node.connection.length;
            const outputNodes = node.connection.map(nodeIdx => graph[nodeIdx])

            for (const outputNode of outputNodes) {
                adjustNodeInput(outputNode.id, outputDelta)
            }
            adjustNodeInput(node.id, -1 * outputDelta * node.connection.length)
        }
        iterationCount += 1;
    }

    return nodeInputs;
}

function printGraph(graph: Graph) {
    console.log(graph)
}

function aboutEqual(a: number, b: number, delta: number) {
    return b - delta <= a && a <= b + delta;
}

function arrayAboutEqual(a: number[], b: number[], delta: number): boolean {
    if (a.length !== b.length) {
        return false;
    }

    return a.every((a_value, a_idx) => aboutEqual(a_value, b[a_idx], delta));
}

function normalise(array: number[]) {
    const sum = array.reduce((sum, val) => sum + val, 0);
    return array.map(v => v / sum);
}

function solve(input: number, output: number, connectors: number, ratios: number[], options: any) {
    const normalisedRatios = normalise(ratios);

    const inputStates = Array(input).fill(0)
        .map((_, idx) => idx)
        .map(idx => Array(input + output + connectors).fill(0).map((_, innerIdx) => idx === innerIdx ? 1 : 0));

    
    let iterationCount = 0;
    while (true) {
        try {
            const graph = generate(input, output, connectors);

            const outputNodeIds = getOutputNodes(graph).map(node => node.id);

            const results = inputStates
                .map(inputState => simulate(graph, inputState))
                .map(result => outputNodeIds.map(outputNodeId => result[outputNodeId]));
            
            const graphStatisfiesRatios = results.every(result => arrayAboutEqual(result, normalisedRatios, 0.01));

            if (graphStatisfiesRatios) {
                console.log(results)
                return graph;
            }
        } catch (e) {
            
        }

        iterationCount += 1;
        if (iterationCount % 10000 === 0) {
            process.stdout.write(`\rIteration Count: ${iterationCount}`,)
        }
    }
}

function main() {

    const graph = solve(3, 3, 6, [3, 1, 1], {});
    printGraph(graph);
}

main()