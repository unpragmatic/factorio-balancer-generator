interface NodeInfo {
    id: number
    type: NodeType
    connection: number[]
}

type NodeType = 'input' | 'output' | 'connector'
type Graph = NodeInfo[]
type Edge = [number, number]


function getRandomArbitrary(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

function* possible_graphs(inputs: number, outputs: number, connectors: number) {
    const [initial_graph, inputNodeIds, outputNodeIds] = generate_initial_graph(inputs, outputs, connectors);
    const graphs: Graph[] = [ initial_graph ];
    console.log(possible_edges(initial_graph).length);

    const pathFromToOneOf = (graph: Graph, sourceNodeId: number, destinationNodeId: number[], visited: number[]): boolean => {
        return !visited.includes(sourceNodeId) && (
            graph[sourceNodeId].connection.some(connectionId => destinationNodeId.includes(connectionId))
            || graph[sourceNodeId].connection.some(connectionId => pathFromToOneOf(graph, connectionId, destinationNodeId, [...visited, sourceNodeId]))
        )
    }

    const inputsConnected = (graph: Graph): boolean => {
        return inputNodeIds.every(inputNodeId => pathFromToOneOf(graph, inputNodeId, outputNodeIds, []))
    }

    while (graphs.length !== 0) {
        const current_graph = graphs.pop()!;
        const current_graph_possible_edges = possible_edges(current_graph); 

        for (const [src_node_id, dst_node_id] of current_graph_possible_edges) {
            const child_graph = [...current_graph];
            child_graph[src_node_id] = { ...child_graph[src_node_id] };
            child_graph[src_node_id].connection = [ ...child_graph[src_node_id].connection, dst_node_id ];
            graphs.push(child_graph);
        }
        if (inputsConnected(current_graph)) {
            yield current_graph;
        }
    }
}

function* possible_graphs2(inputs: number, outputs: number, connectors: number): Generator<Graph, void, void> {
    const [initial_graph, inputNodeIds, outputNodeIds] = generate_initial_graph(inputs, outputs, connectors);
    const initial_graph_possible_edges = possible_edges(initial_graph);
    const initial_graph_connectivity_info: [number, number, NodeType][] = initial_graph.map(node => [0, 0, node.type]);

    const pathFromToOneOf = (graph: Graph, sourceNodeId: number, destinationNodeId: number[]): boolean => {
        return graph[sourceNodeId].connection.some(connectionId => destinationNodeId.includes(connectionId))
            || graph[sourceNodeId].connection.some(connectionId => pathFromToOneOf(graph, connectionId, destinationNodeId))
    }

    const inputsConnected = (graph: Graph): boolean => {
        return inputNodeIds.every(inputNodeId => pathFromToOneOf(graph, inputNodeId, outputNodeIds))
    }

    const convert_edge_combination_to_graph = (edge_combination: number[]): Graph => {
        const edges = initial_graph_possible_edges.filter((_, idx) => edge_combination[idx] === 1);
        const [graph] = generate_initial_graph(inputs, outputs, connectors);
        for (const [src_node_id, dst_node_id] of edges) {
            graph[src_node_id].connection.push(dst_node_id);
        }

        return graph;
    }

    const edge_combination_generator = edge_combination_helper(initial_graph_possible_edges, initial_graph_connectivity_info);
    let current_edge_combination = edge_combination_generator.next();
    while (!current_edge_combination.done) {
        const graph = convert_edge_combination_to_graph(current_edge_combination.value);
        if (inputsConnected(graph)) {
            yield graph;
        }
        current_edge_combination = edge_combination_generator.next();
    }
}


function* edge_combination_helper(edges: Edge[], connectivity_info: [number, number, NodeType][]): Generator<number[], void, void> {
    if (edges.length === 0) {
        yield [];
        return;
    }

    const [src_node_id, dst_node_id] = edges[0];

    
    const included_edge_connectivity_info = [ ...connectivity_info ]
    included_edge_connectivity_info[dst_node_id] = [ ...included_edge_connectivity_info[dst_node_id]];
    included_edge_connectivity_info[dst_node_id][0] += 1;
    included_edge_connectivity_info[src_node_id] = [ ...included_edge_connectivity_info[src_node_id]];
    included_edge_connectivity_info[src_node_id][1] += 1;
    const included_edge_sub_edges = edges.slice(1)
        .map<[[number, number], number]>(([src_node_id, dst_node_id], idx) => [[src_node_id, dst_node_id], idx])
        .filter(([[src_node_id, dst_node_id], idx]) => {
            const [src_node_inputs, src_node_outputs, src_node_type] = connectivity_info[src_node_id];
            const [dst_node_inputs, dst_node_outputs, dst_node_type] = connectivity_info[dst_node_id];
            const max_ouputs = maximum_number_of_outputs(src_node_type);
            const max_inputs = maximum_number_of_inputs(dst_node_type);
            if (src_node_outputs >= max_ouputs) {
                return false;
            }
            if (dst_node_inputs >= max_inputs) {
                return false;
            }
            return true;
        });
    const included_edge_combinations = edge_combination_helper(included_edge_sub_edges.map(([edge, idx]) => edge), included_edge_connectivity_info);
    let current_included_edge_combination = included_edge_combinations.next();
    const zeros = edges.map(e => 0);
    while (!current_included_edge_combination.done) {
        const combination = [ ...zeros ];
        combination[0] = 1;
        for (let i = 0; i < current_included_edge_combination.value.length; i++) {
            combination[included_edge_sub_edges[i][1]] = current_included_edge_combination.value[i];
        }
        yield combination;
        current_included_edge_combination = included_edge_combinations.next();
    }

    const excluded_edge_connectivity_info = connectivity_info;
    const excluded_edge_sub_edges = edges.slice(1);
    const excluded_edge_combinations = edge_combination_helper(excluded_edge_sub_edges, excluded_edge_connectivity_info);
    let current_excluded_edge_combination = excluded_edge_combinations.next();
    while (!current_excluded_edge_combination.done) {
        yield [ 0, ...current_excluded_edge_combination.value];
        current_excluded_edge_combination = excluded_edge_combinations.next();
    }
}


function maximum_number_of_inputs(node_type: NodeType): number {
    if (node_type === 'input') {
        return 0;
    } else if (node_type === 'output') {
        return 1;
    } else if (node_type === 'connector') {
        return 2;
    }
    throw `Invalid NodeType: ${node_type}`
}

function maximum_number_of_outputs(node_type: NodeType): number {
     if (node_type === 'input') {
        return 1;
    } else if (node_type === 'output') {
        return 0;
    } else if (node_type === 'connector') {
        return 2;
    }
    throw `Invalid NodeType: ${node_type}`
}

function possible_edges(graph: Graph): Edge[] {
    const edges: Edge[] = []

    for (const src_node of graph) {
        
        // Disallow exceeding maximum number of outputs
        const src_node_max_outputs = maximum_number_of_outputs(src_node.type);
        if (src_node.connection.length >= src_node_max_outputs) {
            continue;
        }

        for (const dst_node of graph) {
            // Disallow self connection
            if (dst_node.id == src_node.id) {
                continue;
            }

            // Disallow exceeding maximum number of inputs
            const dst_node_max_inputs = maximum_number_of_inputs(dst_node.type);

            // FIX
            const dst_node_inputs = find_inputs(graph, dst_node.id);
            if (dst_node_inputs >= dst_node_max_inputs) {
                continue;
            }

            edges.push([src_node.id, dst_node.id]);
        }
    }
    return edges;
}

function find_inputs(graph: Graph, node_id: number): number {
    let input_count = 0;
    for (const node of graph) {
        for (const dst_node of node.connection) {
            if (dst_node === node_id) {
                input_count += 1;
            }
        }
    }

    return input_count;
}

function generate_initial_graph(inputs: number, outputs: number, connectors: number): [Graph, number[], number[]] {
    const graph: Graph = []
    const inputNodeIds: number[] = []
    const outputNodeIds: number[] = []

    let nodeCount = 0
    for (let i = 0; i < inputs; i++) {
        const nodeId = nodeCount++;
        graph.push({ id: nodeId, type: 'input', connection: [] })
        inputNodeIds.push(nodeId)

    }

    for (let i = 0; i < connectors; i++) {
        const nodeId = nodeCount++;
        graph.push({ id: nodeId, type: 'connector', connection: [] })
    }

    for (let i = 0; i < outputs; i++) {
        const nodeId = nodeCount++;
        graph.push({ id: nodeId, type: 'output', connection: [] })
        outputNodeIds.push(nodeId)
    }

    return [graph, inputNodeIds, outputNodeIds];
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


function solve2(inputs: number, outputs: number, connectors: number, ratios: number[], options: any): Graph | undefined {
    const normalisedRatios = normalise(ratios);

    const inputStates = Array(inputs).fill(0)
        .map((_, idx) => idx)
        .map(idx => Array(inputs + outputs + connectors).fill(0).map((_, innerIdx) => idx === innerIdx ? 1 : 0));

    
    let iterationCount = 0;
    const all_possible_graphs = possible_graphs(inputs, outputs, connectors)
    let current_graph = all_possible_graphs.next();
    while (!current_graph.done) {
        // Start
        const graph = current_graph.value;

        // Do work
        const outputNodeIds = getOutputNodes(graph).map(node => node.id);

        const results = inputStates
            .map(inputState => simulate(graph, inputState))
            .map(result => outputNodeIds.map(outputNodeId => result[outputNodeId]));
        
        const graphStatisfiesRatios = results.every(result => arrayAboutEqual(result, normalisedRatios, 0.01));

        if (graphStatisfiesRatios) {
            console.log(results)
            return graph;
        
        
        }

        iterationCount += 1;
        if (iterationCount % 10000 === 0) {
            process.stdout.write(`\rIteration Count: ${iterationCount}`,)
        }

        // Get next
        current_graph = all_possible_graphs.next();
    }

    return undefined;
}



function solve3(inputs: number, outputs: number, connectors: number, ratios: number[], options: any): Graph | undefined {
    const normalisedRatios = normalise(ratios);

    const inputStates = Array(inputs).fill(0)
        .map((_, idx) => idx)
        .map(idx => Array(inputs + outputs + connectors).fill(0).map((_, innerIdx) => idx === innerIdx ? 1 : 0));

    
    let iterationCount = 0;
    const all_possible_graphs = possible_graphs2(inputs, outputs, connectors)
    let current_graph = all_possible_graphs.next();
    while (!current_graph.done) {
        // Start
        const graph = current_graph.value;

        // Do work
        const outputNodeIds = getOutputNodes(graph).map(node => node.id);

        const results = inputStates
            .map(inputState => simulate(graph, inputState))
            .map(result => outputNodeIds.map(outputNodeId => result[outputNodeId]));
        
        const graphStatisfiesRatios = results.every(result => arrayAboutEqual(result, normalisedRatios, 0.01));

        if (graphStatisfiesRatios) {
            console.log(results)
            return graph;
        
        
        }

        iterationCount += 1;
        if (iterationCount % 10000 === 0) {
            process.stdout.write(`\rIteration Count: ${iterationCount}`,)
        }

        // Get next
        current_graph = all_possible_graphs.next();
    }

    return undefined;
}

function main() {
    const inputs = 4;
    const outputs = 6;
    const connectors = 24;
    const ratio = [1, 1, 1];
    
    // console.time('solvev1');
    // let graph = solve(inputs, outputs, connectors, ratio, {})!;
    // printGraph(graph);
    // console.timeEnd('solvev1');

    console.time('solvev2');
    let graph = solve2(inputs, outputs, connectors, ratio, {})!;
    printGraph(graph);
    console.timeEnd('solvev2');

    // console.time('solvev3');
    // graph = solve3(inputs, outputs, connectors, ratio, {})!;
    // printGraph(graph);
    // console.timeEnd('solvev3');
}

main()