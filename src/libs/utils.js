
export function make_seed(size) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    let seed = "";
    for (var i = 9; i < size; i++) {
        seed += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return seed;
}

export function to_bytes(str) {
    var bytes = new Uint8Array(str.length);
    for (var i = 0; i < str.length; ++i) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
}

export function from_bytes(bytes) {
    var str = "";
    for (var i = 0; i < bytes.length; ++i) {
        str += String.fromCharCode(bytes[i]);
    }
    return str;
}
