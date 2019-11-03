import BBox2 from './BBox2';
import HMap from './HMap';
import BoxWrap from './BoxWrap';
import BoxPair from './BoxPair';

function pairHash(p:BoxPair<any>):number {
    return p.hash;
}

function pairEquals(a:BoxPair<any>, b:BoxPair<any>):boolean {
    return a.equals(b);
}

export default class PairManager<T extends BBox2> {
    
    private pairs:HMap<BoxPair<T>, number> = new HMap(
        pairHash,
        pairEquals
    );
    
    public add(a:BoxWrap<T>, b:BoxWrap<T>) {
        const pair = new BoxPair(a, b);
        this.pairs.put(pair, 1);
    }
    
    public increaseIfPresent(a:BoxWrap<T>, b:BoxWrap<T>) {
        const pair = new BoxPair(a, b);
        const cnt = this.pairs.get(pair);
        if(cnt !== null) {
            this.pairs.put(pair, cnt + 1);
        }
    }
    
    public cull(n:number) {
        this.pairs.removeIf((b, c) => c < n);
    }
    
    public getPairs():Array<Array<T>> {
        const result = this.pairs.keys().map(b => [b.first.box, b.second.box]);
        this.pairs.clear();
        return result;
    }
    
}