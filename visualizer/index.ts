import { connection_between_squares_on_grid } from "./node_connector"

export type NodeType = 'empty' | 'input' | 'splitter' | 'output' | 'connector'

export interface Square {
    type: ' ' | 'I' | 'S' | 'O' | 'C'
    x: number
    y: number
}

export interface Grid {
    squares: Square[][]
    nodes: FactorioNode[]
}

export interface FactorioNode {
    id: number,
    type: NodeType,
    connection: number[]
    connected_to: number[]
    connection_from: number[]
    squares: Square[]
}

// const input: FactorioNode[] = [
//     { id: 0, type: 'input', connection: [1], connected_to: [], squares: [], connection_from: [] },
//     { id: 1, type: 'splitter', connection: [2], connected_to: [], squares: [], connection_from: [] },
//     { id: 2, type: 'output', connection: [], connected_to: [], squares: [], connection_from: [] },
// ]

const input: FactorioNode[] = [
    // { id: 0, type: 'input', connection: [ 4 ], squares: [], connected_to: [], connection_from: [] },
    // { id: 1, type: 'input', connection: [ 4 ], squares: [], connected_to: [], connection_from: [] },
    { id: 0, type: 'input', connection: [ 3 ], squares: [], connected_to: [], connection_from: [] },
    { id: 1, type: 'input', connection: [ 4 ], squares: [], connected_to: [], connection_from: [] },
    // { id: 4, type: 'splitter', connection: [ 5, 5 ], squares: [], connected_to: [], connection_from: [] },
    { id: 2, type: 'splitter', connection: [ 4, 5 ], squares: [], connected_to: [], connection_from: [] },
    { id: 3, type: 'splitter', connection: [ 6, 7], squares: [], connected_to: [], connection_from: [] },
    // { id: 7, type: 'output', connection: [], squares: [], connected_to: [], connection_from: [] },
    // { id: 8, type: 'output', connection: [], squares: [], connected_to: [], connection_from: [] },
    { id: 4, type: 'output', connection: [], squares: [], connected_to: [], connection_from: [] },
    { id: 5, type: 'output', connection: [], squares: [], connected_to: [], connection_from: [] },
    { id: 6, type: 'output', connection: [], squares: [], connected_to: [], connection_from: [] },
    { id: 7, type: 'output', connection: [], squares: [], connected_to: [], connection_from: [] }
  ]

// const input: FactorioNode[] = [
//     { id: 0, type: 'input', connection: [ 4 ], squares: [], connected_to: [], connection_from: [] },
//     { id: 1, type: 'input', connection: [11], squares: [], connected_to: [], connection_from: [] },
//     { id: 2, type: 'input', connection: [ 6 ], squares: [], connected_to: [], connection_from: [] },
//     { id: 3, type: 'input', connection: [ 6 ], squares: [], connected_to: [], connection_from: [] },
//     { id: 4, type: 'splitter', connection: [ 5, 5 ], squares: [], connected_to: [], connection_from: [] },
//     { id: 5, type: 'splitter', connection: [], squares: [], connected_to: [], connection_from: [] },
//     { id: 6, type: 'splitter', connection: [9, 10], squares: [], connected_to: [], connection_from: [] },
//     { id: 7, type: 'output', connection: [], squares: [], connected_to: [], connection_from: [] },
//     { id: 8, type: 'output', connection: [], squares: [], connected_to: [], connection_from: [] },
//     { id: 9, type: 'output', connection: [], squares: [], connected_to: [], connection_from: [] },
//     { id: 10, type: 'output', connection: [], squares: [], connected_to: [], connection_from: [] },
//     { id: 11, type: 'splitter', connection: [12,12], squares: [], connected_to: [], connection_from: [] },
//     { id: 12, type: 'splitter', connection: [11], squares: [], connected_to: [], connection_from: [] },
//   ]

