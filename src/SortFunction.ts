export default interface SortFunction {
    <T>(arr:Array<T>, cmp:(a:T, b:T) => number):void;
}