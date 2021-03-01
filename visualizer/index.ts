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
    { id: 0, type: 'input', connection: [ 1 ] },
    { id: 1, type: 'connector', connection: [ 2, 3 ] },
    { id: 2, type: 'output', connection: [] },
    { id: 3, type: 'output', connection: [] }
  ]

function initialize_empty_grid(size_x: number, size_y: number): Grid {
    var grid: Grid = { squares: [], size_x: size_x, size_y: size_y }
    for (let i = 0; i < size_x; i++){
        grid.squares[i] = []
        for (let j = 0; j < size_y; j++){
            grid.squares[i][j] = {type: '  Empty '}
        }
    }
    return grid
}

function fill_grid(input: Factorio_Node[], grid: Grid) {
    var filled_grid: Grid = grid

    // Iterate over every input
    input.forEach(node => {
        // Create the transport belt for the input
        if (node.type == 'input') {
            grid.squares[grid.size_y - 1][0].type = '  Belt  '
        }

        var connection_node = input[node.connection[0]]
        grid.squares[grid.size_y - 2][0].type = 'Splitter'
        grid.squares[grid.size_y - 2][1].type = 'Splitter'

        grid.squares[grid.size_y - 3][0].type = ' Output '
        grid.squares[grid.size_y - 3][1].type = ' Output '
    });
    
    return filled_grid
}

function display_grid(grid: Grid) {
    for (let i = 0; i < grid.squares.length; i++){
        var formatted_line: string = ""
        for (let j = 0; j < grid.squares[i].length; j++){
            const square = grid.squares[i][j]
            formatted_line += "| " + square.type + " "
        }
        console.log(formatted_line + "|")
    }
}

var grid = initialize_empty_grid(5, 5)
var filled_grid = fill_grid(input, grid)
display_grid(grid)