// const input: FactorioNode[] = [
//         { id: 0, type: 'input', connection: [1], squares: [], connected_to: [], connection_from: [] },
//         { id: 1, type: 'splitter', connection: [2], squares: [], connected_to: [], connection_from: [] },
//         { id: 2, type: 'splitter', connection: [1], squares: [], connected_to: [], connection_from: [] }
//     ]

//   const input: FactorioNode[] = [
//     { id: 0, type: 'input', connection: [ 1 ], squares: [], connected_to: [], connection_from: [] },
//     { id: 1, type: 'splitter', connection: [], squares: [], connected_to: [], connection_from: [] }
//   ]

// const input: FactorioNode[] = [
//     { id: 0, type: 'input', connection: [1], connected_to: [], squares: [], connection_from: [] },
//     { id: 1, type: 'splitter', connection: [2], connected_to: [], squares: [], connection_from: [] },
//     { id: 2, type: 'splitter', connection: [3, 1], connected_to: [], squares: [], connection_from: [] },
//     { id: 3, type: 'output', connection: [], connected_to: [], squares: [], connection_from: [] },
// ]

const x_gap = 4
const y_gap = 4

function grid_filled(input: FactorioNode[], grid: Grid) {
    var mutated_grid: Grid = grid

    const input_nodes: FactorioNode[] = input.filter((node) => {
        return node.type == 'input'
    })

    input_nodes.forEach((node, index) => {
        mutated_grid = recursive_build_node_on_grid(mutated_grid, input, node, (x_gap * index), 0)
    });

    return mutated_grid
}

function grid_with_empty_squares(grid: Grid) {
    var mutated_grid: Grid = grid

    let squares = mutated_grid.squares;
    let max_y = squares.length
    let max_x = Math.max(...squares.map(row => row.length))

    for (let y = 0; y < max_y; y++) {
        for (let x = 0; x <= max_x; x++){
            if (!squares[y][x]) {
                mutated_grid = grid_with_node_of_type(mutated_grid, 'empty', x, y)
            }
        }
        
    }

    return mutated_grid
}

function grid_connected(grid: Grid) {
    var mutated_grid: Grid = grid

    grid.nodes.forEach(node => {
        node.connection.forEach(id => {
            var connection_node: FactorioNode | undefined = grid.nodes.find(node => node.id == id)
            console.log('Connecting node: ', node, ' and: ', connection_node, '.')
            if (connection_node) {
                connect_nodes_on_grid(mutated_grid, node, connection_node)
            }
        })
    });

    return mutated_grid
}

function recursive_build_node_on_grid(grid: Grid, input: FactorioNode[], node: FactorioNode, pos_x: number, pos_y: number) {
    var mutated_grid: Grid = grid

    if (grid.nodes.includes(node)) {
        return mutated_grid
    }

    mutated_grid = grid_with_node_of_type(mutated_grid, node.type, pos_x, pos_y)

    // Update node.squares
    node.squares.push(mutated_grid.squares[pos_y][pos_x])
    if (node.type == 'splitter'){ 
        node.squares.push(mutated_grid.squares[pos_y][pos_x + 1])
    }

    grid.nodes.push(node)

    node.connection.forEach((connection_id, index) => {
        var connection_node = input[connection_id]
        const connection_x = pos_x + (index * (x_gap / 2))
        const connection_y = pos_y + y_gap
        mutated_grid = recursive_build_node_on_grid(mutated_grid, input, connection_node, connection_x, connection_y)
    })

    return mutated_grid
}

function connect_nodes_on_grid(grid: Grid, to: FactorioNode, from: FactorioNode): Grid {
    var mutated_grid: Grid = grid

    var first_square = to.squares[0]
    var second_square = from.squares[0]

    if (to.type == 'splitter'){
        if (to.connected_to.length > 0){
            first_square = to.squares[1]
        }
    }
    if (from.type == 'splitter'){
        if (from.connection_from.length > 0){
            second_square = from.squares[1]
        }
    }

    mutated_grid = grid_with_connection_between(mutated_grid, first_square, second_square)
    to.connected_to.push(from.id)
    from.connection_from.push(to.id)


    return mutated_grid
}

