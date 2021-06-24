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
            if (square.isSecondary) continue
            entities.push(createEntity(entityCount, square))
            entityCount++
        }

    }

    // return testing_blueprint

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

    let xDelta = 0.5
    let yDelta = 0

    switch (square.type) {
        case "I":
            entityName = "wooden-chest"
            break
        case "O":
            entityName = "iron-chest"
            break
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
            xDelta = 1
            switch (square.direction) {
                case 'W':
                    direction = 6
                    break
                case 'N':
                    direction = 2
                    break
                case 'S':
                    direction = 4
                    break
            }   
            break
        default:
            throw new Error("Invalid square type")
    }

    return {
        entity_number: entityNumber,
        name: entityName,
        position: {x: square.x + xDelta, y: square.y + yDelta},
        direction
    }
}

const testing_blueprint = {
    "blueprint": {
        "icons": [
            {
                "signal": {
                    "type": "item",
                    "name": "transport-belt"
                },
                "index": 1
            },
            {
                "signal": {
                    "type": "item",
                    "name": "splitter"
                },
                "index": 2
            }
        ],
        "entities": [
            {
                "entity_number": 1,
                "name": "splitter",
                "position": {
                    "x": -11,
                    "y": 4.5
                }
            },
            {
                "entity_number": 2,
                "name": "transport-belt",
                "position": {
                    "x": -10.5,
                    "y": 5.5
                }
            },
            {
                "entity_number": 3,
                "name": "transport-belt",
                "position": {
                    "x": -10.5,
                    "y": 6.5
                }
            },
            {
                "entity_number": 4,
                "name": "transport-belt",
                "position": {
                    "x": -10.5,
                    "y": 7.5
                }
            },
            {
                "entity_number": 5,
                "name": "transport-belt",
                "position": {
                    "x": -10.5,
                    "y": 8.5
                }
            },
            {
                "entity_number": 6,
                "name": "transport-belt",
                "position": {
                    "x": -10.5,
                    "y": 9.5
                }
            }
        ],
        "item": "blueprint",
        "version": 281479273971713
    }
}