import CollisionDetection from './CollisionDetection';
import BBox2 from './BBox2';

export default class BruteForceCollision<T extends BBox2>
    implements CollisionDetection<T>
{
	private nodes:Array<T>;
	
	constructor() {
		this.nodes = [];
	}
	
	public register(box:T) {
		this.nodes.push(box);
	}
	
	public unregister(box:T) {
		let b:T;
		for(let i = 0; i != this.nodes.length; ++i) {
			b = this.nodes[i];
			if(b === box) {
				this.nodes.slice(i, 1);
				break;
			}
		}
	}
	
	private checkCollision(a:T, b:T) {
		return this.intervalsOverlap(a.xStart, a.xEnd, b.xStart, b.xEnd)
			&& this.intervalsOverlap(a.yStart, a.yEnd, b.yStart, b.yEnd); 
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