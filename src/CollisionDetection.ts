export default interface CollisionDetection<T> {
	register(box:T):void;
	unregister(box:T):void;
	getCollisionCandidates():Array<Array<T>>;
}