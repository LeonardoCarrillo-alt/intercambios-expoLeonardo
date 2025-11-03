export type User = {
    uid: string;
    email: string;
    role: string;
    photoUrl?: string;
     location?: {
        latitude: number;
        longitude: number;
        address?: string;
        lastUpdated?: Date;
    };
}