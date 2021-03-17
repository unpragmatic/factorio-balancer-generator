import { SearchNode, shortest_path_between_nodes } from "./shortest_path"
import { NodeType, Square } from "./index"

export interface Coordinate {
    x: number,
    y: number
}

function build_search_grid_from_squares(squares: Square[][]): SearchNode[][] {
    let search_grid: SearchNode[][] = []

    squares.forEach(row => {
        let row_of_nodes: SearchNode[] = []
        row.forEach(square => {
            row_of_nodes.push(search_node_from_square(square))
        })
        search_grid.push(row_of_nodes)
    });

    return search_grid
}

function search_node_from_square(square: Square): SearchNode {
    return {
        x: square.x,
        y: square.y,
        traversable: square.type == "empty" ? true : false,
        f_cost: 0
    }
}

export function connection_between_squares_on_grid(first: Square, second: Square, squares: Square[][]): Coordinate[] {
    let grid: SearchNode[][] = build_search_grid_from_squares(squares)
    let path: SearchNode[] = shortest_path_between_nodes(search_node_from_square(first), search_node_from_square(second), grid)

    let coords: Coordinate[] = []
    path.forEach(searchNode => {
       coords.push({
            x: searchNode.x,
            y: searchNode.y
        }) 
    });
    return coords
}