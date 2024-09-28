export type UserMessage = {
    userId: string;
    message: string;
    timestamp: number; // MS since epoch
};

/**
 * A small class just to detect spam so I can use this in ../spam.ts
 * for spam detection.
 */
export class SpamDetection {
    private messageHistory: Map<string, UserMessage[]> = new Map();
    public lastUsersWarn: Map<string, number> = new Map();
    private timeWindow: number = 3000; // Time window in which all user's message will be monitored for spam
    private maxMessages: number = 5; // Threshold for the number of messages sent in a short period of time // timeWindow (Here 5 -> 5 messages in 3 seconds you gotta be kidding)
    private repeatThreshold: number = .8; // Threshold for message similarity (Here 80%)

    constructor() {}

    /**
     * Checks if a user is spamming
     * @param userMessage - User's message
     * @returns - Boolean
     */
    isUserSpamming(userMessage: UserMessage): boolean {
        const userID = userMessage.userId;
        const now = Date.now();

        // Gets or initializes a user's message history ykyk
        if (!this.messageHistory.has(userID)) this.messageHistory.set(userID, []);

        const history = this.messageHistory.get(userID)!;
        history.push(userMessage);

        // Only keep messages sent within our timeWindow (Cuz keeping everything would be insane)
        this.messageHistory.set(userID, history.filter(message => now - message.timestamp <= this.timeWindow));

        // Checks
        if(this.isHighFrequency(userID)) return true; // Checks if lots of messages sent in a short period of time
        if(this.isRepeatedContent(userID, userMessage)) return true; // Check for repeated content (like same message sent over and over again)

        return false;
    }


    /**
     * Checks if the user is sending way too many messages in the timewindow
     * @param userID - User's id
     * @returns - Whether the user is sending messages too fast or not
     */
    private isHighFrequency(userID: string): boolean {
        const history = this.messageHistory.get(userID)!;
        return history.length >= this.maxMessages;
    }

    /**
     * Checks if the user is repeating similar or identical messages
     * @param userID - User's id
     * @param newMessage - Latest message sent by the user
     * @returns - Whether the user is sending the same messages or not
     */
    private isRepeatedContent(userID: string, newMessage: UserMessage): boolean {
        const history = this.messageHistory.get(userID)!;
        const lastMessage = Array.from(history.values())[history.length - 2];

        if (!lastMessage) return false;

        const similarity = this.similarity(lastMessage.message, newMessage.message);

        if (similarity > this.repeatThreshold) return true;

        return false;
    }

    /**
     * Computes similarity between two strings
     * @param str1 - First string
     * @param str2 - Second string
     * @returns - The similarity (in percentage)
     */
    private similarity(str1: string, str2: string): number {
        const editDistance = this.getLevenshteinDistance(str1, str2);
        const maxLength = Math.max(str1.length, str2.length);
        return 1 - editDistance / maxLength;
    }

    /**
     * Computes the Levenshtein distance between two strings (a number that tells you how different two strings are).
     * The higher the number, the more different the two strings are.
     * Original source: https://gist.github.com/andrei-m/982927/0efdf215b00e5d34c90fdc354639f87ddc3bd0a5
     * Props to this guy as my own implementation didn't work properly. Life saver
     */
    private getLevenshteinDistance(a: string, b: string): number {
        if (a.length == 0) return b.length;
        if (b.length == 0) return a.length;

        const matrix = [];

        // increment along the first column of each row
        let i;
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        let j;
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1
                        )
                    ); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    };
};

export default new SpamDetection();