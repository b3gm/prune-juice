export default interface DimensionExtractor<T> {
    
    getStart(t: T): number;
    getEnd(t: T): number;
    
}