export interface ItemProps {
    id?: number;
    title: string;
    author?: string | null;
    published: Date;
    available: boolean;
}