
export const extractNumbersFromPath = (path: string): number[] => {
    const numbers: number[] = []

    const rangePattern = /(\d+)-(\d+)/g
    let match

    while ((match = rangePattern.exec(path)) !== null) {
        numbers.push(parseInt(match[1]))  
    }

    return numbers
}