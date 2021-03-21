
export interface SearchNode {
    x: number
    y: number
    f_cost: number
    parent?: SearchNode
    traversable: boolean
}

export function shortest_path_between_nodes(start: SearchNode, finish: SearchNode, grid: SearchNode[][]): SearchNode[] {
    let open_nodes: SearchNode[] = [];
    let closed_nodes: SearchNode[] = [];
    let current_node: SearchNode | undefined = undefined

    open_nodes.push(start);

    while(open_nodes.length > 0) {
        // Find node with lowest f_cost in the open_nodes
        let mininum_f_cost = Math.min(...open_nodes.map(node => node.f_cost));
        current_node = open_nodes.find(node => node.f_cost === mininum_f_cost)!;

        // Remove current node from open
        open_nodes = open_nodes.filter(node => node !== current_node);
        closed_nodes.push(current_node);

        if (current_node.x == finish.x && current_node.y == finish.y) {
             break; 
        }

        // Check the surronding nodes
        let surronding_nodes: SearchNode[] = get_surronding_nodes_in_grid(current_node, grid);
        
        // Evalute the f_cost of the nodes
        for (const surrounding_node of surronding_nodes) {
            if (closed_nodes.includes(surrounding_node)) { continue; }

            let distance_from_start = distance_between_two_nodes(surrounding_node, start);
            let distance_from_finish = distance_between_two_nodes(surrounding_node, finish);

            let calulcated_f_cost = distance_from_start + distance_from_finish;

            surrounding_node.f_cost = calulcated_f_cost;
            surrounding_node.parent = current_node;

            open_nodes.push(surrounding_node);
        }
    }

    var path_to_finish: SearchNode[] = []
    
    while (current_node !== undefined && current_node.parent !== undefined) {
        path_to_finish.unshift(current_node)
        current_node = current_node.parent
    }

    return path_to_finish.slice(0, -1);
}

function get_surronding_nodes_in_grid(node: SearchNode, grid: SearchNode[][]): SearchNode[] {

    let surronding: SearchNode[] = []

    const x = node.x
    const y = node.y

    try {
        let left_node = grid[y][x - 1]
        if (left_node !== undefined && left_node.traversable) surronding.push(grid[y][x - 1])
    } catch(err) { }
    
    try {
        let right_node = grid[y][x + 1]
        if (right_node !== undefined  && right_node.traversable) surronding.push(grid[y][x + 1])
    } catch(err) { }
    
    try {
        let top_node = grid[y + 1][x]
        if (top_node !== undefined  && top_node.traversable) surronding.push(grid[y + 1][x])
    } catch(err) { }
    
    try {
        let bottom_node = grid[y - 1][x]
        if (bottom_node !== undefined  && bottom_node.traversable) surronding.push(grid[y - 1][x])
    } catch(err) { }

    return surronding
}

function distance_between_two_nodes(first: SearchNode, second: SearchNode): number {

    let x_diff = second.x - first.x
    let y_diff = second.y - first.y

    return Math.abs(x_diff) + Math.abs(y_diff)
}

let grid: SearchNode[][] = [
    [
        { x:0, y:0, f_cost: 0, traversable: true},
        { x:1, y:0, f_cost: 0, traversable: true},
        { x:2, y:0, f_cost: 0, traversable: true},
        { x:3, y:0, f_cost: 0, traversable: false},
    ],
    [
        { x:0, y:1, f_cost: 0, traversable: true},
        { x:1, y:1, f_cost: 0, traversable: true},
        { x:2, y:1, f_cost: 0, traversable: true},
        { x:3, y:1, f_cost: 0, traversable: true},
    ],
    [
        { x:0, y:2, f_cost: 0, traversable: true},
        { x:1, y:2, f_cost: 0, traversable: true},
        { x:2, y:2, f_cost: 0, traversable: false},
        { x:3, y:2, f_cost: 0, traversable: true},
    ],
    [
        { x:0, y:3, f_cost: 0, traversable: false},
        { x:1, y:3, f_cost: 0, traversable: true},
        { x:2, y:3, f_cost: 0, traversable: false},
        { x:3, y:3, f_cost: 0, traversable: true},
    ]
]

// let start = grid[0][0]
// let finish = grid[3][3]
// console.log(shortest_path_between_nodes(start, finish, grid))