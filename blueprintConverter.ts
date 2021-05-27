import { Grid, NodeType } from './visualize'


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

export default function convertGridToFactorioBlueprint(grid: Grid) {
    
    let entities: BlueprintEntity[] = []

    let entity_inc = 0

    grid.nodes.forEach(node => {
        
        switch (node.type) {
            case 'input':
                // createEntity(entity_inc, 'transport-belt')
        }

    })
    
}

// function createEntity(entity_number: number, name: string): BlueprintEntity {
//     return {
//         entity_number,
//         name: name,
//     }
// }