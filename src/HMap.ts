export interface Entry<K, V> {
    readonly deleted:boolean;
    readonly key:K;
    readonly value:V;
}

const abs = Math.abs;
const ceil = Math.ceil;
const LOAD_FACTOR = 0.6;// if a map is fuller than that, it should be resized
const GC_THRESHOLD = 0.2;// and also if there are less than that amount of undefined slots
const DELETED_ENTRY:Entry<any, any> = {key: undefined, value: undefined, deleted: true};

export default class HMap<K, V> {
    
    private entries:Array<Entry<K, V>> = [];
    private _size:number = 0;
    private _freeSize:number = 0;
    
    constructor(
        private hashFun:(k:K) => number,
        private eq:(a:K, b:K) => boolean,
        size:number = 10
    ) {
        this._resize(size / LOAD_FACTOR);
    }
    
    private _resize(size:number) {
        const entries = [];
        // healthy margin because of the birthday paradox, setting all entries
        // to undefined
        const virtSize = ceil(size);
        if(this._size >= virtSize) {
            throw new Error('Map degenerated.');
        }
        entries[virtSize - 1] = undefined;
        let hash:number, i:number, k:K;
        for(let e of this.entries) {
            if (e !== undefined && !e.deleted) {
                k = e.key;
                hash = abs(this.hashFun(e.key));
                i = hash % virtSize;
                let c:Entry<K, V> = entries[i];
                while(c !== undefined) {
                    i = (i + 1) % virtSize;
                    c = entries[i];
                }
                entries[i] = e;
            }
        }
        this.entries = entries;
        this._freeSize = virtSize - this._size;
    }
    
    private checkResize(elementCount:number) {
        const arrLength = this.entries.length;
        if (elementCount > arrLength * LOAD_FACTOR) {
            this._resize(2 * arrLength);
        } else if (this._freeSize < arrLength * GC_THRESHOLD) {
            this._resize(arrLength);
        }
    }
    
    public put(k:K, v:V) {
        this.checkResize(this._size + 1);
        const entries = this.entries;
        const hash = abs(this.hashFun(k));
        const virtSize = entries.length;
        let i = hash % virtSize;
        let c:Entry<K, V> = entries[i];
        while(c !== undefined && !c.deleted && !this.eq(c.key, k)) {
            i = (i + 1) % virtSize;
            c = entries[i];
        }
        if(c === undefined || c.deleted) {
            this._size += 1;
        }
        if(c === undefined) {
            --this._freeSize;
        }
        entries[i] = {key: k, value: v, deleted: false};
        if(c === undefined || c.deleted) {
            return null;
        }
        return c.value;
    }
    
    public get(k:K):V {
        const entries = this.entries;
        const hash = abs(this.hashFun(k));
        const virtSize = entries.length;
        const i = hash % virtSize;
        let c = entries[i];
        let o = 0;
        while(c !== undefined && (c.deleted || !this.eq(k, c.key)) && o < virtSize) {
            ++o;
            c = entries[(i + o) % virtSize];
        }
        if(c !== undefined && !c.deleted && o < virtSize) {
            return c.value;
        }
        return null;
    }
    
    public remove(k:K):V {
        const entries = this.entries;
        const hash = abs(this.hashFun(k));
        const virtSize = entries.length;
        let i = hash % virtSize;
        let c = entries[i];
        while(c !== undefined && (c.deleted || !this.eq(k, c.key))) {
            i = (i + 1) % virtSize;
            c = entries[i];
        }
        if(c !== undefined && !c.deleted) {
            entries[i] = DELETED_ENTRY;
            this._size -= 1;
            return c.value;
        }
        return null;
    }
    
    public removeIf(predicate:(k:K, v:V) => boolean) {
        const entries = this.entries;
        let e:Entry<K, V>;
        for(let i = 0; i != entries.length; ++i) {
            e = entries[i];
            if(e != undefined && !e.deleted) {
                if(predicate(e.key, e.value)) {
                    entries[i] = DELETED_ENTRY;
                }
            }
        }
    }
    
    public contains(k:K):boolean {
        const entries = this.entries;
        const hash = abs(this.hashFun(k));
        const virtSize = entries.length;
        let i = hash % virtSize;
        let c = entries[i];
        while(c !== undefined && (c.deleted || !this.eq(k, c.key))) {
            i = (i + 1) % virtSize;
            c = entries[i];
        }
        return c !== undefined && !c.deleted;
    }
    
    public keys():Array<K> {
        return this.entries
            .filter(e => e !== undefined && !e.deleted)
            .map(e => e.key);
    }
    
    public values():Array<V> {
        return this.entries
            .filter(e => e !== undefined && !e.deleted)
            .map(e => e.value);
    }
    
    public get size() {
        return this._size;
    }
    
    public clear() {
        const entries = this.entries;
        this.entries = [];
        this.entries[entries.length - 1] = undefined;
        this._size = 0;
        this._freeSize = entries.length;
    }
    
}