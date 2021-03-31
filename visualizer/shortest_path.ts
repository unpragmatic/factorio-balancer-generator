import { notDeepEqual } from "node:assert";

export interface SearchNode {
    x: number
    y: number
    f_cost: number
    parent?: SearchNode
    traversable: boolean
    is_start: boolean
    is_destination: boolean
    direction?: 'north' | 'south' | 'east' | 'west'
}

export function shortest_path_between_nodes(start: SearchNode, finish: SearchNode, grid: SearchNode[][]): SearchNode[] {
    let open_nodes: SearchNode[] = [];
    let closed_nodes: SearchNode[] = [];
    let current_node: SearchNode | undefined = undefined

    // let start_node = start.direction !== undefined ? get_adjacent_node_from_node_with_direction(start, grid, 'exiting') : start
    // let target_node = finish.direction !== undefined ? get_adjacent_node_from_node_with_direction(finish, grid, 'entering') : finish
    let start_node = get_adjacent_node_from_node_with_direction(start, grid, 'exiting')
    let target_node = get_adjacent_node_from_node_with_direction(finish, grid, 'entering')

    open_nodes.push(start_node);

    while(open_nodes.length > 0) {
        // Find node with lowest f_cost in the open_nodes
        let mininum_f_cost = Math.min(...open_nodes.map(node => node.f_cost));
        current_node = open_nodes.find(node => node.f_cost === mininum_f_cost)!;

        // Remove current node from open
        open_nodes = open_nodes.filter(node => node !== current_node);
        closed_nodes.push(current_node);

        if (current_node.x == target_node.x && current_node.y == target_node.y) {
             break;
        }

        // Check the surronding nodes
        let surronding_nodes: SearchNode[] = get_surronding_nodes_in_grid(current_node, grid);
        
        // Evalute the f_cost of the nodes
        for (const surrounding_node of surronding_nodes) {
            if (closed_nodes.includes(surrounding_node)) { continue; }
            
            // Caluclate number of movement steps
            const distance_from_start = calculate_depth_of_node_from_first_parent(current_node)
            // let distance_from_start = distance_between_two_nodes(surrounding_node, start_node);
            let distance_from_finish = distance_between_two_nodes(surrounding_node, target_node);

            let calulcated_f_cost = distance_from_start + distance_from_finish;
            
            if (surrounding_node.f_cost === 0 || surrounding_node.f_cost > calulcated_f_cost) {
                surrounding_node.f_cost = calulcated_f_cost;
                surrounding_node.parent = current_node;
                open_nodes.push(surrounding_node);
            }
        
        }
    }

    var path_to_finish: SearchNode[] = []
    
    while (current_node !== undefined) {
        path_to_finish.unshift(current_node)
        current_node = current_node.parent
    }

    // return path_to_finish.slice(0, -1);
    return path_to_finish
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
        if (right_node !== undefined && right_node.traversable) surronding.push(grid[y][x + 1])
    } catch(err) { }
    
    try {
        let bottom_node = grid[y + 1][x]
        if (bottom_node !== undefined && bottom_node.traversable) surronding.push(grid[y + 1][x])
    } catch(err) { }
    
    try {
        let top_node = grid[y - 1][x]
        if (top_node !== undefined && top_node.traversable) surronding.push(grid[y - 1][x])
    } catch(err) { }

    return surronding
}

function calculate_depth_of_node_from_first_parent(node: SearchNode): number {
    let steps = 0
    let current_node: SearchNode | undefined = node
    while (current_node !== undefined) {
        steps++
        current_node = current_node.parent
    }
    return steps
}

function get_adjacent_node_from_node_with_direction(node: SearchNode, grid: SearchNode[][], connection_type: 'entering' | 'exiting'): SearchNode {

    const displacement_map = {
        'entering': 1,
        'exiting': -1
    }
    const displacement_factor = displacement_map[connection_type]
    
    switch (node.direction) {
    case "north":
        return grid[node.y + displacement_factor][node.x]
    case "south":
        return grid[node.y - displacement_factor][node.x]
    case "east":
        return grid[node.y][node.x - displacement_factor]
    case "west":
        return grid[node.y][node.x + displacement_factor]
    default:
        throw Error("Invalid node direction")
    }

}

function distance_between_two_nodes(first: SearchNode, second: SearchNode): number {

    let x_diff = second.x - first.x
    let y_diff = second.y - first.y

    return Math.abs(x_diff) + Math.abs(y_diff)
}
