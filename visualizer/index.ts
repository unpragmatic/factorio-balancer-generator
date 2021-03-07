import { Stack } from "./stack"

interface Factorio_Node {
    id: number,
    type: String,
    connection: number[]
}

interface Square {
    type: string
}

interface Grid {
    size_x: number,
    size_y: number,
    squares: Square[][]
}

const input: Factorio_Node[] = [
    { id: 0, type: 'input', connection: [ 2 ] },
    { id: 1, type: 'input', connection: [ 3 ] },
    { id: 2, type: 'connector', connection: [ 4, 5 ] },
    { id: 3, type: 'connector', connection: [ 6, 7 ] },
    { id: 4, type: 'output', connection: [] },
    { id: 5, type: 'output', connection: [] },
    { id: 6, type: 'output', connection: [] },
    { id: 7, type: 'output', connection: [] }
  ]

// const input: Factorio_Node[] = [
//     { id: 0, type: 'input', connection: [2] }, 
//     { id: 1, type: 'input', connection: [3] }, 
//     { id: 2, type: 'connector', connection: [5, 6] }, 
//     { id: 3, type: 'connector', connection: [7, 4] }, 
//     { id: 4, type: 'connector', connection: [8, 9] }, 
//     { id: 5, type: 'output', connection: [ ] },
//     { id: 6, type: 'output', connection: [ ] },
//     { id: 7, type: 'output', connection: [ ] },
//     { id: 8, type: 'output', connection: [ ] },
//     { id: 9, type: 'output', connection: [ ] }
// ]

const x_gap = 4
const y_gap = 4

function calculate_connection_depth_of_input(input: Factorio_Node[]){
    
    var node_stack: Stack<Factorio_Node> = new Stack<Factorio_Node>()
    var visited_nodes: Factorio_Node[] = new Array()
    var depth: number = 0
    var max_depth: number = 0

    // Push all input nodes to stack
    const input_nodes: Factorio_Node[] = input.filter((node) => {
        if (max_depth < depth) { max_depth = depth }
        node_stack.push(node)
        while (!node_stack.is_empty) {
            node = node_stack.pop()
            depth += 1
            node.connection.forEach(connection => {
                node_stack.push(input[connection])
            })
            depth -= 1
        }
    })
}

function initialize_empty_grid(size_x: number, size_y: number): Grid {
    var grid: Grid = { squares: [], size_x: size_x, size_y: size_y }
    for (let i = 0; i < size_x; i++){
        grid.squares[i] = []
        for (let j = 0; j < size_y; j++){
            grid.squares[i][j] = {type: ' '}
        }
    }
    return grid
}

function grid_filled(input: Factorio_Node[], grid: Grid) {
    var mutated_grid: Grid = grid

    const input_nodes: Factorio_Node[] = input.filter((node) => {
        return node.type == 'input'
    })
    const connector_nodes: Factorio_Node[] = input.filter((node) => {
        return node.type == 'connector'
    })
    const output_nodes: Factorio_Node[] = input.filter((node) => {
        return node.type == 'output'
    })

    input_nodes.forEach((node, index) => {
        mutated_grid = recursive_build_node_on_grid(mutated_grid, input, node, (x_gap * index), 0)
    });
    
    return mutated_grid
}

function recursive_build_node_on_grid(grid: Grid, input: Factorio_Node[], node: Factorio_Node, pos_x: number, pos_y: number) {
    var mutated_grid: Grid = grid

    switch(node.type){
        case 'input':
            mutated_grid = grid_with_input_node(mutated_grid, pos_x, pos_y)
            break;
        case 'connector':
            mutated_grid = grid_with_splitter_node(mutated_grid, pos_x, pos_y)
            break;
        case 'output':
            mutated_grid = grid_with_output_node(mutated_grid, pos_x, pos_y)
            break;
    }

    node.connection.forEach((connection_id, index) => {
        var connection_node = input[connection_id]
        const connection_x = pos_x + (index * (x_gap/2))
        const connection_y = pos_y + y_gap
        mutated_grid = grid_with_connection_between(grid, pos_x + index, pos_y, connection_x, connection_y)
        mutated_grid = recursive_build_node_on_grid(mutated_grid, input, connection_node, connection_x, connection_y)
    })

    return mutated_grid
}

function grid_with_connection_between(grid: Grid, x1: number, y1: number, x2: number, y2: number){
    var mutated_grid: Grid = grid

    const x_diff = x2 - x1
    const y_diff = y2 - y1

    for (let i = 1; i < y_diff; i++) {
        mutated_grid = grid_with_connector_node(mutated_grid, x1, y1 + i)
    }

    for (let i = 1; i <= x_diff; i++) {
        mutated_grid = grid_with_connector_node(mutated_grid, x1 + i, y2 - 1)
    }

    return mutated_grid
}

function grid_with_connector_node(grid: Grid, pos_x: number, pos_y: number): Grid {
    var mutated_grid: Grid = grid

    mutated_grid.squares[pos_y][pos_x].type = 'C'

    return mutated_grid
}

function grid_with_input_node(grid: Grid, pos_x: number, pos_y: number): Grid {
    var mutated_grid: Grid = grid

    if (squares_are_empty([grid.squares[pos_y][pos_x]])) {
        mutated_grid.squares[pos_y][pos_x].type = 'I'
    }

    return mutated_grid

}

function grid_with_splitter_node(grid: Grid, pos_x: number, pos_y: number): Grid {
    var mutated_grid: Grid = grid

    if (squares_are_empty([grid.squares[pos_y][pos_x], grid.squares[pos_y][pos_x + 1]])) {
        mutated_grid.squares[pos_y][pos_x].type = 'S'
        mutated_grid.squares[pos_y][pos_x + 1].type = 'S'
    }

    return mutated_grid
}

function grid_with_output_node(grid: Grid, pos_x: number, pos_y: number): Grid {
    var mutated_grid: Grid = grid

    if (squares_are_empty([grid.squares[pos_y][pos_x]])) {
        mutated_grid.squares[pos_y][pos_x].type = 'O'
    }

    return mutated_grid

}

function squares_are_empty(squares: Square[]) {
    squares.forEach(square => {
        if (square.type != ' ') {
            return false
        }
    });
    return true
}

function display_grid(grid: Grid) {
    for (let i = 0; i < grid.squares.length; i++){
        var formatted_line: string = ""
        for (let j = 0; j < grid.squares[i].length; j++){
            const square = grid.squares[i][j]
            formatted_line += square.type + "|"
        }
        console.log("|" + formatted_line)
    }
}

const empty_grid = initialize_empty_grid(20, 20)
const filled_grid = grid_filled(input, empty_grid)
display_grid(filled_grid)
