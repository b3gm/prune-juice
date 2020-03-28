import CollisionDetection from './CollisionDetection';
import DimensionExtractor from './DimensionExtractor';

export default class BruteForceCollision<T>
    implements CollisionDetection<T>
{
	private nodes:Array<T>;
	
	constructor(private readonly dimensions: Array<DimensionExtractor<T>>) {
		this.nodes = [];
	}
	
	public register(item:T) {
		this.nodes.push(item);
	}
	
	public unregister(item:T) {
		let b:T;
		for(let i = 0; i != this.nodes.length; ++i) {
			b = this.nodes[i];
			if(b === item) {
				this.nodes.splice(i, 1);
				break;
			}
		}
	}
	
	private checkCollision(a:T, b:T) {
        for (let dimension of this.dimensions) {
            if(!this.intervalsOverlap(dimension.getStart(a), dimension.getEnd(a), dimension.getStart(b), dimension.getEnd(b))) {
                return false;
            }
        }
        return true;
    }
	
	private intervalsOverlap(x1:number, x2:number, y1:number, y2:number) {
		return !(x1 > y2 || y1 > x2);
	}
	
	public getCollisionCandidates():Array<Array<T>> {
		let a:T, b:T;
		let result:Array<Array<T>> = [];
		for(let i = 0; i != this.nodes.length; ++i) {
			a = this.nodes[i];
			for(let j = 0; j != i; ++j) {
				b = this.nodes[j];
				if(this.checkCollision(a, b)) {
					result.push([a,b]);
				}
			}
		}
		return result;
	}
}