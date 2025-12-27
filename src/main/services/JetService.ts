import { v4 as uuidv4 } from 'uuid';
import { dbService } from './db';
import { cryptoService } from './crypto';

export type EventType = 'STARTUP' | 'SHUTDOWN' | 'ERROR' | 'ARCHIVE' | 'UPDATE';

export class JetService {

    async logEvent(type: EventType, description: string) {
        try {
            const eventsCollection = dbService.getCollection('events');

            // 1. Get the last event to chain
            const lastEventQuery = await eventsCollection.findOne({
                sort: [{ timestamp: 'desc' }]
            }).exec();

            let previousHash = 'GENESIS_EVENT_HASH_0000000000000000';
            if (lastEventQuery) {
                previousHash = cryptoService.hash(lastEventQuery.signature);
            }

            // 2. Prepare the new event data
            const eventData = {
                id: uuidv4(),
                type,
                description,
                timestamp: new Date().toISOString(),
                previous_hash: previousHash
            };

            // 3. Sign the event
            // Canonical string: type + timestamp + previous_hash
            const dataToSign = `${eventData.type}|${eventData.timestamp}|${eventData.previous_hash}`;
            const signature = cryptoService.sign(dataToSign);

            // 4. Insert into DB
            await eventsCollection.insert({
                ...eventData,
                signature
            });

            console.log(`[JET] Logged event: ${type} - ${description}`);

        } catch (error) {
            console.error('[JET] Failed to log event:', error);
            // In a strict NF525 environment, failure to log to JET might require halting the system.
        }
    }
}

export const jetService = new JetService();
