import { promises as fs } from 'fs';

export const loadConfig = async () => {
    try {
        const data = await fs.readFile('./config.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading config file:', error);
        throw new Error('Failed to load configuration.');
    }
};