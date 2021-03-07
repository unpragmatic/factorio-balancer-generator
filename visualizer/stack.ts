export class Stack<T> {

    private items: T[]
    private index: number

    public constructor() {
        this.index = 0
        this.items = new Array<T>()
    }

    public push(element: T): void {
        this.items[this.index] = element
        this.index++
    }

    public pop(): T {
        var element = this.items[--this.index]
        return element
    }

    public poll(): T {
        var element = this.items[this.index - 1]
        return element
    }

    public is_empty(): boolean {
        return this.index <= 0
    }

}