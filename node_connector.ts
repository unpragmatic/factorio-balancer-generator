import { exception } from "node:console"
import { SearchNode, shortest_path_between_nodes } from "./shortest_path"
import { NodeType, Square } from "./visualize"

export interface Coordinate {
    x: number,
    y: number,
    direction?: 'N' | 'S' | 'E' | 'W' | '?'
}

function output_zone_constraint(square: Square, grid: Square[][]): Coordinate | undefined {

    let zoneSize = 2

    let x = square.x
    let y = square.y

    // Check south
    for (let yDelta = 1; yDelta <= zoneSize && (y + yDelta) < grid.length; yDelta++) {
        const squareToCheck = grid[y + yDelta][x]
        if (squareToCheck.type == 'S' && (squareToCheck.direction == 'N' || squareToCheck.direction == 'S')) { return {x: squareToCheck.x, y: squareToCheck.y} }
    }

    // Check north
    for (let yDelta = 1; yDelta <= zoneSize && (y - yDelta) >= 0; yDelta++) {
        const squareToCheck = grid[y - yDelta][x]
        if (squareToCheck.type == 'S' && (squareToCheck.direction == 'S' || squareToCheck.direction == 'N')) { return {x: squareToCheck.x, y: squareToCheck.y} }
    }

    // Check east
    for (let xDelta = 1; xDelta <= zoneSize && (x + xDelta) < grid[y].length; xDelta++) {
        const squareToCheck = grid[y][x + xDelta]
        if (squareToCheck.type == 'S' && squareToCheck.direction == 'W') { return {x: squareToCheck.x, y: squareToCheck.y} }
    }

    // Check west
    for (let xDelta = 1; xDelta <= zoneSize && (x - xDelta) >= 0; xDelta++) {
        const squareToCheck = grid[y][x - xDelta]
        if (squareToCheck.type == 'S' && squareToCheck.direction == 'E') { return {x: squareToCheck.x, y: squareToCheck.y} }
    }

    return undefined
}

function build_search_grid_from_squares(squares: Square[][], start: Square, finish: Square): SearchNode[][] {
    let search_grid: SearchNode[][] = []

    for (let y = 0; y < squares.length; y++) {
        let row_of_nodes: SearchNode[] = []
        for (let x = 0; x < squares[y].length; x++) {
            const square = squares[y][x]

            const empty_constraint = square.type === ' '
            const traversable = empty_constraint

            const splitter_node_coords = output_zone_constraint(square, squares)

            row_of_nodes.push(search_node_from_square(square, traversable, splitter_node_coords))
        }
        search_grid.push(row_of_nodes)
    }

    search_grid[start.y][start.x] = search_node_from_square(start, false, undefined, true)
    search_grid[finish.y][finish.x] = search_node_from_square(finish, false, undefined, true)

    return search_grid
}

function search_node_from_square(square: Square, traversable: boolean, splitter_node_coords?: Coordinate, is_finish=false, is_start=false): SearchNode {
    return {
        x: square.x,
        y: square.y,
        traversable,
        splitter_node_coords,
        is_start,
        is_destination: is_finish,
        f_cost: 0,
        direction: square.direction
    }
}

export function connection_between_squares_on_grid(first: Square, second: Square, squares: Square[][]): Coordinate[] {
    let grid: SearchNode[][] = build_search_grid_from_squares(squares, first, second)
    let path: SearchNode[] = shortest_path_between_nodes(search_node_from_square(first, false, undefined, true), search_node_from_square(second, true), grid)

    let coords: Coordinate[] = []
    path.forEach(searchNode => {
       coords.push({
            x: searchNode.x,
            y: searchNode.y,
            direction: searchNode.direction
        }) 
    });
    return coords
}