function grid_with_connection_between(grid: Grid, first_square: Square, second_square: Square) {
    var mutated_grid: Grid = grid
    
    let coords = connection_between_squares_on_grid(first_square, second_square, grid.squares)
    
    coords.forEach(coord => 
            mutated_grid = grid_with_connector_node(mutated_grid, coord.x, coord.y)
        )

    return mutated_grid
}

function grid_with_node_of_type(grid: Grid, type: NodeType, pos_x: number, pos_y: number): Grid {
    var mutated_grid: Grid = grid

    for (let i = 0; i <= pos_y; i++) {
        if (!mutated_grid.squares[i]) {
            mutated_grid.squares[i] = []
        }
    }

    switch (type) {
        case 'connector':
            mutated_grid = grid_with_connector_node(mutated_grid, pos_x, pos_y)
            break;
        case 'input':
            mutated_grid = grid_with_input_node(mutated_grid, pos_x, pos_y)
            break;
        case 'splitter':
            mutated_grid = grid_with_splitter_node(mutated_grid, pos_x, pos_y)
            break;
        case 'output':
            mutated_grid = grid_with_output_node(mutated_grid, pos_x, pos_y)
            break;
        case 'empty':
            mutated_grid = grid_with_empty_square(mutated_grid, pos_x, pos_y)
            return mutated_grid;
    }

    // Fills out an empty row 'one ahead' to ensure enough room for potential connections
    if (!mutated_grid.squares[pos_y + 1]){
        mutated_grid.squares[pos_y + 1] = []
    } 

    return mutated_grid
}

function grid_with_connector_node(grid: Grid, pos_x: number, pos_y: number): Grid {
    var mutated_grid: Grid = grid
    mutated_grid.squares[pos_y][pos_x] = { type: 'C', x: pos_x, y: pos_y }
    return mutated_grid
}

function grid_with_input_node(grid: Grid, pos_x: number, pos_y: number): Grid {
    var mutated_grid: Grid = grid
    mutated_grid.squares[pos_y][pos_x] = { type: 'I', x: pos_x, y: pos_y }
    return mutated_grid
}

function grid_with_splitter_node(grid: Grid, pos_x: number, pos_y: number): Grid {
    var mutated_grid: Grid = grid

    mutated_grid.squares[pos_y][pos_x] = { type: 'S', x: pos_x, y: pos_y }
    mutated_grid.squares[pos_y][pos_x + 1] = { type: 'S', x: pos_x + 1, y: pos_y }

    return mutated_grid
}

function grid_with_output_node(grid: Grid, pos_x: number, pos_y: number): Grid {
    var mutated_grid: Grid = grid
    mutated_grid.squares[pos_y][pos_x] = { type: 'O', x: pos_x, y: pos_y }
    return mutated_grid
}

function grid_with_empty_square(grid: Grid, pos_x: number, pos_y: number): Grid {
    var mutated_grid: Grid = grid
    mutated_grid.squares[pos_y][pos_x] = { type: ' ', x: pos_x, y: pos_y }
    return mutated_grid
}

function display_grid(grid: Grid) {
    for (let i = 0; i < grid.squares.length; i++) {
        var formatted_line: string = ""
        for (let j = 0; j < grid.squares[i].length; j++) {
            const square = grid.squares[i][j]
            formatted_line += (square?.type ?? ' ') + "|"
        }
        console.log("|" + formatted_line)
    }
}

const filled_grid = grid_filled(input, {
    squares: [[]],
    nodes: []
})
const complete_grid = grid_with_empty_squares(filled_grid)
const connected_grid = grid_connected(complete_grid)
display_grid(connected_grid)