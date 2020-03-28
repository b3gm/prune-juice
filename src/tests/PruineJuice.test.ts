import 'jest';
import PruneJuice from '../PruneJuice';


interface Box1D {
    x: number;
    r: number;
    xStart: number;
    xEnd: number;
    moveX(dx: number): void;
}


interface Box2D extends Box1D {
    y: number;
    yStart: number;
    yEnd: number;
    moveY(dy: number): void;
    move(dx: number, dy: number): void;
}


class Cube implements Box2D {
    
    private _x: number;
    private _y: number;
    private _r: number;

    public xStart: number;
    public xEnd: number;
    public yStart: number;
    public yEnd: number;
    
    constructor(x: number, y: number, r: number = -1) {
        if (r < 0) {
            r = y;
            this.yStart = 0;
            this.yEnd = 0;
        } else {
            this.yStart = y - r;
            this.yEnd = y + r;
        }
        this.xStart = x - r;
        this.xEnd = x + r;
        this._x = x;
        this._y = y;
        this._r = r;
    }
    
    public move(dx: number, dy: number) {
        this.moveX(dx);
        this.moveY(dy);
    }
    
    public moveX(dx:number) {
        this.x = this._x + dx;
    }
    
    public moveY(dy:number) {
        this.y = this._y + dy;
    }
    
    public set x(x: number) {
        this._x = x;
        this.xStart = x - this._r;
        this.xEnd = x + this._r;
    }
    
    public set y(y: number) {
        this._y = y;
        this.yStart = y - this._r;
        this.yEnd = y + this._r;
    }
    
    public set r(r: number) {
        this._r = r;
        this.xStart = this._x - r;
        this.xEnd = this._x + r;
        this.yStart = this._y - r;
        this.yEnd = this._y + r;
    }
}


function getStart(a: Box1D): number {
    return a.xStart;
}


function getEnd(a: Box1D): number {
    return a.xEnd;
}


describe(PruneJuice, () => {
    
    let pj1: PruneJuice<Box1D>;
    let pj2: PruneJuice<Box2D>;
    
    beforeEach(() => {
        pj1 = new PruneJuice<Box1D>([{getStart: b => b.xStart, getEnd: b => b.xEnd}]);
        pj2 = new PruneJuice<Box2D>([
            {getStart: b => b.xStart, getEnd: b => b.xEnd},
            {getStart: b => b.yStart, getEnd: b => b.yEnd}
        ]);
    });
    
    it('should be able to not detect not overlapping boxes', () => {
        let a: Box1D = new Cube(0.4, 0.5);
        let b: Box1D = new Cube(1.5, 0.5);
        pj1.register(a);
        pj1.register(b);
        
        let pairs = pj1.getCollisionCandidates();
        expect(pairs).toHaveLength(0);
        
        b.moveX(-1.3);
        a.moveX(1.0);
        
        pairs = pj1.getCollisionCandidates();
        expect(pairs).toHaveLength(0);
    });
    
    it('should find overlapping boxes', () => {
        let a: Box1D = new Cube(0.5, 0.5);
        let b: Box1D = new Cube(0.6, 0.5);
        pj1.register(a);
        pj1.register(b);
        
        let pairs = pj1.getCollisionCandidates();
        expect(pairs).toHaveLength(1);
        let pair = pairs[0];
        expect(pair).toContain(a);
        expect(pair).toContain(b);
        b.moveX(-0.5);
        a.moveX(0.5);
        
        pairs = pj1.getCollisionCandidates();
        expect(pairs).toHaveLength(1);
        pair = pairs[0];
        expect(pair).toContain(a);
        expect(pair).toContain(b);
        b.moveX(-0.5);
        a.moveX(0.5);
    });
    
    it('should find overlaps in two dimensions', () => {
        let a: Box2D = new Cube(0.5, 0.5, 0.5);
        let b: Box2D = new Cube(1.4, 1.4, 0.5);
        let c: Box2D = new Cube(0.8, 2.5, 0.5);
        let d: Box2D = new Cube(2.5, 0.8, 0.5);
        pj2.register(a);
        pj2.register(b);
        pj2.register(c);
        pj2.register(d);
        const pairs = pj2.getCollisionCandidates();
        expect(pairs).toHaveLength(1);
        const pair = pairs[0];
        expect(pair).toContain(a);
        expect(pair).toContain(b);
    });
    
    it('should not find overlaps with unregistered items', () => {
        let a: Box2D = new Cube(0.5, 0.5, 0.5);
        let b: Box2D = new Cube(1.0, -1.0, 2.5);
        let c: Box2D = new Cube(-0.4, 0.4, 0.5);
        pj2.register(a);
        pj2.register(b);
        pj2.register(c);
        let pairs = pj2.getCollisionCandidates();
        expect(pairs).toHaveLength(3);
        pj2.unregister(b);
        pairs = pj2.getCollisionCandidates();
        expect(pairs).toHaveLength(1);
        const pair = pairs[0];
        expect(pair).toContain(a);
        expect(pair).toContain(c);
    })
    
});