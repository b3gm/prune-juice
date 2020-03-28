import BBox2 from './BBox2';
import BoxWrap from './BoxWrap';
import SortFunction from './SortFunction';
import {
    BoundMarker,
    XStart,
    XEnd,
    YStart,
    YEnd
} from './BoundMarker';
import insertionSort from './insertionSort';
import PairManager from './PairManager';
import ProcessingOrder2 from './ProcessingOrder2';
import HMap from './HMap';

function cmpBounds<T extends BBox2>(a:BoundMarker<T>, b:BoundMarker<T>):number {
    return a.bound - b.bound;
}

function wrapHash(b:BoxWrap<any>):number {
    return b.id;
}

function wrapEquals(a:BoxWrap<any>, b:BoxWrap<any>):boolean {
    return a.box === b.box;
}

export default class PruineJuice2<T extends BBox2> {
    
    private idCnt:number = 0;
    
    private pairManager:PairManager<T> = new PairManager();
    
    private xList:Array<BoundMarker<T>> = [];
    private yList:Array<BoundMarker<T>> = [];
    private lists:Array<Array<BoundMarker<T>>> = [];
    
    constructor(
        order = ProcessingOrder2.XY,
        private readonly sortFn:SortFunction = insertionSort
    ) {
        if(order === ProcessingOrder2.XY) {
            this.lists.push(this.xList, this.yList);
        } else {
            this.lists.push(this.yList, this.xList);
        }
    }
    
    public register(box:T) {
        const boxWrap:BoxWrap<T> = {id: ++this.idCnt, box};
        this.xList.push(
            new XStart(boxWrap),
            new XEnd(boxWrap)
        );
        this.yList.push(
            new YStart(boxWrap),
            new YEnd(boxWrap)
        );
    }
    
    public unregister(box:T) {
        const boxFilter:(m:BoundMarker<T>) => boolean =
            m => m.boxWrap.box !== box;
        this.xList = this.xList.filter(boxFilter);
        this.yList = this.yList.filter(boxFilter);
    }
    
    private updateNodes() {
        for(let list of this.lists) {
            for(let m of list) {
                m.updateBound();
            }
        }
    }
    
    public getCollisionCandidates():Array<Array<T>> {
        this.updateNodes();
        const sort = this.sortFn;
        sort(this.xList, cmpBounds);
        sort(this.yList, cmpBounds);
        let boxWrap:BoxWrap<T>, existing:BoxWrap<T>;
        const pairManager = this.pairManager;
        let activeWraps:HMap<BoxWrap<T>, BoxWrap<T>> = new HMap(
            wrapHash,
            wrapEquals
        );
        let pass = 0;
        let wrapConsumer:(a:BoxWrap<T>, b:BoxWrap<T>) => void =
            (a, b) => pairManager.add(a, b);
        const increasingConsumer:(a:BoxWrap<T>, b:BoxWrap<T>) => void =
            (a, b) => pairManager.increaseIfPresent(a, b);
        for(let list of this.lists) {
            for(let m of list) {
                boxWrap = m.boxWrap;
                existing = activeWraps.get(boxWrap);
                if(existing != null) {
                    activeWraps.remove(boxWrap);
                } else {
                    // this box overlaps with all currently active boxes.
                    for(let w of activeWraps.keys()) {
                        wrapConsumer(boxWrap, w);
                    }
                    activeWraps.put(boxWrap, boxWrap);
                }
            }
            activeWraps.clear();
            ++pass;
            if(pass > 1) {
                pairManager.cull(pass);
            }
            wrapConsumer = increasingConsumer;
        }
        return pairManager.getPairs();
    }
    
}