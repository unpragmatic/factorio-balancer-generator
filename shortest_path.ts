import { Coordinate } from "./node_connector";

export interface SearchNode {
    x: number
    y: number
    f_cost: number
    parent?: SearchNode
    traversable: boolean
    skippable?: boolean
    splitter_node_coords?: Coordinate
    is_start: boolean
    is_destination: boolean
    direction: 'N' | 'S' | 'E' | 'W' | '?'
}

export function shortest_path_between_nodes(start: SearchNode, finish: SearchNode, grid: SearchNode[][]): SearchNode[] {
    let open_nodes: SearchNode[] = [];
    let closed_nodes: SearchNode[] = [];
    let current_node: SearchNode | undefined = undefined

    // let start_node = start.direction !== undefined ? get_adjacent_node_from_node_with_direction(start, grid, 'exiting') : start
    // let target_node = finish.direction !== undefined ? get_adjacent_node_from_node_with_direction(finish, grid, 'entering') : finish
    let start_node = get_adjacent_node_from_node_with_direction(start, grid, 'exiting')
    let target_node = get_adjacent_node_from_node_with_direction(finish, grid, 'entering')

    start_node.direction = start.direction
    open_nodes.push(start_node);

    while(open_nodes.length > 0) {
        // Find node with lowest f_cost in the open_nodes
        let mininum_f_cost = Math.min(...open_nodes.map(node => node.f_cost));
        
        let possible_current_nodes = open_nodes.filter(node => node.f_cost === mininum_f_cost)!;

        let direction_proititsed_node = possible_current_nodes.find(node => node.direction == current_node?.direction)
        if (direction_proititsed_node) {
            current_node = direction_proititsed_node
        } else {
            current_node = possible_current_nodes[0]
        }

        // Remove current node from open
        open_nodes = open_nodes.filter(node => node !== current_node);
        closed_nodes.push(current_node);

        if (current_node.x == target_node.x && current_node.y == target_node.y) {
             break;
        }

        // Check the surronding nodes
        let surronding_nodes: SearchNode[] = get_surronding_nodes_in_grid(start, finish, current_node, grid);
        
        // Evalute the f_cost of the nodes
        for (const surrounding_node of surronding_nodes) {
            if (closed_nodes.includes(surrounding_node)) { continue; }
            
            // Determine if a node was skipped, and add cost for doing so
            let added_f_cost = 0
            let distance_from_past = distance_between_two_nodes(surrounding_node, current_node)
            if (distance_from_past > 1) {
                added_f_cost = 5
            }

            // Caluclate number of movement steps
            const distance_from_start = calculate_depth_of_node_from_first_parent(current_node)
            // let distance_from_start = distance_between_two_nodes(surrounding_node, start_node);
            let distance_from_finish = distance_between_two_nodes(surrounding_node, target_node);

            let calulcated_f_cost = distance_from_start + distance_from_finish + added_f_cost;
            
            if (surrounding_node.f_cost === 0 || surrounding_node.f_cost > calulcated_f_cost) {
                surrounding_node.f_cost = calulcated_f_cost;
                surrounding_node.parent = current_node;
                let cloned_node = JSON.parse(JSON.stringify(surrounding_node))
                open_nodes.push(cloned_node);
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

function check_node_does_not_cross_splitter_zone(node: SearchNode, start_node: SearchNode, target_node: SearchNode) {
    if (node.splitter_node_coords) {
        return ((!(start_node.x == node.splitter_node_coords.x && start_node.y == node.splitter_node_coords.y)) && (!(target_node.x == node.splitter_node_coords.x && target_node.y == node.splitter_node_coords.y)))
    }
}

function get_surronding_nodes_in_grid(starting_node: SearchNode, target_node: SearchNode, node: SearchNode, grid: SearchNode[][]): SearchNode[] {

    let surronding: SearchNode[] = []

    const x = node.x
    const y = node.y
    
    try {
        let left_node = grid[y][x - 1]
        let left_skip_node = grid[y][x - 2]

        if (left_node !== undefined && left_node.traversable) {
            if (check_node_does_not_cross_splitter_zone(left_node, starting_node, target_node)) { throw "" }
            left_node.direction = 'W'
            surronding.push(left_node)
        } else if (left_skip_node !== undefined && left_skip_node.traversable) {
            if (check_node_does_not_cross_splitter_zone(left_skip_node, starting_node, target_node)) { throw "" }
            left_skip_node.direction = 'W'
            surronding.push(left_skip_node)
        }
    } catch(err) { }
    
    try {
        let right_node = grid[y][x + 1]
        let right_skip_node = grid[y][x + 2]

        if (right_node !== undefined && right_node.traversable) {
            if (check_node_does_not_cross_splitter_zone(right_node, starting_node, target_node)) { throw "" }
            right_node.direction = 'E'
            surronding.push(grid[y][x + 1])
        } else if (right_skip_node !== undefined && right_skip_node.traversable) {
            if (check_node_does_not_cross_splitter_zone(right_skip_node, starting_node, target_node)) { throw "" }
            right_skip_node.direction = 'W'
            surronding.push(right_skip_node)
        }
    } catch(err) { }
    
    try {
        let bottom_node = grid[y + 1][x]
        let bottom_skip_node = grid[y + 2][x]

        if (bottom_node !== undefined && bottom_node.traversable) {
            if (check_node_does_not_cross_splitter_zone(bottom_node, starting_node, target_node)) { throw "" }
            bottom_node.direction = 'S'
            surronding.push(grid[y + 1][x])
        } else if (bottom_skip_node !== undefined && bottom_skip_node.traversable) {
            if (check_node_does_not_cross_splitter_zone(bottom_skip_node, starting_node, target_node)) { throw "" }
            bottom_skip_node.direction = 'S'
            surronding.push(bottom_skip_node)
        }
    } catch(err) { }
    
    try {
        let top_node = grid[y - 1][x]
        let top_skip_node = grid[y - 2][x]

        if (top_node !== undefined && top_node.traversable) {
            if (check_node_does_not_cross_splitter_zone(top_node, starting_node, target_node)) { throw "" }
            top_node.direction = 'N'
            surronding.push(grid[y - 1][x])
        } else if (top_skip_node !== undefined && top_skip_node.traversable) {
            if (check_node_does_not_cross_splitter_zone(top_skip_node, starting_node, target_node)) { throw "" }
            top_skip_node.direction = 'N'
            surronding.push(top_skip_node)
        }
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
    case "N":
        return grid[node.y + displacement_factor][node.x]
    case "S":
        return grid[node.y - displacement_factor][node.x]
    case "E":
        return grid[node.y][node.x - displacement_factor]
    case "W":
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
