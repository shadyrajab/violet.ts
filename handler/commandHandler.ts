import { Client } from 'discord.js';
import { readdirSync } from 'fs';

function loadInteractionCommands(client: Client): any[] {
    const interactionCommands: any[] = [];
    const categories = readdirSync('./commands');
    
    for (const category of categories) {
        if (category === 'README.md') continue;

        const subCategories = readdirSync(`./commands/${category}`);
        
        for (const subCategory of subCategories) {
            const path = `../commands/${category}/${subCategory}`;
            
            if (subCategory.includes('.')) {
                const constructor = requireCommandConstructor(path);
                addCommandsToArray(constructor, client, interactionCommands);
            } else {
                const subCommandFiles = readdirSync(path);
                
                for (const subCommandFile of subCommandFiles) {
                    const subCommandPath = `${path}/${subCommandFile}`;
                    const constructor = requireCommandConstructor(subCommandPath);
                    addCommandsToArray(constructor, client, interactionCommands);
                }
            }
        }
    }
    
    return interactionCommands;
}

function requireCommandConstructor(path: string): any {
    return require(path);
}

function addCommandsToArray(constructor: any, client: Client, commandArray: any[]): void {
    if (typeof constructor === 'object') {
        for (const command in constructor) {
            commandArray.push(new constructor[command](client));
        }
    } else {
        commandArray.push(new constructor(client));
    }
}

export default loadInteractionCommands;
