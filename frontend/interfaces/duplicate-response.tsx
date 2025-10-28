export interface DuplicateResponse<T> {
    results: Array<T>,
    count: number,
    signals_processed: number
}