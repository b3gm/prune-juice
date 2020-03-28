import BoxWrap from './BoxWrap';

export default class BoundMarker<T> implements BoundMarker<T> {
    
    private _bound:number;
    
    constructor(
        public readonly boxWrap:BoxWrap<T>,
        private readonly boundGetter: (t: T) => number
    ) {
    }
    
    public updateBound():void {
        this._bound = this.boundGetter(this.boxWrap.item);
    }
    
    public get bound():number {
        return this._bound;
    }
}
