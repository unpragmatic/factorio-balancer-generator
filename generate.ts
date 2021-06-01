interface NodeInfo {
    id: number
    type: 'input' | 'output' | 'splitter'
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
        graph.push({ id: nodeCount++, type: 'splitter', connection: [] })
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
    //         { id: 3, type: 'splitter', connection: [5, 6] }, 
    //         { id: 4, type: 'splitter', connection: [5, 6] }, 
    //         { id: 5, type: 'splitter', connection: [7, 4] }, 
    //         { id: 6, type: 'splitter', connection: [8, 9] }, 
    //         { id: 7, type: 'output', connection: [ ] },
    //         { id: 8, type: 'output', connection: [ ] },
    //         { id: 9, type: 'output', connection: [ ] }
    // ]
}

// function generate(inputs: number, outputs: number): Graph { 
//     return [
//         { id: 0, type: 'input', connection: [1] },
//         { id: 1, type: 'splitter', connection: [1] },
//         { id: 2, type: 'output', connection: [] }
//     ]
// }


function getInputAndConnectionNodes(graph: Graph): NodeInfo[] {
    return graph.filter(node => node.type === 'input' || node.type === 'splitter')
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

export function runSimulation(inputs: number, outputs: number, connectors: number): Graph {
    let i = 0;

    return [
            { id: 0, type: 'input', connection: [3] }, 
            { id: 1, type: 'input', connection: [3] }, 
            { id: 2, type: 'input', connection: [4] }, 
            { id: 3, type: 'splitter', connection: [5, 6] }, 
            { id: 4, type: 'splitter', connection: [7, 8] }, 
            { id: 5, type: 'output', connection: [ ] },
            { id: 6, type: 'output', connection: [ ] },
            { id: 7, type: 'output', connection: [ ] },
            { id: 8, type: 'output', connection: [ ] }
    ]

    while (true) {
        try {
            const graph = generate(inputs, outputs, connectors);

            const inputStates = [
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
            ]

            const results = []
            for (const inputState of inputStates) {
                const result = simulate(graph, inputState);
                const target = [1 / 3, 1 / 3, 1 / 3]

                results.push(result);
            }

            const allGood = results.every(result => aboutEqual(result[7], 1 / 3, 0.01) && aboutEqual(result[8], 1 / 3, 0.01) && aboutEqual(result[9], 1 / 3, 0.01))
            if (allGood) {
                printGraph(graph)
                return graph;
            }
        } catch (e) {
            // console.log(e)
        }
        i += 1;
    }
}