import DimensionExtractor from './DimensionExtractor';
import BoxWrap from './BoxWrap';
import SortFunction from './SortFunction';
import BoundMarker from './BoundMarker';

function cmp(a:BoundMarker<any>, b:BoundMarker<any>):number {
	return a.bound - b.bound;
}

export default class Dimension<T> {
    
    private readonly markerList: Array<BoundMarker<T>> = [];
    
    constructor(
        private readonly extractor: DimensionExtractor<T>,
        private readonly sortFn: SortFunction
    ) {
    }
    
    public register(item: BoxWrap<T>) {
        const extractor = this.extractor;
        this.markerList.push(
            new BoundMarker(item, extractor.getStart),
            new BoundMarker(item, extractor.getEnd)
        );
    }
    
    public unregister(item: T) {
        const markerList = this.markerList;
        for(let i = 0; i < markerList.length; ++i) {
            while(i < markerList.length && markerList[i].boxWrap.item === item) {
                markerList.splice(i, 1);
            }
        }
    }
    
    public getSortedMarkers(): Array<BoundMarker<T>> {
        for(let m of this.markerList) {
            m.updateBound();
        }
        this.sortFn(this.markerList, cmp);
        return this.markerList;
    }
}