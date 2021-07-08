let name: string;
name = 111;


function add(a: number, b: number): number{
    return a + b;
}
add(1, '2');


function add2<T>(c: T, d: T) {
    return c + d;
}

add2<number>(3, '4')