import { SearchNode, shortest_path_between_nodes } from "./shortest_path"
import { NodeType, Square } from "./index"

export interface Coordinate {
    x: number,
    y: number
}

function build_search_grid_from_squares(squares: Square[][], finish: Square): SearchNode[][] {
    let search_grid: SearchNode[][] = []

    squares.forEach(row => {
        let row_of_nodes: SearchNode[] = []
        row.forEach(square => {
            row_of_nodes.push(search_node_from_square(square))
        })
        search_grid.push(row_of_nodes)
    });

    search_grid[finish.y][finish.x] = search_node_from_square(finish, true)

    return search_grid
}

function search_node_from_square(square: Square, is_finish=false): SearchNode {
    return {
        x: square.x,
        y: square.y,
        traversable: is_finish || square.type === ' ' ? true : false,
        f_cost: 0
    }
}

export function connection_between_squares_on_grid(first: Square, second: Square, squares: Square[][]): Coordinate[] {
    let grid: SearchNode[][] = build_search_grid_from_squares(squares, second)
    let path: SearchNode[] = shortest_path_between_nodes(search_node_from_square(first), search_node_from_square(second, true), grid)

    let coords: Coordinate[] = []
    path.forEach(searchNode => {
       coords.push({
            x: searchNode.x,
            y: searchNode.y
        }) 
    });
    return coords
}