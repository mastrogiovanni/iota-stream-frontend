
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init$1(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function make_seed(size) {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        let seed = "";
        for (var i = 9; i < size; i++) {
            seed += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
        return seed;
    }

    function to_bytes(str) {
        var bytes = new Uint8Array(str.length);
        for (var i = 0; i < str.length; ++i) {
            bytes[i] = str.charCodeAt(i);
        }
        return bytes;
    }

    function from_bytes(bytes) {
        var str = "";
        for (var i = 0; i < bytes.length; ++i) {
            str += String.fromCharCode(bytes[i]);
        }
        return str;
    }

    /* src/AuthorComponent.svelte generated by Svelte v3.42.4 */

    const { console: console_1$2 } = globals;
    const file$3 = "src/AuthorComponent.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (171:2) {#if status <= 1}
    function create_if_block_5(ctx) {
    	let button;
    	let t;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Announce");
    			button.disabled = button_disabled_value = !/*branchType*/ ctx[1];
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$3, 171, 2, 4429);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*announce*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*branchType, undefined*/ 2 && button_disabled_value !== (button_disabled_value = !/*branchType*/ ctx[1])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(171:2) {#if status <= 1}",
    		ctx
    	});

    	return block;
    }

    // (177:0) {#if status === 1}
    function create_if_block_4(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Loading...";
    			attr_dev(span, "class", "visually-hidden");
    			add_location(span, file$3, 178, 2, 4616);
    			attr_dev(div, "class", "spinner-grow");
    			attr_dev(div, "role", "status");
    			add_location(div, file$3, 177, 0, 4573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(177:0) {#if status === 1}",
    		ctx
    	});

    	return block;
    }

    // (183:0) {#if status >= 2}
    function create_if_block_2$1(ctx) {
    	let p;
    	let t1;
    	let form;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let small0;
    	let t6;
    	let div1;
    	let label1;
    	let t8;
    	let input1;
    	let input1_value_value;
    	let t9;
    	let small1;
    	let t11;
    	let mounted;
    	let dispose;
    	let if_block = /*status*/ ctx[5] <= 3 && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "This section is used to receive subscriptions";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Subscription";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			small0 = element("small");
    			small0.textContent = "Subscription is used to join a subscriber in the Author branch";
    			t6 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Keyload Link";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			small1 = element("small");
    			small1.textContent = "Here will be the keyload link";
    			t11 = space();
    			if (if_block) if_block.c();
    			add_location(p, file$3, 184, 0, 4697);
    			attr_dev(label0, "for", "subscription");
    			add_location(label0, file$3, 191, 4, 4794);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "subscription");
    			attr_dev(input0, "aria-describedby", "subscription");
    			add_location(input0, file$3, 192, 4, 4845);
    			attr_dev(small0, "id", "subscription");
    			attr_dev(small0, "class", "form-text text-muted");
    			add_location(small0, file$3, 199, 4, 5002);
    			attr_dev(div0, "class", "form-group");
    			add_location(div0, file$3, 190, 2, 4765);
    			attr_dev(label1, "for", "keyloadLink");
    			add_location(label1, file$3, 205, 4, 5180);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "keyloadLink");
    			attr_dev(input1, "aria-describedby", "keyloadLink");
    			input1.readOnly = true;
    			input1.value = input1_value_value = /*keyloadLink*/ ctx[4] ? /*keyloadLink*/ ctx[4] : "";
    			add_location(input1, file$3, 206, 4, 5230);
    			attr_dev(small1, "id", "keyloadLink");
    			attr_dev(small1, "class", "form-text text-muted");
    			add_location(small1, file$3, 214, 4, 5420);
    			attr_dev(div1, "class", "form-group");
    			add_location(div1, file$3, 204, 2, 5151);
    			add_location(form, file$3, 188, 0, 4755);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*subscription*/ ctx[3]);
    			append_dev(div0, t4);
    			append_dev(div0, small0);
    			append_dev(form, t6);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t8);
    			append_dev(div1, input1);
    			append_dev(div1, t9);
    			append_dev(div1, small1);
    			append_dev(form, t11);
    			if (if_block) if_block.m(form, null);

    			if (!mounted) {
    				dispose = listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subscription*/ 8 && input0.value !== /*subscription*/ ctx[3]) {
    				set_input_value(input0, /*subscription*/ ctx[3]);
    			}

    			if (dirty & /*keyloadLink*/ 16 && input1_value_value !== (input1_value_value = /*keyloadLink*/ ctx[4] ? /*keyloadLink*/ ctx[4] : "") && input1.value !== input1_value_value) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (/*status*/ ctx[5] <= 3) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$1(ctx);
    					if_block.c();
    					if_block.m(form, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(183:0) {#if status >= 2}",
    		ctx
    	});

    	return block;
    }

    // (220:2) {#if status <= 3}
    function create_if_block_3$1(ctx) {
    	let button;
    	let t;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Receive Subscription");
    			button.disabled = button_disabled_value = !/*subscription*/ ctx[3];
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$3, 220, 4, 5557);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*receiveSubscription*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subscription*/ 8 && button_disabled_value !== (button_disabled_value = !/*subscription*/ ctx[3])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(220:2) {#if status <= 3}",
    		ctx
    	});

    	return block;
    }

    // (227:0) {#if status === 3}
    function create_if_block_1$1(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Loading...";
    			attr_dev(span, "class", "visually-hidden");
    			add_location(span, file$3, 228, 2, 5775);
    			attr_dev(div, "class", "spinner-grow");
    			attr_dev(div, "role", "status");
    			add_location(div, file$3, 227, 0, 5732);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(227:0) {#if status === 3}",
    		ctx
    	});

    	return block;
    }

    // (233:0) {#if status >= 4}
    function create_if_block$1(ctx) {
    	let p;
    	let t1;
    	let form;
    	let div;
    	let span;
    	let t3;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t5;
    	let th1;
    	let t7;
    	let th2;
    	let t9;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*messages*/ ctx[6];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*message*/ ctx[16].ptr;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Fetching messages (poll every second)";
    			t1 = space();
    			form = element("form");
    			div = element("div");
    			span = element("span");
    			span.textContent = "Loading...";
    			t3 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "#";
    			t5 = space();
    			th1 = element("th");
    			th1.textContent = "Public";
    			t7 = space();
    			th2 = element("th");
    			th2.textContent = "Masked";
    			t9 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(p, file$3, 234, 0, 5856);
    			attr_dev(span, "class", "visually-hidden");
    			add_location(span, file$3, 241, 4, 5961);
    			attr_dev(div, "class", "spinner-grow");
    			attr_dev(div, "role", "status");
    			add_location(div, file$3, 240, 2, 5916);
    			attr_dev(th0, "scope", "col");
    			add_location(th0, file$3, 251, 8, 6185);
    			attr_dev(th1, "scope", "col");
    			add_location(th1, file$3, 252, 8, 6216);
    			attr_dev(th2, "scope", "col");
    			add_location(th2, file$3, 253, 8, 6252);
    			add_location(tr, file$3, 250, 6, 6172);
    			add_location(thead, file$3, 249, 4, 6158);
    			add_location(tbody, file$3, 256, 4, 6309);
    			attr_dev(table, "class", "table");
    			add_location(table, file$3, 248, 2, 6132);
    			add_location(form, file$3, 238, 0, 5906);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, div);
    			append_dev(div, span);
    			append_dev(form, t3);
    			append_dev(form, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t5);
    			append_dev(tr, th1);
    			append_dev(tr, t7);
    			append_dev(tr, th2);
    			append_dev(table, t9);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 64) {
    				each_value = /*messages*/ ctx[6];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(233:0) {#if status >= 4}",
    		ctx
    	});

    	return block;
    }

    // (259:6) {#each messages as message (message.ptr)}
    function create_each_block(key_1, ctx) {
    	let tr;
    	let th;
    	let t0_value = /*message*/ ctx[16].ptr + "";
    	let t0;
    	let t1;
    	let td0;
    	let t2_value = /*message*/ ctx[16].public + "";
    	let t2;
    	let t3;
    	let td1;
    	let t4_value = /*message*/ ctx[16].masked + "";
    	let t4;
    	let t5;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			td0 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td1 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(th, "scope", "row");
    			add_location(th, file$3, 261, 8, 6386);
    			add_location(td0, file$3, 262, 8, 6429);
    			add_location(td1, file$3, 263, 8, 6463);
    			add_location(tr, file$3, 260, 6, 6373);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(th, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td0);
    			append_dev(td0, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td1);
    			append_dev(td1, t4);
    			append_dev(tr, t5);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*messages*/ 64 && t0_value !== (t0_value = /*message*/ ctx[16].ptr + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*messages*/ 64 && t2_value !== (t2_value = /*message*/ ctx[16].public + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*messages*/ 64 && t4_value !== (t4_value = /*message*/ ctx[16].masked + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(259:6) {#each messages as message (message.ptr)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let h1;
    	let t1;
    	let form;
    	let div0;
    	let label0;
    	let t3;
    	let select;
    	let option0;
    	let t4;
    	let option1;
    	let option2;
    	let t7;
    	let div1;
    	let label1;
    	let t9;
    	let input0;
    	let input0_value_value;
    	let t10;
    	let small0;
    	let t12;
    	let div2;
    	let label2;
    	let t14;
    	let input1;
    	let input1_value_value;
    	let t15;
    	let small1;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let t21;
    	let if_block4_anchor;
    	let mounted;
    	let dispose;
    	let if_block0 = /*status*/ ctx[5] <= 1 && create_if_block_5(ctx);
    	let if_block1 = /*status*/ ctx[5] === 1 && create_if_block_4(ctx);
    	let if_block2 = /*status*/ ctx[5] >= 2 && create_if_block_2$1(ctx);
    	let if_block3 = /*status*/ ctx[5] === 3 && create_if_block_1$1(ctx);
    	let if_block4 = /*status*/ ctx[5] >= 4 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Author";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Branch Type";
    			t3 = space();
    			select = element("select");
    			option0 = element("option");
    			t4 = text("-");
    			option1 = element("option");
    			option1.textContent = "Single Branch";
    			option2 = element("option");
    			option2.textContent = "Multiple Branch";
    			t7 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Channel Address";
    			t9 = space();
    			input0 = element("input");
    			t10 = space();
    			small0 = element("small");
    			small0.textContent = "Unique channel address";
    			t12 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Announce Link";
    			t14 = space();
    			input1 = element("input");
    			t15 = space();
    			small1 = element("small");
    			small1.textContent = "Here will be the link to share with subscribers";
    			t17 = space();
    			if (if_block0) if_block0.c();
    			t18 = space();
    			if (if_block1) if_block1.c();
    			t19 = space();
    			if (if_block2) if_block2.c();
    			t20 = space();
    			if (if_block3) if_block3.c();
    			t21 = space();
    			if (if_block4) if_block4.c();
    			if_block4_anchor = empty();
    			add_location(h1, file$3, 111, 0, 2814);
    			attr_dev(label0, "for", "branch");
    			add_location(label0, file$3, 115, 4, 2869);
    			option0.__value = undefined;
    			option0.value = option0.__value;
    			option0.selected = true;
    			add_location(option0, file$3, 117, 6, 3009);
    			option1.__value = "1";
    			option1.value = option1.__value;
    			add_location(option1, file$3, 118, 6, 3061);
    			option2.__value = "2";
    			option2.value = option2.__value;
    			add_location(option2, file$3, 119, 6, 3108);
    			attr_dev(select, "id", "branch");
    			attr_dev(select, "class", "form-select");
    			attr_dev(select, "aria-label", "Branch Type");
    			if (/*branchType*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[10].call(select));
    			add_location(select, file$3, 116, 4, 2913);
    			attr_dev(div0, "class", "form-group");
    			add_location(div0, file$3, 114, 2, 2840);
    			attr_dev(label1, "for", "channelAddress");
    			add_location(label1, file$3, 124, 4, 3206);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "channelAddress");
    			attr_dev(input0, "aria-describedby", "channelAddress");
    			input0.readOnly = true;

    			input0.value = input0_value_value = /*channelAddress*/ ctx[0]
    			? /*channelAddress*/ ctx[0]
    			: "";

    			add_location(input0, file$3, 125, 4, 3262);
    			attr_dev(small0, "id", "channelAddress");
    			attr_dev(small0, "class", "form-text text-muted");
    			add_location(small0, file$3, 133, 4, 3464);
    			attr_dev(div1, "class", "form-group");
    			add_location(div1, file$3, 123, 2, 3177);
    			attr_dev(label2, "for", "announceLink");
    			add_location(label2, file$3, 139, 4, 3604);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "announceLink");
    			attr_dev(input1, "aria-describedby", "announceLink");
    			input1.readOnly = true;
    			input1.value = input1_value_value = /*announceLink*/ ctx[2] ? /*announceLink*/ ctx[2] : "";
    			add_location(input1, file$3, 140, 4, 3656);
    			attr_dev(small1, "id", "announceLink");
    			attr_dev(small1, "class", "form-text text-muted");
    			add_location(small1, file$3, 148, 4, 3850);
    			attr_dev(div2, "class", "form-group");
    			add_location(div2, file$3, 138, 2, 3575);
    			add_location(form, file$3, 113, 0, 2831);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, select);
    			append_dev(select, option0);
    			append_dev(option0, t4);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*branchType*/ ctx[1]);
    			append_dev(form, t7);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t9);
    			append_dev(div1, input0);
    			append_dev(div1, t10);
    			append_dev(div1, small0);
    			append_dev(form, t12);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t14);
    			append_dev(div2, input1);
    			append_dev(div2, t15);
    			append_dev(div2, small1);
    			append_dev(form, t17);
    			if (if_block0) if_block0.m(form, null);
    			insert_dev(target, t18, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t19, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t20, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t21, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, if_block4_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*branchType, undefined*/ 2) {
    				select_option(select, /*branchType*/ ctx[1]);
    			}

    			if (dirty & /*channelAddress*/ 1 && input0_value_value !== (input0_value_value = /*channelAddress*/ ctx[0]
    			? /*channelAddress*/ ctx[0]
    			: "") && input0.value !== input0_value_value) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (dirty & /*announceLink*/ 4 && input1_value_value !== (input1_value_value = /*announceLink*/ ctx[2] ? /*announceLink*/ ctx[2] : "") && input1.value !== input1_value_value) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (/*status*/ ctx[5] <= 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(form, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*status*/ ctx[5] === 1) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(t19.parentNode, t19);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*status*/ ctx[5] >= 2) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$1(ctx);
    					if_block2.c();
    					if_block2.m(t20.parentNode, t20);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*status*/ ctx[5] === 3) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_1$1(ctx);
    					if_block3.c();
    					if_block3.m(t21.parentNode, t21);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*status*/ ctx[5] >= 4) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block$1(ctx);
    					if_block4.c();
    					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t18);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t19);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t20);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t21);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(if_block4_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AuthorComponent', slots, []);
    	let { streams } = $$props;
    	let seed;
    	let auth;
    	let channelAddress;
    	let branchType;
    	let announceLink;
    	let announceMessageId;
    	let subscription;
    	let keyloadLink;

    	// IDLE = 0
    	// LOADING = 1
    	// LOADED = 2
    	let status = 0;

    	let messages = [];

    	onMount(() => {
    		seed = make_seed(81);
    	});

    	async function announce() {
    		$$invalidate(5, status = 1);
    		let node = "http://localhost:14265/";
    		let options = new streams.SendOptions(node, true);
    		auth = new streams.Author(seed, options.clone(), streams.ChannelType.SingleBranch);
    		console.log("channel address: ", auth.channel_address());
    		$$invalidate(0, channelAddress = auth.channel_address());
    		console.log("multi branching: ", auth.is_multi_branching());
    		let response = await auth.clone().send_announce();
    		let ann_link = response.get_link();
    		console.log("announced at: ", ann_link.to_string());
    		$$invalidate(2, announceLink = ann_link.to_string());
    		let details = await auth.clone().get_client().get_link_details(ann_link.copy());
    		console.log("Announce message id: " + details.get_metadata().message_id);
    		announceMessageId = details.get_metadata().message_id;
    		$$invalidate(5, status = 2);
    	}

    	async function receiveSubscription() {
    		$$invalidate(5, status = 3);
    		await auth.clone().receive_subscribe(streams.Address.from_string(subscription));
    		console.log("Subscription processed");
    		console.log("Sending Keyload");
    		let response = await auth.clone().send_keyload_for_everyone(streams.Address.from_string(announceLink));
    		let keyload_link = response.get_link();
    		console.log("Keyload message at: ", keyload_link.to_string());
    		$$invalidate(4, keyloadLink = keyload_link.to_string());
    		$$invalidate(5, status = 4);
    		setInterval(fetchMessages, 1000);
    	}

    	async function fetchMessages() {
    		console.log("\nAuthor fetching next messages");
    		let exists = true;

    		while (exists) {
    			let next_msgs = await auth.clone().fetch_next_msgs();

    			if (next_msgs.length === 0) {
    				exists = false;
    			}

    			for (var i = 0; i < next_msgs.length; i++) {
    				let _publicPayload = from_bytes(next_msgs[i].get_message().get_public_payload());
    				let _maskedPayload = from_bytes(next_msgs[i].get_message().get_masked_payload());
    				console.log("Found a message...");
    				console.log(JSON.stringify(next_msgs[i].get_message(), null, 2));
    				console.log("Public: ", _publicPayload, "\tMasked: ", _maskedPayload);

    				messages.push({
    					public: _publicPayload,
    					masked: _maskedPayload,
    					ptr: next_msgs[i].get_message().ptr
    				});

    				$$invalidate(6, messages);
    			}
    		}
    	}

    	const writable_props = ['streams'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<AuthorComponent> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		branchType = select_value(this);
    		$$invalidate(1, branchType);
    	}

    	function input0_input_handler() {
    		subscription = this.value;
    		$$invalidate(3, subscription);
    	}

    	$$self.$$set = $$props => {
    		if ('streams' in $$props) $$invalidate(9, streams = $$props.streams);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		from_bytes,
    		make_seed,
    		streams,
    		seed,
    		auth,
    		channelAddress,
    		branchType,
    		announceLink,
    		announceMessageId,
    		subscription,
    		keyloadLink,
    		status,
    		messages,
    		announce,
    		receiveSubscription,
    		fetchMessages
    	});

    	$$self.$inject_state = $$props => {
    		if ('streams' in $$props) $$invalidate(9, streams = $$props.streams);
    		if ('seed' in $$props) seed = $$props.seed;
    		if ('auth' in $$props) auth = $$props.auth;
    		if ('channelAddress' in $$props) $$invalidate(0, channelAddress = $$props.channelAddress);
    		if ('branchType' in $$props) $$invalidate(1, branchType = $$props.branchType);
    		if ('announceLink' in $$props) $$invalidate(2, announceLink = $$props.announceLink);
    		if ('announceMessageId' in $$props) announceMessageId = $$props.announceMessageId;
    		if ('subscription' in $$props) $$invalidate(3, subscription = $$props.subscription);
    		if ('keyloadLink' in $$props) $$invalidate(4, keyloadLink = $$props.keyloadLink);
    		if ('status' in $$props) $$invalidate(5, status = $$props.status);
    		if ('messages' in $$props) $$invalidate(6, messages = $$props.messages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		channelAddress,
    		branchType,
    		announceLink,
    		subscription,
    		keyloadLink,
    		status,
    		messages,
    		announce,
    		receiveSubscription,
    		streams,
    		select_change_handler,
    		input0_input_handler
    	];
    }

    class AuthorComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$3, create_fragment$3, safe_not_equal, { streams: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AuthorComponent",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*streams*/ ctx[9] === undefined && !('streams' in props)) {
    			console_1$2.warn("<AuthorComponent> was created without expected prop 'streams'");
    		}
    	}

    	get streams() {
    		throw new Error("<AuthorComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set streams(value) {
    		throw new Error("<AuthorComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Splitter.svelte generated by Svelte v3.42.4 */

    const file$2 = "src/Splitter.svelte";
    const get_right_slot_changes = dirty => ({});
    const get_right_slot_context = ctx => ({});
    const get_left_slot_changes = dirty => ({});
    const get_left_slot_context = ctx => ({});

    function create_fragment$2(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let current;
    	const left_slot_template = /*#slots*/ ctx[1].left;
    	const left_slot = create_slot(left_slot_template, ctx, /*$$scope*/ ctx[0], get_left_slot_context);
    	const right_slot_template = /*#slots*/ ctx[1].right;
    	const right_slot = create_slot(right_slot_template, ctx, /*$$scope*/ ctx[0], get_right_slot_context);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			if (left_slot) left_slot.c();
    			t = space();
    			div1 = element("div");
    			if (right_slot) right_slot.c();
    			attr_dev(div0, "class", "col-sm");
    			add_location(div0, file$2, 2, 6, 52);
    			attr_dev(div1, "class", "col-sm");
    			add_location(div1, file$2, 5, 6, 128);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$2, 1, 4, 28);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (left_slot) {
    				left_slot.m(div0, null);
    			}

    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (right_slot) {
    				right_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (left_slot) {
    				if (left_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						left_slot,
    						left_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(left_slot_template, /*$$scope*/ ctx[0], dirty, get_left_slot_changes),
    						get_left_slot_context
    					);
    				}
    			}

    			if (right_slot) {
    				if (right_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						right_slot,
    						right_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(right_slot_template, /*$$scope*/ ctx[0], dirty, get_right_slot_changes),
    						get_right_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(left_slot, local);
    			transition_in(right_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(left_slot, local);
    			transition_out(right_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (left_slot) left_slot.d(detaching);
    			if (right_slot) right_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Splitter', slots, ['left','right']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Splitter> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Splitter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Splitter",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/SubscriberComponent.svelte generated by Svelte v3.42.4 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/SubscriberComponent.svelte";

    // (145:2) {#if status < 2}
    function create_if_block_3(ctx) {
    	let button;
    	let t;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Receive Announce");
    			button.disabled = button_disabled_value = !/*announceLink*/ ctx[0];
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$1, 145, 4, 3440);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*receiveAnnounce*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*announceLink*/ 1 && button_disabled_value !== (button_disabled_value = !/*announceLink*/ ctx[0])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(145:2) {#if status < 2}",
    		ctx
    	});

    	return block;
    }

    // (151:0) {#if status === 1}
    function create_if_block_2(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Loading...";
    			attr_dev(span, "class", "visually-hidden");
    			add_location(span, file$1, 152, 2, 3644);
    			attr_dev(div, "class", "spinner-grow");
    			attr_dev(div, "role", "status");
    			add_location(div, file$1, 151, 0, 3601);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(151:0) {#if status === 1}",
    		ctx
    	});

    	return block;
    }

    // (157:0) {#if status >= 2}
    function create_if_block(ctx) {
    	let p;
    	let t1;
    	let form;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let small0;
    	let t6;
    	let div1;
    	let label1;
    	let t8;
    	let input1;
    	let t9;
    	let small1;
    	let t11;
    	let div2;
    	let label2;
    	let t13;
    	let input2;
    	let t14;
    	let small2;
    	let t16;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*sending*/ ctx[6]) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Click Here to synchronize state and send some messages";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Keyload Link";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			small0 = element("small");
    			small0.textContent = "Keyload link: used to send/receive messages";
    			t6 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Masked Payload";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			small1 = element("small");
    			small1.textContent = "Masked payload";
    			t11 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Public Payload";
    			t13 = space();
    			input2 = element("input");
    			t14 = space();
    			small2 = element("small");
    			small2.textContent = "Public payload";
    			t16 = space();
    			if_block.c();
    			add_location(p, file$1, 158, 0, 3725);
    			attr_dev(label0, "for", "keyloadLink");
    			add_location(label0, file$1, 163, 4, 3827);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "keyloadLink");
    			attr_dev(input0, "aria-describedby", "keyloadLink");
    			add_location(input0, file$1, 164, 4, 3877);
    			attr_dev(small0, "id", "keyloadLink");
    			attr_dev(small0, "class", "form-text text-muted");
    			add_location(small0, file$1, 171, 4, 4031);
    			attr_dev(div0, "class", "form-group");
    			add_location(div0, file$1, 162, 2, 3798);
    			attr_dev(label1, "for", "maskedPayload");
    			add_location(label1, file$1, 177, 4, 4189);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "maskedPayload");
    			attr_dev(input1, "aria-describedby", "maskedPayload");
    			add_location(input1, file$1, 178, 4, 4243);
    			attr_dev(small1, "id", "maskedPayload");
    			attr_dev(small1, "class", "form-text text-muted");
    			add_location(small1, file$1, 185, 4, 4403);
    			attr_dev(div1, "class", "form-group");
    			add_location(div1, file$1, 176, 2, 4160);
    			attr_dev(label2, "for", "publicPayload");
    			add_location(label2, file$1, 191, 4, 4534);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "id", "publicPayload");
    			attr_dev(input2, "aria-describedby", "publicPayload");
    			add_location(input2, file$1, 192, 4, 4588);
    			attr_dev(small2, "id", "publicPayload");
    			attr_dev(small2, "class", "form-text text-muted");
    			add_location(small2, file$1, 199, 4, 4748);
    			attr_dev(div2, "class", "form-group");
    			add_location(div2, file$1, 190, 2, 4505);
    			add_location(form, file$1, 160, 0, 3788);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*keyloadLink*/ ctx[2]);
    			append_dev(div0, t4);
    			append_dev(div0, small0);
    			append_dev(form, t6);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t8);
    			append_dev(div1, input1);
    			set_input_value(input1, /*maskedPayload*/ ctx[4]);
    			append_dev(div1, t9);
    			append_dev(div1, small1);
    			append_dev(form, t11);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t13);
    			append_dev(div2, input2);
    			set_input_value(input2, /*publicPayload*/ ctx[3]);
    			append_dev(div2, t14);
    			append_dev(div2, small2);
    			append_dev(form, t16);
    			if_block.m(form, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[11]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[13])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*keyloadLink*/ 4 && input0.value !== /*keyloadLink*/ ctx[2]) {
    				set_input_value(input0, /*keyloadLink*/ ctx[2]);
    			}

    			if (dirty & /*maskedPayload*/ 16 && input1.value !== /*maskedPayload*/ ctx[4]) {
    				set_input_value(input1, /*maskedPayload*/ ctx[4]);
    			}

    			if (dirty & /*publicPayload*/ 8 && input2.value !== /*publicPayload*/ ctx[3]) {
    				set_input_value(input2, /*publicPayload*/ ctx[3]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(form, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(157:0) {#if status >= 2}",
    		ctx
    	});

    	return block;
    }

    // (207:2) {:else}
    function create_else_block(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Loading...";
    			attr_dev(span, "class", "visually-hidden");
    			add_location(span, file$1, 208, 6, 5043);
    			attr_dev(div, "class", "spinner-grow");
    			attr_dev(div, "role", "status");
    			add_location(div, file$1, 207, 4, 4996);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(207:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (205:2) {#if !sending}
    function create_if_block_1(ctx) {
    	let button;
    	let t;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Send Message");
    			button.disabled = button_disabled_value = !/*keyloadLink*/ ctx[2];
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$1, 205, 4, 4869);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*syncState*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*keyloadLink*/ 4 && button_disabled_value !== (button_disabled_value = !/*keyloadLink*/ ctx[2])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(205:2) {#if !sending}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h1;
    	let t1;
    	let form;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let small0;
    	let t6;
    	let div1;
    	let label1;
    	let t8;
    	let input1;
    	let input1_value_value;
    	let t9;
    	let small1;
    	let t11;
    	let t12;
    	let t13;
    	let if_block2_anchor;
    	let mounted;
    	let dispose;
    	let if_block0 = /*status*/ ctx[5] < 2 && create_if_block_3(ctx);
    	let if_block1 = /*status*/ ctx[5] === 1 && create_if_block_2(ctx);
    	let if_block2 = /*status*/ ctx[5] >= 2 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Subscriber";
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Announce Link";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			small0 = element("small");
    			small0.textContent = "Link to receive from Author in order to join the channel";
    			t6 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Subscription Message";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			small1 = element("small");
    			small1.textContent = "Subscription Message";
    			t11 = space();
    			if (if_block0) if_block0.c();
    			t12 = space();
    			if (if_block1) if_block1.c();
    			t13 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			add_location(h1, file$1, 94, 0, 2152);
    			attr_dev(label0, "for", "announceLink");
    			add_location(label0, file$1, 98, 4, 2211);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "announceLink");
    			attr_dev(input0, "aria-describedby", "announceLink");
    			add_location(input0, file$1, 99, 4, 2263);
    			attr_dev(small0, "id", "announceLink");
    			attr_dev(small0, "class", "form-text text-muted");
    			add_location(small0, file$1, 106, 4, 2420);
    			attr_dev(div0, "class", "form-group");
    			add_location(div0, file$1, 97, 2, 2182);
    			attr_dev(label1, "for", "subscriptionMessage");
    			add_location(label1, file$1, 112, 4, 2592);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "subscriptionMessage");
    			attr_dev(input1, "aria-describedby", "subscriptionMessage");
    			input1.readOnly = true;

    			input1.value = input1_value_value = /*subscriptionMessage*/ ctx[1]
    			? /*subscriptionMessage*/ ctx[1]
    			: "";

    			add_location(input1, file$1, 113, 4, 2658);
    			attr_dev(small1, "id", "channelAddress");
    			attr_dev(small1, "class", "form-text text-muted");
    			add_location(small1, file$1, 121, 4, 2880);
    			attr_dev(div1, "class", "form-group");
    			add_location(div1, file$1, 111, 2, 2563);
    			add_location(form, file$1, 96, 0, 2173);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*announceLink*/ ctx[0]);
    			append_dev(div0, t4);
    			append_dev(div0, small0);
    			append_dev(form, t6);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t8);
    			append_dev(div1, input1);
    			append_dev(div1, t9);
    			append_dev(div1, small1);
    			append_dev(form, t11);
    			if (if_block0) if_block0.m(form, null);
    			insert_dev(target, t12, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t13, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*announceLink*/ 1 && input0.value !== /*announceLink*/ ctx[0]) {
    				set_input_value(input0, /*announceLink*/ ctx[0]);
    			}

    			if (dirty & /*subscriptionMessage*/ 2 && input1_value_value !== (input1_value_value = /*subscriptionMessage*/ ctx[1]
    			? /*subscriptionMessage*/ ctx[1]
    			: "") && input1.value !== input1_value_value) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (/*status*/ ctx[5] < 2) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(form, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*status*/ ctx[5] === 1) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(t13.parentNode, t13);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*status*/ ctx[5] >= 2) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t12);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t13);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SubscriberComponent', slots, []);
    	let { streams } = $$props;
    	let seed2;
    	let sub;
    	let announceLink;
    	let subscriptionMessage;
    	let startState;
    	let keyloadLink;
    	let publicPayload;
    	let maskedPayload;

    	// IDLE = 0
    	// LOADING = 1
    	// LOADED = 2
    	let status = 0;

    	onMount(() => {
    		seed2 = make_seed(81);
    	});

    	async function receiveAnnounce() {
    		$$invalidate(5, status = 1);
    		let node = "http://localhost:14265/";
    		let options = new streams.SendOptions(node, true);
    		sub = new streams.Subscriber(seed2, options.clone());
    		await sub.clone().receive_announcement(streams.Address.from_string(announceLink));

    		// copy state for comparison after reset later
    		startState = sub.fetch_state();

    		console.log(startState);
    		console.log("Subscribing...");
    		let response = await sub.clone().send_subscribe(streams.Address.from_string(announceLink));
    		let sub_link = response.get_link();
    		console.log("Subscription message at: ", sub_link.to_string());
    		$$invalidate(1, subscriptionMessage = sub_link.to_string());
    		$$invalidate(5, status = 2);
    	}

    	let sending = false;

    	async function syncState() {
    		if (status === 2) {
    			console.log("Subscriber syncing...");
    			await sub.clone().sync_state();
    			$$invalidate(5, status = 3);
    		}

    		$$invalidate(6, sending = true);
    		let public_payload = to_bytes(publicPayload);
    		let masked_payload = to_bytes(maskedPayload);
    		console.log("Subscriber Sending tagged packet");
    		let response = await sub.clone().send_tagged_packet(streams.Address.from_string(keyloadLink), public_payload, masked_payload);
    		let tag_link = response.get_link();
    		console.log("Tag packet at: ", tag_link.to_string());
    		$$invalidate(6, sending = false);
    	} /*
    let last_link = tag_link;
    console.log("Subscriber Sending multiple signed packets");

    for (var x = 0; x < 10; x++) {
        response = await sub
            .clone()
            .send_signed_packet(last_link, public_payload, masked_payload);
        last_link = response.get_link();
        console.log("Signed packet at: ", last_link.to_string());
    }
    */

    	const writable_props = ['streams'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<SubscriberComponent> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		announceLink = this.value;
    		$$invalidate(0, announceLink);
    	}

    	function input0_input_handler_1() {
    		keyloadLink = this.value;
    		$$invalidate(2, keyloadLink);
    	}

    	function input1_input_handler() {
    		maskedPayload = this.value;
    		$$invalidate(4, maskedPayload);
    	}

    	function input2_input_handler() {
    		publicPayload = this.value;
    		$$invalidate(3, publicPayload);
    	}

    	$$self.$$set = $$props => {
    		if ('streams' in $$props) $$invalidate(9, streams = $$props.streams);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		make_seed,
    		to_bytes,
    		streams,
    		seed2,
    		sub,
    		announceLink,
    		subscriptionMessage,
    		startState,
    		keyloadLink,
    		publicPayload,
    		maskedPayload,
    		status,
    		receiveAnnounce,
    		sending,
    		syncState
    	});

    	$$self.$inject_state = $$props => {
    		if ('streams' in $$props) $$invalidate(9, streams = $$props.streams);
    		if ('seed2' in $$props) seed2 = $$props.seed2;
    		if ('sub' in $$props) sub = $$props.sub;
    		if ('announceLink' in $$props) $$invalidate(0, announceLink = $$props.announceLink);
    		if ('subscriptionMessage' in $$props) $$invalidate(1, subscriptionMessage = $$props.subscriptionMessage);
    		if ('startState' in $$props) startState = $$props.startState;
    		if ('keyloadLink' in $$props) $$invalidate(2, keyloadLink = $$props.keyloadLink);
    		if ('publicPayload' in $$props) $$invalidate(3, publicPayload = $$props.publicPayload);
    		if ('maskedPayload' in $$props) $$invalidate(4, maskedPayload = $$props.maskedPayload);
    		if ('status' in $$props) $$invalidate(5, status = $$props.status);
    		if ('sending' in $$props) $$invalidate(6, sending = $$props.sending);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		announceLink,
    		subscriptionMessage,
    		keyloadLink,
    		publicPayload,
    		maskedPayload,
    		status,
    		sending,
    		receiveAnnounce,
    		syncState,
    		streams,
    		input0_input_handler,
    		input0_input_handler_1,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class SubscriberComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$1, create_fragment$1, safe_not_equal, { streams: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SubscriberComponent",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*streams*/ ctx[9] === undefined && !('streams' in props)) {
    			console_1$1.warn("<SubscriberComponent> was created without expected prop 'streams'");
    		}
    	}

    	get streams() {
    		throw new Error("<SubscriberComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set streams(value) {
    		throw new Error("<SubscriberComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

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
    function set_panic_hook() {
        wasm.set_panic_hook();
    }

    function __wbg_adapter_209(arg0, arg1, arg2, arg3) {
        wasm.wasm_bindgen__convert__closures__invoke2_mut__h85ebf086f28a5177(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
    }

    /**
    */
    const ChannelType = Object.freeze({ SingleBranch:0,"0":"SingleBranch",MultiBranch:1,"1":"MultiBranch",SingleDepth:2,"2":"SingleDepth", });
    /**
    */
    const LedgerInclusionState = Object.freeze({ Conflicting:0,"0":"Conflicting",Included:1,"1":"Included",NoTransaction:2,"2":"NoTransaction", });
    /**
    */
    class Address {

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
    class Author {

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
    class Client {

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
    class Cursor {

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
    class Details {

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
    class Message {

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
    class MessageMetadata {

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
    class MilestoneResponse {

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
    class NextMsgId {

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
    class PskIds {

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
    class PublicKeys {

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
    class SendOptions {

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
    class Subscriber {

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
    class UserResponse {

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
    class UserState {

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
            input = new URL('iota_streams_wasm_bg.wasm', (document.currentScript && document.currentScript.src || new URL('bundle.js', document.baseURI).href));
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

    var streams = /*#__PURE__*/Object.freeze({
        __proto__: null,
        set_panic_hook: set_panic_hook,
        ChannelType: ChannelType,
        LedgerInclusionState: LedgerInclusionState,
        Address: Address,
        Author: Author,
        Client: Client,
        Cursor: Cursor,
        Details: Details,
        Message: Message,
        MessageMetadata: MessageMetadata,
        MilestoneResponse: MilestoneResponse,
        NextMsgId: NextMsgId,
        PskIds: PskIds,
        PublicKeys: PublicKeys,
        SendOptions: SendOptions,
        Subscriber: Subscriber,
        UserResponse: UserResponse,
        UserState: UserState,
        'default': init
    });

    /* src/App.svelte generated by Svelte v3.42.4 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (178:2) 
    function create_left_slot(ctx) {
    	let div;
    	let authorcomponent;
    	let current;
    	authorcomponent = new AuthorComponent({ props: { streams }, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(authorcomponent.$$.fragment);
    			attr_dev(div, "slot", "left");
    			add_location(div, file, 177, 2, 7102);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(authorcomponent, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(authorcomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(authorcomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(authorcomponent);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_left_slot.name,
    		type: "slot",
    		source: "(178:2) ",
    		ctx
    	});

    	return block;
    }

    // (181:2) 
    function create_right_slot(ctx) {
    	let div;
    	let subscribercomponent;
    	let current;
    	subscribercomponent = new SubscriberComponent({ props: { streams }, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(subscribercomponent.$$.fragment);
    			attr_dev(div, "slot", "right");
    			add_location(div, file, 180, 2, 7181);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(subscribercomponent, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subscribercomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subscribercomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(subscribercomponent);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_right_slot.name,
    		type: "slot",
    		source: "(181:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let splitter;
    	let current;

    	splitter = new Splitter({
    			props: {
    				$$slots: {
    					right: [create_right_slot],
    					left: [create_left_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(splitter.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(splitter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const splitter_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				splitter_changes.$$scope = { dirty, ctx };
    			}

    			splitter.$set(splitter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(splitter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(splitter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(splitter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	let { name } = $$props;

    	// new URL('iota_streams_wasm_bg.wasm', import.meta.url);
    	init("/web/iota_streams_wasm_bg.wasm").then(s => {
    		console.log("Streams loaded!");
    	}); // streams = s;
    	// console.log(s)

    	function test() {
    		return __awaiter(this, void 0, void 0, function* () {
    			// Default is a load balancer, if you have your own node it's recommended to use that instead
    			let node = "http://localhost:14265/";

    			let options = new SendOptions(node, true);
    			let seed = make_seed(81);
    			let auth = new Author(seed, options.clone(), ChannelType.SingleBranch);
    			console.log("channel address: ", auth.channel_address());
    			console.log("multi branching: ", auth.is_multi_branching());
    			let response = yield auth.clone().send_announce();
    			let ann_link = response.get_link();
    			console.log("announced at: ", ann_link.to_string());
    			let details = yield auth.clone().get_client().get_link_details(ann_link.copy());
    			console.log("Announce message id: " + details.get_metadata().message_id);

    			// ---
    			let seed2 = make_seed(81);

    			let sub = new Subscriber(seed2, options.clone());
    			let ann_link_copy = ann_link.copy();
    			yield sub.clone().receive_announcement(ann_link_copy);

    			// copy state for comparison after reset later
    			let start_state = sub.fetch_state();

    			console.log("Subscribing...");
    			ann_link_copy = ann_link.copy();
    			response = yield sub.clone().send_subscribe(ann_link_copy);
    			let sub_link = response.get_link();
    			console.log("Subscription message at: ", sub_link.to_string());
    			yield auth.clone().receive_subscribe(sub_link);
    			console.log("Subscription processed");
    			console.log("Sending Keyload");
    			response = yield auth.clone().send_keyload_for_everyone(ann_link);
    			let keyload_link = response.get_link();
    			console.log("Keyload message at: ", keyload_link.to_string());
    			console.log("Subscriber syncing...");
    			yield sub.clone().sync_state();
    			let public_payload = to_bytes("Public");
    			let masked_payload = to_bytes("Masked");
    			console.log("Subscriber Sending tagged packet");
    			response = yield sub.clone().send_tagged_packet(keyload_link, public_payload, masked_payload);
    			let tag_link = response.get_link();
    			console.log("Tag packet at: ", tag_link.to_string());
    			let last_link = tag_link;
    			console.log("Subscriber Sending multiple signed packets");

    			for (var x = 0; x < 10; x++) {
    				response = yield sub.clone().send_signed_packet(last_link, public_payload, masked_payload);
    				last_link = response.get_link();
    				console.log("Signed packet at: ", last_link.to_string());
    			}

    			console.log("\nAuthor fetching next messages");
    			let exists = true;

    			while (exists) {
    				let next_msgs = yield auth.clone().fetch_next_msgs();

    				if (next_msgs.length === 0) {
    					exists = false;
    				}

    				for (var i = 0; i < next_msgs.length; i++) {
    					console.log("Found a message...");
    					console.log("Public: ", from_bytes(next_msgs[i].get_message().get_public_payload()), "\tMasked: ", from_bytes(next_msgs[i].get_message().get_masked_payload()));
    				}
    			}

    			console.log("\nSubscriber resetting state");
    			sub.clone().reset_state();
    			let reset_state = sub.fetch_state();
    			var matches = true;

    			for (var i = 0; i < reset_state.length; i++) {
    				if (start_state[i].get_link().to_string() != reset_state[i].get_link().to_string() || start_state[i].get_seq_no() != reset_state[i].get_seq_no() || start_state[i].get_branch_no() != reset_state[i].get_branch_no()) {
    					matches = false;
    				}
    			}

    			if (matches) {
    				console.log("States match");
    			} else {
    				console.log("States do not match");
    			}

    			console.log("\nAuthor fetching prev messages");
    			let prev_msgs = yield auth.clone().fetch_prev_msgs(last_link, 3);

    			for (var j = 0; j < prev_msgs.length; j++) {
    				console.log("Found a message at ", prev_msgs[j].get_link().to_string());
    			}

    			// Import export example
    			// TODO: Use stronghold
    			let password = "password";

    			let exp = auth.clone().export(password);
    			let client = new Client(node, options.clone());
    			let auth2 = Author.import(client, exp, password);

    			if (auth2.channel_address !== auth.channel_address) {
    				console.log("import failed");
    			} else {
    				console.log("import succesfull");
    			}

    			function to_bytes(str) {
    				var bytes = new Uint8Array(str.length);

    				for (var i = 0; i < str.length; ++i) {
    					bytes[i] = str.charCodeAt(i);
    				}

    				return bytes;
    			}

    			function from_bytes(bytes) {
    				var str = "";

    				for (var i = 0; i < bytes.length; ++i) {
    					str += String.fromCharCode(bytes[i]);
    				}

    				return str;
    			}

    			function make_seed(size) {
    				const alphabet = "abcdefghijklmnopqrstuvwxyz";
    				let seed = "";

    				for (var i = 9; i < size; i++) {
    					seed += alphabet[Math.floor(Math.random() * alphabet.length)];
    				}

    				return seed;
    			}
    		});
    	}

    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		AuthorComponent,
    		Splitter,
    		SubscriberComponent,
    		name,
    		streams,
    		test
    	});

    	$$self.$inject_state = $$props => {
    		if ('__awaiter' in $$props) __awaiter = $$props.__awaiter;
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console_1.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
