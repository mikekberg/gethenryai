import OpenAI from 'openai';
import { Service } from 'typedi';

@Service()
export class AIService {
    private openAIClient: OpenAI;

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set');
        }

        this.openAIClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    public async transcribeAudio(audio: Buffer): Promise<string> {
        // This is a placeholder for the actual transcription service
        return 'This is a placeholder transcription';
    }
}
