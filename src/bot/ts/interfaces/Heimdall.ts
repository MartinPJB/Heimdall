// Dependencies
import { Client, HeimdallDB } from '../../../mod.ts';
import { Command } from './Command.ts';

// Custom Heimdall Client
export interface HeimdallClient extends Client {
    registeredCommands?: Array<Command>;
    database?: HeimdallDB;
}