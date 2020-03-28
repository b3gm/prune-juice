import insertionSort from './insertionSort';
import PruneJuice from './PruneJuice';
import CollisionDetection from './CollisionDetection';
import DimensionExtractor from './DimensionExtractor';

let idCnt = 0;

function nativeSort<T>(arr:Array<T>, cmp:(a:T, b:T) => number) {
    arr.sort(cmp);
}

let sortTests = [
	[0],
	[1],
	[0,2],
	[0,2],
	[1,2,3],
	[8,7,3,2],
	[0,1,4,2,6,9,3,12,5]
];

let cmp = function(a:number, b:number):number {
	return a - b;
}

let i = 0;
for(let a of sortTests) {
	insertionSort(a, cmp);
	console.log('Ordered array:', a);
	console.log('Sort test ' + (++i) + ' is '
		+ (ascendingOrdered(a) ? 'successful' : 'failure'));
}

let points:Array<Point> = [];
let xSorted:Array<Point> = [];
let ySorted:Array<Point> = [];
let p:Point;
for(let i = 0; i != 100; ++i) {
	p = randomPoint();
	points.push(p);
	xSorted.push(p);
	ySorted.push(p);
}

insertionSort(xSorted, xCmp);
insertionSort(ySorted, yCmp);

console.log('xSorted', xSorted);
console.log('ySorted', ySorted);

let nuSort = xSorted;
if(window.location.hash === '#performance') {
	let tmp = nuSort[66];
	nuSort[66] = nuSort[67];
	nuSort[67] = tmp;

	let ops = 0;
	let start = Date.now();
	let opsToDo = 1000;

	while(Date.now() - start < 1000) {
		for(let i = 0; i != opsToDo; ++i) {
			insertionSort(getPoints(), xCmp);
		}
		ops += opsToDo;
	}
	console.log('My sorts per second:', ops);
	start = Date.now();
	ops = 0;
	while(Date.now() - start < 1000) {
		for(let i = 0; i != opsToDo; ++i) {
			nativeSort(getPoints(), xCmp);
		}
		ops += opsToDo;
	}
	console.log('native sorts per second:', ops);
}

function getPoints() {
	let result:Array<Point> = [];
	for(let p of nuSort) {
		result.push(p);
	}
	return result;
}

function ascendingOrdered(arr:Array<number>) {
	for(let i = 1; i < arr.length; ++i) {
		if(cmp(arr[i - 1], arr[i]) > 0) {
			return false;
		}
	}
	return true;
}

interface Point {
	id:number;
	x:number;
	y:number;
}

function randomPoint():Point {
	return {
		id: ++idCnt,
		x: Math.random(),
		y: Math.random()
	};
}

function xCmp(a:Point, b:Point) {
	return a.x - b.x;
}

function yCmp(a:Point, b:Point) {
	return a.y - b.y;
}

class MyBox {
    xStart:number;
    xEnd:number;
    yStart:number;
    yEnd:number;
    collides:boolean = false;
    
    constructor(
        public x:number,
        public y:number,
        public w:number,
        public h:number,
        public vx:number,
        public vy:number
    ) {
        const wHalf = w / 2;
        const hHalf = h / 2;
        this.xStart = x - wHalf;
        this.xEnd = x + wHalf;
        this.yStart = y - hHalf;
        this.yEnd = y + hHalf;
    }
    
    public move(dx:number, dy:number) {
        this.x += dx;
        this.y += dy;
        const wHalf = this.w / 2;
        const hHalf = this.h / 2;
        this.xStart = this.x - wHalf;
        this.xEnd = this.x + wHalf;
        this.yStart = this.y - hHalf;
        this.yEnd = this.y + hHalf;
    }
    
    public update(w:number, h:number, timePassed:number) {
        this.collides = false;
        if(this.x > w) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = w;
        }
        if(this.y > h) {
            this.y = 0;
        } else if(this.y < 0) {
            this.y = h;
        }
        this.move(this.vx * timePassed, this.vy * timePassed);
    }
}

const fb = new MyBox(
	10,
	50,
    20,
	20,
    0,
    0
);

const sb = new MyBox(
	20,
	40,
	20,
	20,
    0,
    0
);

const tb = new MyBox(
	30,
	30,
	5,
	5,
    0,
    0
);

const dimensionExtractors: Array<DimensionExtractor<MyBox>> = [
    {getStart: m => m.xStart, getEnd: m => m.xEnd},
    {getStart: m => m.yStart, getEnd: m => m.yEnd}
];

let pj:PruneJuice<MyBox> = new PruneJuice(
    dimensionExtractors,
    insertionSort
);

[fb, sb, tb].forEach(b => pj.register(b));

let pairs:Array<Array<MyBox>> = pj.getCollisionCandidates();

console.log('Found collisions:', pairs);

let boxes:Array<MyBox> = [];

let cvs:HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('cvs');
let ctx:CanvasRenderingContext2D = cvs.getContext('2d');
let w:number = cvs.width;
let h:number = cvs.height;

for(let i = 0; i != 40; ++i) {
	boxes.push(
        new MyBox(
            Math.random() * w,
            Math.random() * h,
            Math.random() * 40 + 10,
            Math.random() * 40 + 10,
            Math.random() * 40 - 20,
            Math.random() * 40 - 20
        )
    );
}

let boxCollisions:CollisionDetection<MyBox>;
boxCollisions = new PruneJuice(dimensionExtractors, insertionSort);
//boxCollisions = new BruteForceCollision();
boxes.forEach(b => boxCollisions.register(b));

function updateBoxes(boxes:Array<MyBox>, timePassed:number) {
	for(let b of boxes) {
        b.update(w, h, timePassed);
	}
}

let lastCall:number = 0;
let passed:number = 0;
let collisions:Array<Array<MyBox>> = [];

function loop() {
	ctx.fillStyle = '#202020';
	ctx.fillRect(0, 0, w, h);
	if(lastCall !== 0) {
		passed = Math.min(2 / 60, (Date.now() - lastCall) / 1000);	
    	updateBoxes(boxes, passed);
	} else {
        updateBoxes(boxes, 0);
    }
	collisions = boxCollisions.getCollisionCandidates();
	for(let p of collisions) {
		for(let b of p) {
			b.collides = true;
		}
	}

	for(let b of boxes) {
		
		ctx.strokeStyle = b.collides ? '#90ff90' : '#808080';
		ctx.strokeRect(b.xStart, b.yStart, b.w, b.h);
	}

	for(let [b1, b2] of collisions) {
		ctx.strokeStyle = '#ff9090';
		ctx.beginPath();
		ctx.moveTo(b1.x, b1.y);
		ctx.lineTo(b2.x, b2.y);
		ctx.stroke();
	}
	lastCall = Date.now();
}

let iters:number = 0;
let sum:number = 0;
let durations:Array<number> = [];

function auditLoop() {
	++iters;
	let d = Date.now();
	loop();
	sum += (d = Date.now() - d);
	durations.push(d);
	if(iters % 100 === 0) {
		console.log('Average duration:', sum / 100);
		console.log(durations);
		sum = 0;
		durations = [];
	}
}

setInterval(() => {
	requestAnimationFrame(loop );
}, 1000 / 60);