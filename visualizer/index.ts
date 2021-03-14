enum NodeType {
    Empty,
    Input,
    Splitter,
    Output,
    Connector
  }

interface Square {
    type: string
    x: number
    y: number
}

interface Grid {
    squares: Square[][]
    nodes: FactorioNode[]
}

interface FactorioNode {
    id: number,
    type: NodeType,
    connection: number[]
    square?: Square
}

// Simplest possible example
// const input: FactorioNode[] = [
//     { id: 0, type: NodeType.Input, connection: [ 1 ] },
//     { id: 1, type: NodeType.Splitter, connection: [2] },
//     { id: 2, type: NodeType.Output, connection: [] },
//   ]

// Double connection example
const input: FactorioNode[] = [
    { id: 0, type: NodeType.Input, connection: [ 1 ] },
    { id: 1, type: NodeType.Splitter, connection: [ 2, 3 ] },
    { id: 2, type: NodeType.Output, connection: [] },
    { id: 3, type: NodeType.Output, connection: [] },
  ]

// More compliated example
// const input: FactorioNode[] = [
//     { id: 0, type: NodeType.Input, connection: [ 4 ] },
//     { id: 1, type: NodeType.Input, connection: [ 4 ] },
//     { id: 2, type: NodeType.Input, connection: [ 5 ] },
//     { id: 3, type: NodeType.Input, connection: [ 6 ] },
//     { id: 4, type: NodeType.Splitter, connection: [ 5, 5 ] },
//     { id: 5, type: NodeType.Splitter, connection: [ 7, 8 ] },
//     { id: 6, type: NodeType.Splitter, connection: [ 9, 10 ] },
//     { id: 7, type: NodeType.Output, connection: [] },
//     { id: 8, type: NodeType.Output, connection: [] },
//     { id: 9, type: NodeType.Output, connection: [] },
//     { id: 10, type: NodeType.Output, connection: [] }
//   ]

// Simple loopback example
// const input: FactorioNode[] = [
//     { id: 0, type: NodeType.Input, connection: [ 1 ] },
//     { id: 1, type: NodeType.Splitter, connection: [ 2, 2 ] },
//     { id: 2, type: NodeType.Splitter, connection: [ 3, 1 ] },
//     { id: 3, type: NodeType.Output, connection: [] },
//   ]

const x_gap = 3
const y_gap = 4

function grid_filled(input: FactorioNode[], grid: Grid) {
    var mutated_grid: Grid = grid

    const input_nodes: FactorioNode[] = input.filter((node) => {
        return node.type == NodeType.Input
    })

    input_nodes.forEach((node, index) => {
        mutated_grid = recursive_build_node_on_grid(mutated_grid, input, node, (x_gap * index), 0)
    });
    
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
    node.square = mutated_grid.squares[pos_y][pos_x]
    grid.nodes.push(node)

    node.connection.forEach((connection_id, index) => {
        var connection_node = input[connection_id]
        const connection_x = pos_x + (index * (x_gap/2))
        const connection_y = pos_y + y_gap
        mutated_grid = recursive_build_node_on_grid(mutated_grid, input, connection_node, connection_x, connection_y)
    })

    return mutated_grid
}

function connect_nodes_on_grid(grid: Grid, first: FactorioNode, second: FactorioNode): Grid {
    var mutated_grid: Grid = grid

    var first_square = first.square
    var second_square = second.square

    if (first_square && second_square) {
        mutated_grid = grid_with_connection_between(mutated_grid, first_square?.x, first_square.y, second_square?.x, second_square.y)
    }

    return mutated_grid
}

function grid_with_connection_between(grid: Grid, x1: number, y1: number, x2: number, y2: number){
    var mutated_grid: Grid = grid

    const x_diff = x2 - x1
    const y_diff = y2 - y1

    for (let y = 1; y < y_diff; y++) {
        mutated_grid = grid_with_node_of_type(mutated_grid, NodeType.Connector, x1, y1 + y)
    }

    for (let x = 1; x <= Math.abs(x_diff); x++) {
        const x_start = x_diff > 0 ? x1 : x2
        mutated_grid = grid_with_node_of_type(mutated_grid, NodeType.Connector, x_start + x, ((y_diff + y1) - 1))
    }

    return mutated_grid
}

function grid_with_node_of_type(grid: Grid, type: NodeType, pos_x: number, pos_y: number): Grid {
    var mutated_grid: Grid = grid

    for (let i = 0; i <= pos_y; i++) {
        if (!mutated_grid.squares[i]) {
            mutated_grid.squares[i] = []
        }
    }
    
    switch (type){
        case NodeType.Connector:
            mutated_grid = grid_with_connector_node(mutated_grid, pos_x, pos_y)
            return mutated_grid;
        case NodeType.Input:
            mutated_grid = grid_with_input_node(mutated_grid, pos_x, pos_y)
            return mutated_grid;
        case NodeType.Splitter:
            mutated_grid = grid_with_splitter_node(mutated_grid, pos_x, pos_y)
            return mutated_grid;
        case NodeType.Output:
            mutated_grid = grid_with_output_node(mutated_grid, pos_x, pos_y)
            return mutated_grid;

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
    mutated_grid.squares[pos_y][pos_x + 1] = { type: 'S', x: pos_x, y: pos_y }

    return mutated_grid
}

function grid_with_output_node(grid: Grid, pos_x: number, pos_y: number): Grid {
    var mutated_grid: Grid = grid
    mutated_grid.squares[pos_y][pos_x] = { type: 'O', x: pos_x, y: pos_y }
    return mutated_grid
}

function display_grid(grid: Grid) {
    for (let i = 0; i < grid.squares.length; i++){
        var formatted_line: string = ""
        for (let j = 0; j < grid.squares[i].length; j++){
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
const connected_grid = grid_connected(filled_grid)
display_grid(connected_grid)

// function calculate_connection_depth_of_input(input: Factorio_Node[]){
    
//     var node_stack: Stack<Factorio_Node> = new Stack<Factorio_Node>()
//     var depth: number = 0
//     var max_depth: number = 0

//     // Push all input nodes to stack
//     const input_nodes: Factorio_Node[] = input.filter((node) => {
//         if (max_depth < depth) { max_depth = depth }
//         node_stack.push(node)
//         while (!node_stack.is_empty) {
//             node = node_stack.pop()
//             depth += 1
//             node.connection.forEach(connection => {
//                 node_stack.push(input[connection])
//             })
//             depth -= 1
//         }
//     })

//     return max_depth
// }

// function initialize_empty_grid(size_x: number, size_y: number): Grid {
//     var grid: Grid = { squares: [], size_x: size_x, size_y: size_y }
//     for (let i = 0; i < size_x; i++){
//         grid.squares[i] = []
//         for (let j = 0; j < size_y; j++){
//             grid.squares[i][j] = {type: ' '}
//         }
//     }
//     return grid
// }

// function squares_are_empty(squares: Square[]) {
//     squares.forEach(square => {
//         if (square.type != ' ') {
//             return false
//         }
//     });
//     return true
// }

// const empty_grid = initialize_empty_grid()