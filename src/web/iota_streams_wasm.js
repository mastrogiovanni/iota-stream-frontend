
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_30(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h801e58843c6e16dd(arg0, arg1, addHeapObject(arg2));
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

const u32CvtShim = new Uint32Array(2);

const uint64CvtShim = new BigUint64Array(u32CvtShim.buffer);
/**
*/
export function set_panic_hook() {
    wasm.set_panic_hook();
}

function __wbg_adapter_209(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h85ebf086f28a5177(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
export const ChannelType = Object.freeze({ SingleBranch:0,"0":"SingleBranch",MultiBranch:1,"1":"MultiBranch",SingleDepth:2,"2":"SingleDepth", });
/**
*/
export const LedgerInclusionState = Object.freeze({ Conflicting:0,"0":"Conflicting",Included:1,"1":"Included",NoTransaction:2,"2":"NoTransaction", });
/**
*/
export class Address {

    static __wrap(ptr) {
        const obj = Object.create(Address.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_address_free(ptr);
    }
    /**
    * @returns {string}
    */
    get addr_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_addr_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} addr_id
    */
    set addr_id(addr_id) {
        var ptr0 = passStringToWasm0(addr_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.address_set_addr_id(this.ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    get msg_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_msg_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} msg_id
    */
    set msg_id(msg_id) {
        var ptr0 = passStringToWasm0(msg_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.address_set_msg_id(this.ptr, ptr0, len0);
    }
    /**
    * @param {string} link
    * @returns {Address}
    */
    static from_string(link) {
        var ptr0 = passStringToWasm0(link, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.address_from_string(ptr0, len0);
        return Address.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_string() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_to_string(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Address}
    */
    copy() {
        var ret = wasm.address_copy(this.ptr);
        return Address.__wrap(ret);
    }
}
/**
*/
export class Author {

    static __wrap(ptr) {
        const obj = Object.create(Author.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_author_free(ptr);
    }
    /**
    * @param {string} seed
    * @param {SendOptions} options
    * @param {number} implementation
    */
    constructor(seed, options, implementation) {
        var ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(options, SendOptions);
        var ptr1 = options.ptr;
        options.ptr = 0;
        var ret = wasm.author_new(ptr0, len0, ptr1, implementation);
        return Author.__wrap(ret);
    }
    /**
    * @param {Client} client
    * @param {string} seed
    * @param {number} implementation
    * @returns {Author}
    */
    static from_client(client, seed, implementation) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        var ptr1 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.author_from_client(ptr0, ptr1, len1, implementation);
        return Author.__wrap(ret);
    }
    /**
    * @param {Client} client
    * @param {Uint8Array} bytes
    * @param {string} password
    * @returns {Author}
    */
    static import(client, bytes, password) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        var ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.author_import(ptr0, ptr1, len1, ptr2, len2);
        return Author.__wrap(ret);
    }
    /**
    * @param {string} password
    * @returns {Uint8Array}
    */
    export(password) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.author_export(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Author}
    */
    clone() {
        var ret = wasm.author_clone(this.ptr);
        return Author.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    channel_address() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.author_channel_address(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {boolean}
    */
    is_multi_branching() {
        var ret = wasm.author_is_multi_branching(this.ptr);
        return ret !== 0;
    }
    /**
    * @returns {Client}
    */
    get_client() {
        var ret = wasm.author_get_client(this.ptr);
        return Client.__wrap(ret);
    }
    /**
    * @param {string} psk_seed_str
    * @returns {string}
    */
    store_psk(psk_seed_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(psk_seed_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.author_store_psk(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    get_public_key() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.author_get_public_key(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    send_announce() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.author_send_announce(ptr);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    send_keyload_for_everyone(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_send_keyload_for_everyone(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {PskIds} psk_ids
    * @param {PublicKeys} sig_pks
    * @returns {any}
    */
    send_keyload(link, psk_ids, sig_pks) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        _assertClass(psk_ids, PskIds);
        var ptr1 = psk_ids.ptr;
        psk_ids.ptr = 0;
        _assertClass(sig_pks, PublicKeys);
        var ptr2 = sig_pks.ptr;
        sig_pks.ptr = 0;
        var ret = wasm.author_send_keyload(ptr, ptr0, ptr1, ptr2);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {any}
    */
    send_tagged_packet(link, public_payload, masked_payload) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.author_send_tagged_packet(ptr, ptr0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {any}
    */
    send_signed_packet(link, public_payload, masked_payload) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.author_send_signed_packet(ptr, ptr0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {Address} link_to
    * @returns {any}
    */
    receive_subscribe(link_to) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link_to, Address);
        var ptr0 = link_to.ptr;
        link_to.ptr = 0;
        var ret = wasm.author_receive_subscribe(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_tagged_packet(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_receive_tagged_packet(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_signed_packet(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_receive_signed_packet(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_sequence(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_receive_sequence(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_msg(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_receive_msg(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} anchor_link
    * @param {number} msg_num
    * @returns {any}
    */
    receive_msg_by_sequence_number(anchor_link, msg_num) {
        const ptr = this.__destroy_into_raw();
        _assertClass(anchor_link, Address);
        var ptr0 = anchor_link.ptr;
        anchor_link.ptr = 0;
        var ret = wasm.author_receive_msg_by_sequence_number(ptr, ptr0, msg_num);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    sync_state() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.author_sync_state(ptr);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    fetch_next_msgs() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.author_fetch_next_msgs(ptr);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    fetch_prev_msg(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_fetch_prev_msg(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {number} num_msgs
    * @returns {any}
    */
    fetch_prev_msgs(link, num_msgs) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_fetch_prev_msgs(ptr, ptr0, num_msgs);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    gen_next_msg_ids() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.author_gen_next_msg_ids(ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Array<any>}
    */
    fetch_state() {
        var ret = wasm.author_fetch_state(this.ptr);
        return takeObject(ret);
    }
}
/**
*/
export class Client {

    static __wrap(ptr) {
        const obj = Object.create(Client.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_client_free(ptr);
    }
    /**
    * @param {string} node
    * @param {SendOptions} options
    */
    constructor(node, options) {
        var ptr0 = passStringToWasm0(node, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(options, SendOptions);
        var ptr1 = options.ptr;
        options.ptr = 0;
        var ret = wasm.client_new(ptr0, len0, ptr1);
        return Client.__wrap(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    get_link_details(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.client_get_link_details(ptr, ptr0);
        return takeObject(ret);
    }
}
/**
*/
export class Cursor {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cursor_free(ptr);
    }
}
/**
*/
export class Details {

    static __wrap(ptr) {
        const obj = Object.create(Details.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_details_free(ptr);
    }
    /**
    * @returns {MessageMetadata}
    */
    get_metadata() {
        var ret = wasm.details_get_metadata(this.ptr);
        return MessageMetadata.__wrap(ret);
    }
    /**
    * @returns {MilestoneResponse | undefined}
    */
    get_milestone() {
        var ret = wasm.details_get_milestone(this.ptr);
        return ret === 0 ? undefined : MilestoneResponse.__wrap(ret);
    }
}
/**
*/
export class Message {

    static __wrap(ptr) {
        const obj = Object.create(Message.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_message_free(ptr);
    }
    /**
    * @returns {Message}
    */
    static default() {
        var ret = wasm.message_default();
        return Message.__wrap(ret);
    }
    /**
    * @param {string | undefined} identifier
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {Message}
    */
    static new(identifier, public_payload, masked_payload) {
        var ptr0 = isLikeNone(identifier) ? 0 : passStringToWasm0(identifier, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.message_new(ptr0, len0, ptr1, len1, ptr2, len2);
        return Message.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get_identifier() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.message_get_identifier(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Array<any>}
    */
    get_public_payload() {
        var ret = wasm.message_get_public_payload(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Array<any>}
    */
    get_masked_payload() {
        var ret = wasm.message_get_masked_payload(this.ptr);
        return takeObject(ret);
    }
}
/**
*/
export class MessageMetadata {

    static __wrap(ptr) {
        const obj = Object.create(MessageMetadata.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_messagemetadata_free(ptr);
    }
    /**
    * @returns {boolean}
    */
    get is_solid() {
        var ret = wasm.__wbg_get_messagemetadata_is_solid(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set is_solid(arg0) {
        wasm.__wbg_set_messagemetadata_is_solid(this.ptr, arg0);
    }
    /**
    * @returns {number | undefined}
    */
    get referenced_by_milestone_index() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_messagemetadata_referenced_by_milestone_index(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number | undefined} arg0
    */
    set referenced_by_milestone_index(arg0) {
        wasm.__wbg_set_messagemetadata_referenced_by_milestone_index(this.ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
    /**
    * @returns {number | undefined}
    */
    get milestone_index() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_messagemetadata_milestone_index(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number | undefined} arg0
    */
    set milestone_index(arg0) {
        wasm.__wbg_set_messagemetadata_milestone_index(this.ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
    /**
    * @returns {number | undefined}
    */
    get ledger_inclusion_state() {
        var ret = wasm.__wbg_get_messagemetadata_ledger_inclusion_state(this.ptr);
        return ret === 3 ? undefined : ret;
    }
    /**
    * @param {number | undefined} arg0
    */
    set ledger_inclusion_state(arg0) {
        wasm.__wbg_set_messagemetadata_ledger_inclusion_state(this.ptr, isLikeNone(arg0) ? 3 : arg0);
    }
    /**
    * @returns {number | undefined}
    */
    get conflict_reason() {
        var ret = wasm.__wbg_get_messagemetadata_conflict_reason(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret;
    }
    /**
    * @param {number | undefined} arg0
    */
    set conflict_reason(arg0) {
        wasm.__wbg_set_messagemetadata_conflict_reason(this.ptr, isLikeNone(arg0) ? 0xFFFFFF : arg0);
    }
    /**
    * @returns {boolean | undefined}
    */
    get should_promote() {
        var ret = wasm.__wbg_get_messagemetadata_should_promote(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret !== 0;
    }
    /**
    * @param {boolean | undefined} arg0
    */
    set should_promote(arg0) {
        wasm.__wbg_set_messagemetadata_should_promote(this.ptr, isLikeNone(arg0) ? 0xFFFFFF : arg0 ? 1 : 0);
    }
    /**
    * @returns {boolean | undefined}
    */
    get should_reattach() {
        var ret = wasm.__wbg_get_messagemetadata_should_reattach(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret !== 0;
    }
    /**
    * @param {boolean | undefined} arg0
    */
    set should_reattach(arg0) {
        wasm.__wbg_set_messagemetadata_should_reattach(this.ptr, isLikeNone(arg0) ? 0xFFFFFF : arg0 ? 1 : 0);
    }
    /**
    * @returns {string}
    */
    get message_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagemetadata_message_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Array<any>}
    */
    get get_parent_message_ids() {
        var ret = wasm.messagemetadata_get_parent_message_ids(this.ptr);
        return takeObject(ret);
    }
}
/**
*/
export class MilestoneResponse {

    static __wrap(ptr) {
        const obj = Object.create(MilestoneResponse.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_milestoneresponse_free(ptr);
    }
    /**
    * Milestone index.
    * @returns {number}
    */
    get index() {
        var ret = wasm.__wbg_get_milestoneresponse_index(this.ptr);
        return ret >>> 0;
    }
    /**
    * Milestone index.
    * @param {number} arg0
    */
    set index(arg0) {
        wasm.__wbg_set_milestoneresponse_index(this.ptr, arg0);
    }
    /**
    * Milestone timestamp.
    * @returns {BigInt}
    */
    get timestamp() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_milestoneresponse_timestamp(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = uint64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Milestone timestamp.
    * @param {BigInt} arg0
    */
    set timestamp(arg0) {
        uint64CvtShim[0] = arg0;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        wasm.__wbg_set_milestoneresponse_timestamp(this.ptr, low0, high0);
    }
    /**
    * @returns {string}
    */
    get message_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.milestoneresponse_message_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
*/
export class NextMsgId {

    static __wrap(ptr) {
        const obj = Object.create(NextMsgId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nextmsgid_free(ptr);
    }
    /**
    * @param {string} identifier
    * @param {Address} msgid
    * @returns {NextMsgId}
    */
    static new(identifier, msgid) {
        var ptr0 = passStringToWasm0(identifier, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(msgid, Address);
        var ptr1 = msgid.ptr;
        msgid.ptr = 0;
        var ret = wasm.nextmsgid_new(ptr0, len0, ptr1);
        return NextMsgId.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get_identifier() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nextmsgid_get_identifier(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Address}
    */
    get_link() {
        var ret = wasm.nextmsgid_get_link(this.ptr);
        return Address.__wrap(ret);
    }
}
/**
*/
export class PskIds {

    static __wrap(ptr) {
        const obj = Object.create(PskIds.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pskids_free(ptr);
    }
    /**
    * @returns {PskIds}
    */
    static new() {
        var ret = wasm.pskids_new();
        return PskIds.__wrap(ret);
    }
    /**
    * @param {string} id
    */
    add(id) {
        var ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.pskids_add(this.ptr, ptr0, len0);
    }
    /**
    * @returns {Array<any>}
    */
    get_ids() {
        var ret = wasm.pskids_get_ids(this.ptr);
        return takeObject(ret);
    }
}
/**
*/
export class PublicKeys {

    static __wrap(ptr) {
        const obj = Object.create(PublicKeys.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_publickeys_free(ptr);
    }
    /**
    * @returns {PublicKeys}
    */
    static new() {
        var ret = wasm.publickeys_new();
        return PublicKeys.__wrap(ret);
    }
    /**
    * @param {string} id
    */
    add(id) {
        var ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.publickeys_add(this.ptr, ptr0, len0);
    }
    /**
    * @returns {Array<any>}
    */
    get_pks() {
        var ret = wasm.publickeys_get_pks(this.ptr);
        return takeObject(ret);
    }
}
/**
*/
export class SendOptions {

    static __wrap(ptr) {
        const obj = Object.create(SendOptions.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sendoptions_free(ptr);
    }
    /**
    * @returns {boolean}
    */
    get local_pow() {
        var ret = wasm.__wbg_get_sendoptions_local_pow(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set local_pow(arg0) {
        wasm.__wbg_set_sendoptions_local_pow(this.ptr, arg0);
    }
    /**
    * @param {string} url
    * @param {boolean} local_pow
    */
    constructor(url, local_pow) {
        var ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.sendoptions_new(ptr0, len0, local_pow);
        return SendOptions.__wrap(ret);
    }
    /**
    * @param {string} url
    */
    set url(url) {
        var ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.sendoptions_set_url(this.ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    get url() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.sendoptions_url(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {SendOptions}
    */
    clone() {
        var ret = wasm.sendoptions_clone(this.ptr);
        return SendOptions.__wrap(ret);
    }
}
/**
*/
export class Subscriber {

    static __wrap(ptr) {
        const obj = Object.create(Subscriber.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_subscriber_free(ptr);
    }
    /**
    * @param {string} seed
    * @param {SendOptions} options
    */
    constructor(seed, options) {
        var ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(options, SendOptions);
        var ptr1 = options.ptr;
        options.ptr = 0;
        var ret = wasm.subscriber_new(ptr0, len0, ptr1);
        return Subscriber.__wrap(ret);
    }
    /**
    * @param {Client} client
    * @param {string} seed
    * @returns {Subscriber}
    */
    static from_client(client, seed) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        var ptr1 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.subscriber_from_client(ptr0, ptr1, len1);
        return Subscriber.__wrap(ret);
    }
    /**
    * @param {Client} client
    * @param {Uint8Array} bytes
    * @param {string} password
    * @returns {Subscriber}
    */
    static import(client, bytes, password) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        var ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.subscriber_import(ptr0, ptr1, len1, ptr2, len2);
        return Subscriber.__wrap(ret);
    }
    /**
    * @returns {Subscriber}
    */
    clone() {
        var ret = wasm.subscriber_clone(this.ptr);
        return Subscriber.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    channel_address() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_channel_address(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Client}
    */
    get_client() {
        var ret = wasm.subscriber_get_client(this.ptr);
        return Client.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    is_multi_branching() {
        var ret = wasm.subscriber_is_multi_branching(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {string} psk_seed_str
    * @returns {string}
    */
    store_psk(psk_seed_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(psk_seed_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.subscriber_store_psk(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    get_public_key() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_get_public_key(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    author_public_key() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_author_public_key(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {boolean}
    */
    is_registered() {
        var ret = wasm.subscriber_is_registered(this.ptr);
        return ret !== 0;
    }
    /**
    */
    unregister() {
        wasm.subscriber_unregister(this.ptr);
    }
    /**
    * @param {string} password
    * @returns {Uint8Array}
    */
    export(password) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.subscriber_export(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_announcement(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_receive_announcement(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_keyload(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_receive_keyload(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_tagged_packet(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_receive_tagged_packet(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_signed_packet(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_receive_signed_packet(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_sequence(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_receive_sequence(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_msg(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_receive_msg(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} anchor_link
    * @param {number} msg_num
    * @returns {any}
    */
    receive_msg_by_sequence_number(anchor_link, msg_num) {
        const ptr = this.__destroy_into_raw();
        _assertClass(anchor_link, Address);
        var ptr0 = anchor_link.ptr;
        anchor_link.ptr = 0;
        var ret = wasm.subscriber_receive_msg_by_sequence_number(ptr, ptr0, msg_num);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    send_subscribe(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_send_subscribe(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {any}
    */
    send_tagged_packet(link, public_payload, masked_payload) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.subscriber_send_tagged_packet(ptr, ptr0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {any}
    */
    send_signed_packet(link, public_payload, masked_payload) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.subscriber_send_signed_packet(ptr, ptr0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    sync_state() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.subscriber_sync_state(ptr);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    fetch_next_msgs() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.subscriber_fetch_next_msgs(ptr);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    fetch_prev_msg(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_fetch_prev_msg(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {number} num_msgs
    * @returns {any}
    */
    fetch_prev_msgs(link, num_msgs) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_fetch_prev_msgs(ptr, ptr0, num_msgs);
        return takeObject(ret);
    }
    /**
    * @returns {Array<any>}
    */
    fetch_state() {
        var ret = wasm.subscriber_fetch_state(this.ptr);
        return takeObject(ret);
    }
    /**
    */
    reset_state() {
        const ptr = this.__destroy_into_raw();
        wasm.subscriber_reset_state(ptr);
    }
}
/**
*/
export class UserResponse {

    static __wrap(ptr) {
        const obj = Object.create(UserResponse.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userresponse_free(ptr);
    }
    /**
    * @param {Address} link
    * @param {Address | undefined} seq_link
    * @param {Message | undefined} message
    * @returns {UserResponse}
    */
    static new(link, seq_link, message) {
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        let ptr1 = 0;
        if (!isLikeNone(seq_link)) {
            _assertClass(seq_link, Address);
            ptr1 = seq_link.ptr;
            seq_link.ptr = 0;
        }
        let ptr2 = 0;
        if (!isLikeNone(message)) {
            _assertClass(message, Message);
            ptr2 = message.ptr;
            message.ptr = 0;
        }
        var ret = wasm.userresponse_new(ptr0, ptr1, ptr2);
        return UserResponse.__wrap(ret);
    }
    /**
    * @param {string} link
    * @param {string | undefined} seq_link
    * @param {Message | undefined} message
    * @returns {UserResponse}
    */
    static from_strings(link, seq_link, message) {
        var ptr0 = passStringToWasm0(link, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(seq_link) ? 0 : passStringToWasm0(seq_link, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        let ptr2 = 0;
        if (!isLikeNone(message)) {
            _assertClass(message, Message);
            ptr2 = message.ptr;
            message.ptr = 0;
        }
        var ret = wasm.userresponse_from_strings(ptr0, len0, ptr1, len1, ptr2);
        return UserResponse.__wrap(ret);
    }
    /**
    * @returns {UserResponse}
    */
    copy() {
        var ret = wasm.userresponse_copy(this.ptr);
        return UserResponse.__wrap(ret);
    }
    /**
    * @returns {Address}
    */
    get_link() {
        var ret = wasm.userresponse_get_link(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @returns {Address}
    */
    get_seq_link() {
        var ret = wasm.userresponse_get_seq_link(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @returns {Message}
    */
    get_message() {
        var ret = wasm.userresponse_get_message(this.ptr);
        return Message.__wrap(ret);
    }
}
/**
*/
export class UserState {

    static __wrap(ptr) {
        const obj = Object.create(UserState.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userstate_free(ptr);
    }
    /**
    * @param {string} identifier
    * @param {Cursor} cursor
    * @returns {UserState}
    */
    static new(identifier, cursor) {
        var ptr0 = passStringToWasm0(identifier, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(cursor, Cursor);
        var ptr1 = cursor.ptr;
        cursor.ptr = 0;
        var ret = wasm.userstate_new(ptr0, len0, ptr1);
        return UserState.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get_identifier() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.userstate_get_identifier(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Address}
    */
    get_link() {
        var ret = wasm.userstate_get_link(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    get_seq_no() {
        var ret = wasm.userstate_get_seq_no(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    get_branch_no() {
        var ret = wasm.userstate_get_branch_no(this.ptr);
        return ret >>> 0;
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('iota_streams_wasm_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_ec75d0d5815be736 = function() {
        var ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_nextmsgid_new = function(arg0) {
        var ret = NextMsgId.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_0daae9343162dbe7 = function(arg0, arg1) {
        var ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_details_new = function(arg0) {
        var ret = Details.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_59cb74e423758ede = function() {
        var ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_558ba5917b466edd = function(arg0, arg1) {
        var ret = getObject(arg1).stack;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbg_new_4b48f9f8159fea77 = function() {
        var ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_e49c3a274bc45d18 = function() { return handleError(function () {
        var ret = new Headers();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_append_7734c0da36ddd25a = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_memory = function() {
        var ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_79a3294266d4e783 = function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_22a36e6023ad3cd0 = function(arg0, arg1, arg2) {
        var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_945397fb09fec0b8 = function(arg0) {
        var ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithstrandinit_99b3f2fe783c1e36 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_has_6beec53675bce86a = function() { return handleError(function (arg0, arg1) {
        var ret = Reflect.has(getObject(arg0), getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_fetch_cc7bc889c1fb3b00 = function(arg0, arg1) {
        var ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_fetch_d6391b3bc62838b4 = function(arg0) {
        var ret = fetch(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Response_4e568b2aa3949591 = function(arg0) {
        var ret = getObject(arg0) instanceof Response;
        return ret;
    };
    imports.wbg.__wbg_status_4dd3a1fab1979d66 = function(arg0) {
        var ret = getObject(arg0).status;
        return ret;
    };
    imports.wbg.__wbg_url_2d059327a0b2745e = function(arg0, arg1) {
        var ret = getObject(arg1).url;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_headers_5e4d6e0c9bbe130e = function(arg0) {
        var ret = getObject(arg0).headers;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_iterator_18e2d2132471e894 = function() {
        var ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_6d26c712aa73c8b2 = function() { return handleError(function (arg0, arg1) {
        var ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        var ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_call_e91f71ddf1f45cff = function() { return handleError(function (arg0, arg1) {
        var ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        var ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_next_a153d72ec9f76de7 = function(arg0) {
        var ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_json_serialize = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = JSON.stringify(obj === undefined ? null : obj);
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_text_3ccbde6db7bfd885 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).text();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_arrayBuffer_9c07533b14ac31e9 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_length_68e13e7bbd918464 = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new0_06175e996d76315f = function() {
        var ret = new Date();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getTime_223a3e3188667617 = function(arg0) {
        var ret = getObject(arg0).getTime();
        return ret;
    };
    imports.wbg.__wbg_userresponse_new = function(arg0) {
        var ret = UserResponse.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_address_new = function(arg0) {
        var ret = Address.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_119f8177d8717c43 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_209(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            var ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_userstate_new = function(arg0) {
        var ret = UserState.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        var ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_f6ffce741b18af05 = function() { return handleError(function (arg0) {
        var ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_done_1d79fc301127c139 = function(arg0) {
        var ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_4c025ad337ce3912 = function(arg0) {
        var ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_b4546ea7b590539e = function() { return handleError(function () {
        var ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_c279fea81f426a68 = function() { return handleError(function () {
        var ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_038a6ea0ff17789f = function() { return handleError(function () {
        var ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_4f93ce884bcee597 = function() { return handleError(function () {
        var ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        var ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_newnoargs_1a11e7e8c906996c = function(arg0, arg1) {
        var ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_e3c72355d091d5d4 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_223873223acf6d07 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_set_d29a397c9cc5d746 = function() { return handleError(function (arg0, arg1, arg2) {
        var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_self_86b4b13392c7af56 = function() { return handleError(function () {
        var ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_b8c92eaac23d0d80 = function(arg0) {
        var ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_msCrypto_9ad6677321a08dd8 = function(arg0) {
        var ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_MODULE_452b4680e8614c81 = function() {
        var ret = module;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_f5521a5b85ad2542 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_dd27e6b0652b3236 = function(arg0) {
        var ret = getObject(arg0).getRandomValues;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_b7722b5594f1dc21 = function(arg0) {
        var ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_d2ba53160aec6aba = function(arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_subarray_466613921b2fc6db = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_e57c9b75ddead065 = function(arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        var ret = debugString(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_rethrow = function(arg0) {
        throw takeObject(arg0);
    };
    imports.wbg.__wbg_then_6d5072fec3fdb237 = function(arg0, arg1) {
        var ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_4f3c7f6f3d36634a = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_resolve_7161ec6fd5b1cd29 = function(arg0) {
        var ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        var ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper4223 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 126, __wbg_adapter_30);
        return addHeapObject(ret);
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }



    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;

    return wasm;
}

export default init;

