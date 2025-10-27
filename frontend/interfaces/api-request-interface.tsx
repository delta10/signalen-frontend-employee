export interface ApiRequestInterface<T> {
    _links: {
        self: {
            href: string;
        };
    };
    count: number;
    results: Array<T>;
}