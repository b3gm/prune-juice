prune-juice
===========

This library implements the sweep and prune algorithm for an arbitrary number
of dimensions.


Introduction
============

Sweep and prune is an algorithm for collision detection between axis *aligned
bounding boxes* (*AABB*). It has a runtime complexity of `O(d*N)` with `N` being
the
number of observed AABBs and `d` being the number of dimensions of the vector
space. Even if you're interested in the detection of collisions between more
intricate objects, sweep and prune can be used as a presolver, to find a list
of possible collision candidates before filtering those candidate pairs with a
more accurate collision detection algorithms.

Sweep and prune is best suited, if you're interested in finding all possible
colliding pairs in a large set of dynamic AABBs. On the other hand, if you're
only interested in the collisions of few dynamic objects with a large set of
static ones, other data structures like R-trees will probably be faster.

BasicUsage
==========

For the following examples we will assume that we have a type `MyBox` defined
like this:

```typescript
interface MyBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
```

First an object of type `PruneJuice` has to be constructed. The library makes
no assumptions about your exact type of AABB. That's why it needs an array of
so called dimension extractors for construction. A dimension extractor is an
object with a getStart and a getEnd method, that takes one of your AABBs and
returns its low end and high end coordinates respectively.

```typescript
import { PruneJuice } from '@b3gm/prune-juice';

const pj : PruneJuice<MyBox> = new PruneJuice(
    [
        {
            getStart: (b: MyBox) => b.x,
            getEnd: (b: MyBox) => b.x + b.width
        },
        {
            getStart: (b: MyBox) => b.y,
            getEnd: (b: MyBox) => b.y + b.height
        }
    ]
);
```

Note, that the dimension extractor order corresponds to the order in which
your dimensions will be processed. Sweep and Prune works most memory efficient
if the dimensions in which the AABBs overlap least likely are processed first.
Think for example of a solar system in which the celestial bodies orbit mostly
in the `x`-`y` plane of the coordinate system. If we would process the `z` dimension
first, sweep and prune will construct `~N^2` collision candidates, that are then
going to be mostly thrown away again when processing the `x` and `y` dimensions.

After that you may register and unregister AABBs, update their positions and
sizes and check for colliding pairs between them.

```typescript
myBoxes.forEach(b => pj.register(b));

function loop() {
    updateBoxes(myBoxes);// move boxes, possibly resize.
    const candidates: MyBox[][] = pj.getCollisionCandidates();
    processCollisions(candidates);
}

// or replace with dedicated game loop:
setInterval(loop, 1000.0 / 60.0);
```

Note however, that adding and removing AABBs from PruneJuice also has O(d*N)
runtime complexity.

How does it work
================

Sweep and prune internally keeps a sorted array of the beginning and end markers
for the registered AABBs for each dimension between each call to
`getCollisionCandidates` and resorts them. The key insight here is, that if
each of the boxes only moves a little bit between each call, this doesn't
completely scramble those internal arrays. That's why a sorting algorithm, that
works best on almost sorted arrays like insertion sort, which has linear
runtime complexity in that case, should be used. After that each of the
dimensions are being scanned for overlapping bounding boxes. If a pair of
bounding boxes overlaps in all dimensions, they are being returned as collision
candidates.

If you want to test PruneJuice with a different sorting algorithm, you may
supply a custom one as the optional second argument to the PruneJuice 
constructor. It must have the following interface:

```typescript
interface SortFunction {
    <T>(arr:Array<T>, cmp:(a:T, b:T) => number):void;
}
```

Since this function does not return anything, it is expected to modify its
first argument. Sorting should be done according to the second argument
comparator.
