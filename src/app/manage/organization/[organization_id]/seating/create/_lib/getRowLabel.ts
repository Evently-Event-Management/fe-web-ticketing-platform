const getRowLabel = (index: number): string => {
    let label = '';
    let temp = index;
    while (temp >= 0) {
        label = String.fromCharCode((temp % 26) + 65) + label;
        temp = Math.floor(temp / 26) - 1;
    }
    return label;
};
const getRowIndex = (label: string): number => {
    let index = 0;
    for (let i = 0; i < label.length; i++) {
        index = index * 26 + (label.charCodeAt(i) - 65 + 1);
    }
    return index - 1;
};
export {getRowIndex};
export {getRowLabel};