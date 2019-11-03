import BBox2 from './BBox2';

export default interface CollisionDetection<T extends BBox2> {
	register(box:T):void;
	unregister(box:T):void;
	getCollisionCandidates():Array<Array<T>>;
}