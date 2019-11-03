import BBox2 from './BBox2';
import BoxWrap from './BoxWrap';

export interface BoundMarker<T extends BBox2> {
    bound:number;
    updateBound():void;
    readonly boxWrap:BoxWrap<T>;
}

export abstract class ABoundMarker<T extends BBox2> implements BoundMarker<T> {
    
    private _bound:number;
    private _box:T;
    
    constructor(
        public readonly boxWrap:BoxWrap<T>
    ) {
        this._box = boxWrap.box;
    }
    
    protected abstract extractBound(box:T):number;
    
    public updateBound():void {
        this._bound = this.extractBound(this._box);
    }
    
    public get bound():number {
        return this._bound;
    }
}

export class XStart<T extends BBox2> extends ABoundMarker<T> {
    protected extractBound(box: T): number {
        return box.xStart;
    }
}

export class XEnd<T extends BBox2> extends ABoundMarker<T> {
    protected extractBound(box: T): number {
        return box.xEnd;
    }
}

export class YStart<T extends BBox2> extends ABoundMarker<T> {
    protected extractBound(box: T): number {
        return box.yStart;
    }
}

export class YEnd<T extends BBox2> extends ABoundMarker<T> {
    protected extractBound(box: T): number {
        return box.yEnd;
    }
}
