import { SearchNode, shortest_path_between_nodes } from "./shortest_path"
import { NodeType, Square } from "./index"
import { start } from "repl";

export interface Coordinate {
    x: number,
    y: number
}

function build_search_grid_from_squares(squares: Square[][], start: Square, finish: Square): SearchNode[][] {
    let search_grid: SearchNode[][] = []

    squares.forEach(row => {
        let row_of_nodes: SearchNode[] = []
        row.forEach(square => {
            row_of_nodes.push(search_node_from_square(square))
        })
        search_grid.push(row_of_nodes)
    });

    search_grid[start.y][start.x] = search_node_from_square(start, false, true)
    search_grid[finish.y][finish.x] = search_node_from_square(finish, true)

    return search_grid
}

function search_node_from_square(square: Square, is_finish=false, is_start=false): SearchNode {
    return {
        x: square.x,
        y: square.y,
        traversable: square.type === ' ' ? true : false,
        is_start: is_start,
        is_destination: is_finish,
        f_cost: 0,
        // Only splitters and outputs have a direction, currently the direction is always south
        // direction: square.type === ('S' || 'O') ? 'south' : undefined
        direction: 'south'
    }
}

export function connection_between_squares_on_grid(first: Square, second: Square, squares: Square[][]): Coordinate[] {
    let grid: SearchNode[][] = build_search_grid_from_squares(squares, first, second)
    let path: SearchNode[] = shortest_path_between_nodes(search_node_from_square(first, false, true), search_node_from_square(second, true), grid)

    let coords: Coordinate[] = []
    path.forEach(searchNode => {
       coords.push({
            x: searchNode.x,
            y: searchNode.y
        }) 
    });
    return coords
}