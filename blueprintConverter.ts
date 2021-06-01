import { Grid, Square } from './visualize'


export interface Blueprint {
    blueprint: {
        icons:
        {
            signal: {
                type: string,
                name: string
            },
            index: number
        }[],
        entities: BlueprintEntity[],
        item: string,
        version: number
    }
}

interface BlueprintEntity {
    entity_number: number,
    name: string,
    position: {
        x: number,
        y: number
    }
    direction?: number
}

export default function convertGridToFactorioBlueprint(grid: Grid): Blueprint {
    
    let entities: BlueprintEntity[] = []

    let entityCount = 0

    for (let y = 0; y < grid.squares.length; y++) {

        for (let x = 0; x < grid.squares[y].length; x++) {
            const square = grid.squares[y][x]
            if (square.type == ' ') continue
            entities.push(createEntity(entityCount, square))
            entityCount++
        }

    }

    return {
        blueprint: {
            icons: [
                {
                    signal: {
                        type: "item",
                        name: "transport-belt"
                    },
                    index: 1
                }
            ],
            entities,
            item: "blueprint",
            version: 281479273840640
        },
    }
}

function createEntity(entityNumber: number, square: Square): BlueprintEntity {

    let entityName = ""
    let direction: number | undefined = undefined

    switch (square.type) {
        case "I":
        case "O":
        case "C":
            entityName = "transport-belt"
            switch (square.direction) {
                case 'S':
                    direction = 4
                    break
                case 'E':
                    direction = 2
                    break
                case 'W':
                    direction = 6
                    break
            }
            break
        case "S":
            entityName = "splitter"
            switch (square.direction) {
                case 'W':
                    direction = 4
                    break
                case 'N':
                    direction = 2
                    break
                case 'S':
                    direction = 6
                    break
            }   
            break
        default:
            throw new Error("Invalid square type")
    }

    return {
        entity_number: entityNumber,
        name: entityName,
        position: {x: square.x, y: square.y},
        direction
    }
}