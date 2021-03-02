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

    const spacing_x = 3
    const spacing_y = 3

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
        mutated_grid = grid_with_input_node(grid, spacing_x * index, grid.size_y - 1)
    });

    connector_nodes.forEach((node, index) => {
        mutated_grid = grid_with_splitter_node(grid, spacing_x * index, grid.size_y - spacing_y - 1)
    });

    output_nodes.forEach((node, index) => {
        mutated_grid = grid_with_output_node(grid, spacing_x * index, grid.size_y - 2 * spacing_y - 1)
    });
    
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
