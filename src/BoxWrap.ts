import BBox2 from './BBox2';

export default interface BoxWrap<T extends BBox2> {
	box:T;
	id:number;
}