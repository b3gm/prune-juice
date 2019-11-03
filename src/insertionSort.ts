export default function insertionSort<T>(
	arr:Array<T>,
	cmp:(a:T, b:T) => number
):void {
	let a:T = null, b:T = null, tmp:T;
	let i:number = 0;
	let j:number = 0;
	let p:number = 0;
	
	while(i < arr.length) {
		b = a;
		tmp = a = arr[i];
		if(b !== null) {
			p = j = i-1;
			while(j >= 0 && cmp(tmp, arr[j]) < 0) {
				arr[j+1] = arr[j];
				p = j--;
			}
			if(j !== p) {
				arr[p] = tmp;
			}
		}
		++i;
	}
}