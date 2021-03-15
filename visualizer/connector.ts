
interface SearchNode {
    x: number
    y: number
    f_cost: number
    parent?: SearchNode
}

function shortest_path_between_nodes(start: SearchNode, finish: SearchNode, grid: SearchNode[][]): SearchNode[] {
    let open_nodes: SearchNode[] = [];
    let closed_nodes: SearchNode[] = [];

    open_nodes.push(start);

    while(open_nodes.length > 0) {
        // Find node with lowest f_cost in the open_nodes
        let mininum_f_cost = Math.min(...open_nodes.map(node => node.f_cost));
        let current_node = open_nodes.find(node => node.f_cost === mininum_f_cost)!;

        // Remove current node from open
        open_nodes = open_nodes.filter(node => node !== current_node);
        closed_nodes.push(current_node);

        if (current_node === finish) { break; }

        // Check the surronding nodes
        let surronding_nodes: SearchNode[] = get_surronding_nodes_in_grid(current_node, grid);
        
        // Evalute the f_cost of the nodes
        surronding_nodes.forEach(node => {
            if (closed_nodes.includes(node)) { return; }

            let distance_from_start = distance_between_two_nodes(node, start);
            let distance_from_finish = distance_between_two_nodes(node, finish);

            let calulcated_f_cost = distance_from_start + distance_from_finish;

            if (node.f_cost == 0 || node.f_cost > calulcated_f_cost) {
                node.f_cost = calulcated_f_cost;
                node.parent = current_node;

                if (!open_nodes.includes(node)) {
                    open_nodes.push(node);
                }
            }
        })
    }

    return closed_nodes;
}

function get_surronding_nodes_in_grid(node: SearchNode, grid: SearchNode[][]): SearchNode[] {

    let surronding: SearchNode[] = []

    const x = node.x
    const y = node.y

    try {
        let left_node = grid[x - 1][y]
        if (left_node !== undefined) surronding.push(grid[x - 1][y])
    } catch(err) { }
    
    try {
        let right_node = grid[x + 1][y]
        if (right_node !== undefined) surronding.push(grid[x + 1][y])
    } catch(err) { }
    
    try {
        let top_node = grid[x][y + 1]
        if (top_node !== undefined) surronding.push(grid[x][y + 1])
    } catch(err) { }
    
    try {
        let bottom_node = grid[x][y - 1]
        if (bottom_node !== undefined) surronding.push(grid[x][y - 1])
    } catch(err) { }

    return surronding
}

function distance_between_two_nodes(first: SearchNode, second: SearchNode): number {

    let x_diff = second.x - first.x
    let y_diff = second.y - first.y

    return x_diff + y_diff
}

let grid: SearchNode[][] = [
    [
        { x:0, y:0, f_cost: 0},
        { x:1, y:0, f_cost: 0},
        { x:2, y:0, f_cost: 0},
    ],
    [
        { x:0, y:1, f_cost: 0},
        { x:1, y:1, f_cost: 0},
        { x:2, y:1, f_cost: 0},
    ],
    [
        { x:0, y:2, f_cost: 0},
        { x:1, y:2, f_cost: 0},
        { x:2, y:2, f_cost: 0},
    ]
]

let start = grid[0][0]
let finish = grid[2][2]
console.log(shortest_path_between_nodes(start, finish, grid))