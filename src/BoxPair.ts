import BoxWrap from './BoxWrap';

export default class BoxPair<T> {
    
    public readonly first:BoxWrap<T>;
    public readonly second:BoxWrap<T>;
    public readonly hash:number;
    
    constructor(a:BoxWrap<T>, b:BoxWrap<T>) {
        let f:BoxWrap<T>, s:BoxWrap<T>;
        if(a.id < b.id) {
            this.first = f = a;
            this.second = s = b;
        } else {
            this.first = f = b;
            this.second = s = a;
        }
        this.hash = f.id + 127 * s.id;
    }
    
    public equals(other:BoxPair<T>) {
        return other.first.id === this.first.id
            && other.second.id === this.second.id
    }
}