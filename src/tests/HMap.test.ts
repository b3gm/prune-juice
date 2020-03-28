import 'jest';
import HMap from '../HMap';

function hashInts(n:number):number {
    return n;
}

function eqInts(a:number, b:number) {
    return a === b;
}

describe(HMap, () => {
    
    let map:HMap<number, string> = null;
    
    beforeEach(() => {
        map = new HMap(hashInts, eqInts, 3);
    });
    
    it('should be able to add elements', () => {
        map.put(3, 'three');
        map.put(9, 'nine');
        map.put(-100, 'negOneHundred');
        expect(map.get(3)).toBe('three');
        expect(map.get(9)).toBe('nine');
        expect(map.get(-100)).toBe('negOneHundred');
    });
    
    it('should resize on overflow', () => {
        map.put(3, 'three');
        map.put(15, 'fifteen');
        map.put(7, 'seven');
        map.put(11, 'eleven');
        map.put(13, 'thirteen');
        map.put(17, 'seventeen');
        map.put(19, 'nineteen');
        map.put(23, 'twentythree');
        expect(map.size).toBe(8);
        expect(map.get(19)).toBe('nineteen');
    });
    
    it('should remove elements', () => {
        map.put(3, 'three');
        map.put(14, 'fourteen');
        map.put(8, 'eight');
        expect(map.get(14)).toBe('fourteen');
        expect(map.size).toBe(3);
        expect(map.remove(14)).toBe('fourteen');
        expect(map.get(14)).toBe(null);
        expect(map.size).toBe(2);
        expect(map.remove(100)).toBe(null);
        expect(map.size).toBe(2);
    });
    
    it('should be able to deal with hash collisions', () => {
        map.put(13, 'thirteen');
        map.put(23, 'twentyThree');
        expect(map.get(13)).toBe('thirteen');
        expect(map.get(23)).toBe('twentyThree');
    });
    
    it('should keep deleted states', () => {
        map.put(13, 'thirteen');
        map.put(23, 'twentyThree');
        map.remove(13);
        expect(map.contains(13)).toBe(false);
        expect(map.contains(23)).toBe(true);
        expect(map.get(23)).toBe('twentyThree');
        expect(map.remove(23)).toBe('twentyThree');
        expect(map.contains(23)).toBe(false);
        map.put(18, 'eigtheen');
    });
    
    it('should return already existing values', () => {
        expect(map.size).toBe(0);
        expect(map.put(23, 'twentyThree')).toBe(null);
        expect(map.size).toBe(1);
        expect(map.put(23, 'alsoTwentyThree')).toBe('twentyThree');
        expect(map.size).toBe(1);
        expect(map.get(23)).toBe('alsoTwentyThree');
    });
    
    it('should return keys', () => {
        map.put(13, 'thirteen');
        map.put(15, 'fifteen');
        const keys = map.keys();
        expect(keys).toContain(13);
        expect(keys).toContain(15);
        expect(keys.length).toBe(2);
    });
    
    it('should return whether or not an item is contained', () => {
        map.put(3, 'three');
        map.put(8, 'eight');
        expect(map.contains(3)).toBe(true);
        expect(map.contains(8)).toBe(true);
        expect(map.contains(13)).toBe(false);
    });
    
    it('should clear the map', () => {
        map.put(3, 'three');
        map.put(8, 'eight');
        map.put(2, 'two');
        map.clear();
        expect(map.keys().length).toBe(0);
        expect(map.size).toBe(0);
    });
    
    it('should correctly return current values', () => {
        let keys: Array<number> = [];
        let c = 0;
        let inc = 1;
        for (let i = 1; i <= 40; ++i) {
            keys.push(c);
            if (i % 6 == 0) {
                c += 1;
            }
            if (i % 7 == 0) {
                c += 4;
            }
            if (i % 11 == 0) {
                c += 10;
            }
            c += inc;
        }
        for (let k of keys) {
            map.put(k, 'number_' + k);
        }
        let values = map.values();
        for (let k of keys) {
            expect(values).toContain('number_' + k);
        }
        for(let i = 0; i < keys.length; ++i) {
            const k = keys[i];
            if (i % 3 == 2) {
                map.remove(k);
            }
        }
        values = map.values();
        for(let i = 0; i < keys.length; ++i) {
            const k = keys[i];
            if (i % 3 != 2) {
                expect(values).toContain('number_' + k);
            } else {
                expect(values).not.toContain('number_' + k);
            }
        }
    });
});
