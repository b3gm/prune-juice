import BoxWrap from './BoxWrap';
import Dimension from './Dimension';
import SortFunction from './SortFunction';
import insertionSort from './insertionSort';
import PairManager from './PairManager';
import DimensionExtractor from './DimensionExtractor';
import HMap from './HMap';

function wrapHash(b:BoxWrap<any>):number {
    return b.id;
}

function wrapEquals(a:BoxWrap<any>, b:BoxWrap<any>):boolean {
    return a.item === b.item;
}

export default class PruneJuice<T> {
    
    private idCnt:number = 0;
    
    private pairManager:PairManager<T> = new PairManager();
    private readonly dimensions: Array<Dimension<T>>;
    
    constructor(
        extractors: Array<DimensionExtractor<T>>,
        sortFn:SortFunction = insertionSort
    ) {
        const dimensions: Array<Dimension<T>> = this.dimensions = [];
        for (let e of extractors) {
            this.dimensions.push(new Dimension(e, sortFn));
        }
    }
    
    public register(item:T) {
        const boxWrap:BoxWrap<T> = {id: ++this.idCnt, item};
        const dimensions = this.dimensions;
        let i = 0;
        for (let d of dimensions) {
            d.register(boxWrap);
        }
    }
    
    public unregister(item:T) {
        for (let d of this.dimensions) {
            d.unregister(item);
        }
    }
    
    public getCollisionCandidates():Array<Array<T>> {
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
        for(let d of this.dimensions) {
            for (let m of d.getSortedMarkers()) {
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