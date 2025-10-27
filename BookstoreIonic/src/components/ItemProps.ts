export interface ItemProps {
    id?: string;
    title: string;
    author?: string | null;
    published: Date;
    available: boolean;
    dirty?: boolean;
}