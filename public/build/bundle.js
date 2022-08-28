
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
        else if (callback) {
            callback();
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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

    /* src\components\CeoWords.svelte generated by Svelte v3.49.0 */

    const file$6 = "src\\components\\CeoWords.svelte";

    function create_fragment$7(ctx) {
    	let section;
    	let div6;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div5;
    	let div4;
    	let div1;
    	let span0;
    	let t2;
    	let div2;
    	let span1;
    	let em;
    	let t4;
    	let div3;
    	let span2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div6 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "PALAVRA DO CEO";
    			t2 = space();
    			div2 = element("div");
    			span1 = element("span");
    			em = element("em");
    			em.textContent = "Carlos Curioni";
    			t4 = space();
    			div3 = element("div");
    			span2 = element("span");
    			span2.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    			if (!src_url_equal(img.src, img_src_value = "assets/placeholder-video.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Ceo Photo");
    			add_location(img, file$6, 56, 12, 1293);
    			attr_dev(div0, "class", "ceo-words-photo svelte-q4sqx7");
    			add_location(div0, file$6, 55, 8, 1250);
    			add_location(span0, file$6, 61, 20, 1530);
    			attr_dev(div1, "class", "ceo-words-info-title svelte-q4sqx7");
    			add_location(div1, file$6, 60, 16, 1474);
    			add_location(em, file$6, 64, 26, 1664);
    			add_location(span1, file$6, 64, 20, 1658);
    			attr_dev(div2, "class", "ceo-words-info-subtitle svelte-q4sqx7");
    			add_location(div2, file$6, 63, 16, 1599);
    			add_location(span2, file$6, 67, 20, 1791);
    			attr_dev(div3, "class", "ceo-words-info-text svelte-q4sqx7");
    			add_location(div3, file$6, 66, 16, 1736);
    			attr_dev(div4, "class", "ceo-words-info-container svelte-q4sqx7");
    			add_location(div4, file$6, 59, 12, 1418);
    			attr_dev(div5, "class", "ceo-words-info svelte-q4sqx7");
    			add_location(div5, file$6, 58, 8, 1376);
    			attr_dev(div6, "class", "ceo-words-container svelte-q4sqx7");
    			add_location(div6, file$6, 54, 4, 1207);
    			attr_dev(section, "class", "ceo-words svelte-q4sqx7");
    			add_location(section, file$6, 53, 0, 1170);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div6);
    			append_dev(div6, div0);
    			append_dev(div0, img);
    			append_dev(div6, t0);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, span0);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			append_dev(div2, span1);
    			append_dev(span1, em);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, span2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CeoWords', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CeoWords> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class CeoWords extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CeoWords",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\CompanyOpenJobs.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1 } = globals;
    const file$5 = "src\\components\\CompanyOpenJobs.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (82:8) {:else}
    function create_else_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "LOADING.....";
    			add_location(p, file$5, 82, 12, 2385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(82:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (60:8) {#if openJobs}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*openJobs*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, openJobs*/ 1) {
    				each_value = /*openJobs*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(60:8) {#if openJobs}",
    		ctx
    	});

    	return block;
    }

    // (68:24) {#if job.localizacao}
    function create_if_block_1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value_1 = Object.entries(/*job*/ ctx[1].localizacao);
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*key*/ ctx[4];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, openJobs*/ 1) {
    				each_value_1 = Object.entries(/*job*/ ctx[1].localizacao);
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(68:24) {#if job.localizacao}",
    		ctx
    	});

    	return block;
    }

    // (74:32) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t_value = /*value*/ ctx[5] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$5, 74, 36, 2117);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openJobs*/ 1 && t_value !== (t_value = /*value*/ ctx[5] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(74:32) {:else}",
    		ctx
    	});

    	return block;
    }

    // (72:58) 
    function create_if_block_3(ctx) {
    	let span;
    	let t0_value = /*value*/ ctx[5] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(", ");
    			add_location(span, file$5, 72, 36, 2016);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openJobs*/ 1 && t0_value !== (t0_value = /*value*/ ctx[5] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(72:58) ",
    		ctx
    	});

    	return block;
    }

    // (70:32) {#if key == "bairro"}
    function create_if_block_2(ctx) {
    	let span;
    	let t0_value = /*value*/ ctx[5] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			add_location(span, file$5, 70, 36, 1895);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openJobs*/ 1 && t0_value !== (t0_value = /*value*/ ctx[5] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(70:32) {#if key == \\\"bairro\\\"}",
    		ctx
    	});

    	return block;
    }

    // (69:28) {#each Object.entries(job.localizacao) as [key, value], index (key)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*key*/ ctx[4] == "bairro") return create_if_block_2;
    		if (/*key*/ ctx[4] == "cidade") return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(69:28) {#each Object.entries(job.localizacao) as [key, value], index (key)}",
    		ctx
    	});

    	return block;
    }

    // (62:12) {#each openJobs as job, index}
    function create_each_block$2(ctx) {
    	let div2;
    	let div0;
    	let p;
    	let t0_value = /*job*/ ctx[1].cargo + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let if_block = /*job*/ ctx[1].localizacao && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t2 = space();
    			add_location(p, file$5, 64, 24, 1564);
    			attr_dev(div0, "class", "job-title svelte-10d7pih");
    			add_location(div0, file$5, 63, 20, 1515);
    			attr_dev(div1, "class", "job-address svelte-10d7pih");
    			add_location(div1, file$5, 66, 20, 1632);
    			attr_dev(div2, "class", "company-open-jobs-container-job svelte-10d7pih");
    			add_location(div2, file$5, 62, 16, 1448);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div2, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openJobs*/ 1 && t0_value !== (t0_value = /*job*/ ctx[1].cargo + "")) set_data_dev(t0, t0_value);

    			if (/*job*/ ctx[1].localizacao) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(62:12) {#each openJobs as job, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section;
    	let div2;
    	let div0;
    	let span0;
    	let t1;
    	let div1;
    	let span1;
    	let t3;

    	function select_block_type(ctx, dirty) {
    		if (/*openJobs*/ ctx[0]) return create_if_block;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "VAGAS EM ABERTO";
    			t1 = space();
    			div1 = element("div");
    			span1 = element("span");
    			span1.textContent = "DESENVOLVIMENTO";
    			t3 = space();
    			if_block.c();
    			add_location(span0, file$5, 54, 12, 1170);
    			attr_dev(div0, "class", "company-open-jobs-container-title svelte-10d7pih");
    			add_location(div0, file$5, 53, 8, 1109);
    			add_location(span1, file$5, 57, 12, 1288);
    			attr_dev(div1, "class", "company-open-jobs-container-subtitle svelte-10d7pih");
    			add_location(div1, file$5, 56, 8, 1224);
    			attr_dev(div2, "class", "company-open-jobs-container svelte-10d7pih");
    			add_location(div2, file$5, 52, 4, 1058);
    			attr_dev(section, "class", "company-open-jobs-section svelte-10d7pih");
    			add_location(section, file$5, 51, 0, 1009);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div0);
    			append_dev(div0, span0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span1);
    			append_dev(div2, t3);
    			if_block.m(div2, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CompanyOpenJobs', slots, []);
    	let { openJobs } = $$props;
    	const writable_props = ['openJobs'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CompanyOpenJobs> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('openJobs' in $$props) $$invalidate(0, openJobs = $$props.openJobs);
    	};

    	$$self.$capture_state = () => ({ openJobs });

    	$$self.$inject_state = $$props => {
    		if ('openJobs' in $$props) $$invalidate(0, openJobs = $$props.openJobs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [openJobs];
    }

    class CompanyOpenJobs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { openJobs: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompanyOpenJobs",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*openJobs*/ ctx[0] === undefined && !('openJobs' in props)) {
    			console.warn("<CompanyOpenJobs> was created without expected prop 'openJobs'");
    		}
    	}

    	get openJobs() {
    		throw new Error("<CompanyOpenJobs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openJobs(value) {
    		throw new Error("<CompanyOpenJobs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CompanyPhoto.svelte generated by Svelte v3.49.0 */

    const file$4 = "src\\components\\CompanyPhoto.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*companyPhoto*/ ctx[0].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Company Bottom Photo");
    			add_location(img, file$4, 24, 8, 508);
    			attr_dev(div, "class", "company-photo-container svelte-xg06lc");
    			add_location(div, file$4, 23, 4, 461);
    			attr_dev(section, "class", "company-photo-section svelte-xg06lc");
    			add_location(section, file$4, 22, 0, 416);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*companyPhoto*/ 1 && !src_url_equal(img.src, img_src_value = /*companyPhoto*/ ctx[0].src)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CompanyPhoto', slots, []);
    	let { companyPhoto } = $$props;
    	const writable_props = ['companyPhoto'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CompanyPhoto> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('companyPhoto' in $$props) $$invalidate(0, companyPhoto = $$props.companyPhoto);
    	};

    	$$self.$capture_state = () => ({ companyPhoto });

    	$$self.$inject_state = $$props => {
    		if ('companyPhoto' in $$props) $$invalidate(0, companyPhoto = $$props.companyPhoto);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [companyPhoto];
    }

    class CompanyPhoto extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { companyPhoto: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompanyPhoto",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*companyPhoto*/ ctx[0] === undefined && !('companyPhoto' in props)) {
    			console.warn("<CompanyPhoto> was created without expected prop 'companyPhoto'");
    		}
    	}

    	get companyPhoto() {
    		throw new Error("<CompanyPhoto>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set companyPhoto(value) {
    		throw new Error("<CompanyPhoto>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CompanyValues.svelte generated by Svelte v3.49.0 */

    const file$3 = "src\\components\\CompanyValues.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (72:12) {#each companyValues as companyValue, index}
    function create_each_block$1(ctx) {
    	let div3;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let span0;
    	let t1_value = /*companyValue*/ ctx[1].title + "";
    	let t1;
    	let t2;
    	let div2;
    	let span1;
    	let t4;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			span1 = element("span");
    			span1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam";
    			t4 = space();
    			if (!src_url_equal(img.src, img_src_value = /*companyValue*/ ctx[1].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Company Values image");
    			add_location(img, file$3, 74, 24, 1765);
    			attr_dev(div0, "class", "company-values-container-column-image");
    			add_location(div0, file$3, 73, 20, 1688);
    			add_location(span0, file$3, 77, 24, 1947);
    			attr_dev(div1, "class", "company-values-container-column-title svelte-ou47ub");
    			add_location(div1, file$3, 76, 20, 1870);
    			add_location(span1, file$3, 80, 24, 2106);
    			attr_dev(div2, "class", "company-values-container-column-text svelte-ou47ub");
    			add_location(div2, file$3, 79, 20, 2030);
    			attr_dev(div3, "class", "company-values-container-column svelte-ou47ub");
    			add_location(div3, file$3, 72, 16, 1621);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, img);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, span0);
    			append_dev(span0, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, span1);
    			append_dev(div3, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*companyValues*/ 1 && !src_url_equal(img.src, img_src_value = /*companyValue*/ ctx[1].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*companyValues*/ 1 && t1_value !== (t1_value = /*companyValue*/ ctx[1].title + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(72:12) {#each companyValues as companyValue, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let div1;
    	let div0;
    	let t0;
    	let div2;
    	let hr;
    	let t1;
    	let div3;
    	let span;
    	let each_value = /*companyValues*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div2 = element("div");
    			hr = element("hr");
    			t1 = space();
    			div3 = element("div");
    			span = element("span");
    			span.textContent = "SAIBA MAIS >>";
    			attr_dev(div0, "class", "company-values-container svelte-ou47ub");
    			add_location(div0, file$3, 70, 8, 1507);
    			attr_dev(div1, "class", "company-values svelte-ou47ub");
    			add_location(div1, file$3, 69, 4, 1469);
    			attr_dev(hr, "class", "company-values-hr svelte-ou47ub");
    			add_location(hr, file$3, 89, 8, 2482);
    			attr_dev(div2, "class", "company-values-hr-div svelte-ou47ub");
    			add_location(div2, file$3, 88, 4, 2437);
    			add_location(span, file$3, 92, 8, 2578);
    			attr_dev(div3, "class", "company-values-know-more svelte-ou47ub");
    			add_location(div3, file$3, 91, 4, 2530);
    			attr_dev(section, "class", "company-values-section svelte-ou47ub");
    			add_location(section, file$3, 68, 0, 1423);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(section, t0);
    			append_dev(section, div2);
    			append_dev(div2, hr);
    			append_dev(section, t1);
    			append_dev(section, div3);
    			append_dev(div3, span);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*companyValues*/ 1) {
    				each_value = /*companyValues*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CompanyValues', slots, []);
    	let { companyValues } = $$props;
    	const writable_props = ['companyValues'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CompanyValues> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('companyValues' in $$props) $$invalidate(0, companyValues = $$props.companyValues);
    	};

    	$$self.$capture_state = () => ({ companyValues });

    	$$self.$inject_state = $$props => {
    		if ('companyValues' in $$props) $$invalidate(0, companyValues = $$props.companyValues);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [companyValues];
    }

    class CompanyValues extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { companyValues: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompanyValues",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*companyValues*/ ctx[0] === undefined && !('companyValues' in props)) {
    			console.warn("<CompanyValues> was created without expected prop 'companyValues'");
    		}
    	}

    	get companyValues() {
    		throw new Error("<CompanyValues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set companyValues(value) {
    		throw new Error("<CompanyValues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\MainSubTitle.svelte generated by Svelte v3.49.0 */

    const file$2 = "src\\components\\MainSubTitle.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let div3;
    	let div0;
    	let span0;
    	let t1;
    	let div1;
    	let hr;
    	let t2;
    	let div2;
    	let span1;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    			t1 = space();
    			div1 = element("div");
    			hr = element("hr");
    			t2 = space();
    			div2 = element("div");
    			span1 = element("span");
    			span1.textContent = "VAGAS EM ABERTO >>";
    			add_location(span0, file$2, 55, 12, 1166);
    			attr_dev(div0, "class", "info-container_info svelte-1ax6r0z");
    			add_location(div0, file$2, 54, 8, 1119);
    			add_location(hr, file$2, 59, 12, 1524);
    			attr_dev(div1, "class", "info-container_horizontal_rule svelte-1ax6r0z");
    			add_location(div1, file$2, 58, 8, 1466);
    			add_location(span1, file$2, 62, 12, 1606);
    			attr_dev(div2, "class", "info-container_open_jobs svelte-1ax6r0z");
    			add_location(div2, file$2, 61, 8, 1554);
    			attr_dev(div3, "class", "info-container svelte-1ax6r0z");
    			add_location(div3, file$2, 53, 4, 1081);
    			attr_dev(section, "class", "mainsubtitle-section svelte-1ax6r0z");
    			add_location(section, file$2, 52, 0, 1037);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div0);
    			append_dev(div0, span0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, hr);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, span1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
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

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MainSubTitle', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainSubTitle> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class MainSubTitle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainSubTitle",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\MeetOurTeam.svelte generated by Svelte v3.49.0 */

    const file$1 = "src\\components\\MeetOurTeam.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (39:12) {#each members as member, index}
    function create_each_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*member*/ ctx[1].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Team Member");
    			attr_dev(img, "index", /*index*/ ctx[3]);
    			add_location(img, file$1, 39, 16, 1012);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*members*/ 1 && !src_url_equal(img.src, img_src_value = /*member*/ ctx[1].src)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(39:12) {#each members as member, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let div2;
    	let div0;
    	let h10;
    	let t1;
    	let h11;
    	let t3;
    	let div1;
    	let each_value = /*members*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "CONHEÇA NOSSO TIME";
    			t1 = space();
    			h11 = element("h1");
    			h11.textContent = "FORA DE SÉRIE";
    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h10, file$1, 34, 12, 798);
    			add_location(h11, file$1, 35, 12, 839);
    			attr_dev(div0, "class", "meet-our-team-container-title");
    			add_location(div0, file$1, 33, 8, 741);
    			attr_dev(div1, "class", "meet-our-team-container-members svelte-uhk5p5");
    			add_location(div1, file$1, 37, 8, 887);
    			attr_dev(div2, "class", "meet-our-team-container svelte-uhk5p5");
    			add_location(div2, file$1, 32, 4, 694);
    			attr_dev(section, "class", "meet-our-team svelte-uhk5p5");
    			add_location(section, file$1, 31, 0, 657);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t1);
    			append_dev(div0, h11);
    			append_dev(div2, t3);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*members*/ 1) {
    				each_value = /*members*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots('MeetOurTeam', slots, []);
    	let { members } = $$props;
    	const writable_props = ['members'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MeetOurTeam> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('members' in $$props) $$invalidate(0, members = $$props.members);
    	};

    	$$self.$capture_state = () => ({ members });

    	$$self.$inject_state = $$props => {
    		if ('members' in $$props) $$invalidate(0, members = $$props.members);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [members];
    }

    class MeetOurTeam extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { members: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MeetOurTeam",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*members*/ ctx[0] === undefined && !('members' in props)) {
    			console.warn("<MeetOurTeam> was created without expected prop 'members'");
    		}
    	}

    	get members() {
    		throw new Error("<MeetOurTeam>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set members(value) {
    		throw new Error("<MeetOurTeam>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\Home.svelte generated by Svelte v3.49.0 */
    const file = "src\\pages\\Home.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let div2;
    	let div1;
    	let div0;
    	let p;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Trabalhe no Elo7";
    			attr_dev(p, "class", "main-text svelte-rv1p98");
    			add_location(p, file, 70, 16, 1535);
    			attr_dev(div0, "class", "main-text-container svelte-rv1p98");
    			add_location(div0, file, 69, 12, 1484);
    			attr_dev(div1, "class", "darkness svelte-rv1p98");
    			add_location(div1, file, 68, 8, 1448);
    			attr_dev(div2, "class", "full-screen-width svelte-rv1p98");
    			add_location(div2, file, 67, 4, 1407);
    			attr_dev(section, "class", "section team-image-section");
    			add_location(section, file, 66, 0, 1357);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
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
    	validate_slots('Home', slots, []);
    	let src = "assets/foto-header.png";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ src });

    	$$self.$inject_state = $$props => {
    		if ('src' in $$props) src = $$props.src;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.49.0 */

    function create_fragment(ctx) {
    	let home;
    	let t0;
    	let mainsubtitle;
    	let t1;
    	let ceowords;
    	let t2;
    	let meetourteam;
    	let t3;
    	let companyvalues;
    	let t4;
    	let companyphoto;
    	let t5;
    	let companyopenjobs;
    	let current;
    	home = new Home({ $$inline: true });
    	mainsubtitle = new MainSubTitle({ $$inline: true });
    	ceowords = new CeoWords({ $$inline: true });

    	meetourteam = new MeetOurTeam({
    			props: { members: /*members*/ ctx[1] },
    			$$inline: true
    		});

    	companyvalues = new CompanyValues({
    			props: { companyValues: /*companyValues*/ ctx[2] },
    			$$inline: true
    		});

    	companyphoto = new CompanyPhoto({
    			props: { companyPhoto: /*companyPhoto*/ ctx[3] },
    			$$inline: true
    		});

    	companyopenjobs = new CompanyOpenJobs({
    			props: { openJobs: /*openJobs*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    			t0 = space();
    			create_component(mainsubtitle.$$.fragment);
    			t1 = space();
    			create_component(ceowords.$$.fragment);
    			t2 = space();
    			create_component(meetourteam.$$.fragment);
    			t3 = space();
    			create_component(companyvalues.$$.fragment);
    			t4 = space();
    			create_component(companyphoto.$$.fragment);
    			t5 = space();
    			create_component(companyopenjobs.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(mainsubtitle, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(ceowords, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(meetourteam, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(companyvalues, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(companyphoto, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(companyopenjobs, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const companyopenjobs_changes = {};
    			if (dirty & /*openJobs*/ 1) companyopenjobs_changes.openJobs = /*openJobs*/ ctx[0];
    			companyopenjobs.$set(companyopenjobs_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			transition_in(mainsubtitle.$$.fragment, local);
    			transition_in(ceowords.$$.fragment, local);
    			transition_in(meetourteam.$$.fragment, local);
    			transition_in(companyvalues.$$.fragment, local);
    			transition_in(companyphoto.$$.fragment, local);
    			transition_in(companyopenjobs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			transition_out(mainsubtitle.$$.fragment, local);
    			transition_out(ceowords.$$.fragment, local);
    			transition_out(meetourteam.$$.fragment, local);
    			transition_out(companyvalues.$$.fragment, local);
    			transition_out(companyphoto.$$.fragment, local);
    			transition_out(companyopenjobs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(mainsubtitle, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(ceowords, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(meetourteam, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(companyvalues, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(companyphoto, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(companyopenjobs, detaching);
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

    	let members = [
    		{ src: "assets/camila.png" },
    		{ src: "assets/guto.png" },
    		{ src: "assets/david.png" },
    		{ src: "assets/beatriz.png" }
    	];

    	let companyValues = [
    		{
    			src: "assets/qualidade.png",
    			title: "Qualidade de Vida"
    		},
    		{
    			src: "assets/descontracao.png",
    			title: "Ambiente Descontraído"
    		},
    		{
    			src: "assets/atividades.png",
    			title: "Atividades Extras"
    		}
    	];

    	let companyPhoto = { src: "assets/foto-bottom.png" };
    	let openJobs;

    	onMount(async () => {
    		/* openJobs = await fetch('http://www.mocky.io/v2/5d6fb6b1310000f89166087b')
        .then( res => res.json()); */
    		const response = await fetch('http://www.mocky.io/v2/5d6fb6b1310000f89166087b');

    		const data = await response.json();
    		$$invalidate(0, openJobs = data.vagas);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		CeoWords,
    		CompanyOpenJobs,
    		CompanyPhoto,
    		CompanyValues,
    		MainSubTitle,
    		MeetOurTeam,
    		Home,
    		members,
    		companyValues,
    		companyPhoto,
    		openJobs
    	});

    	$$self.$inject_state = $$props => {
    		if ('members' in $$props) $$invalidate(1, members = $$props.members);
    		if ('companyValues' in $$props) $$invalidate(2, companyValues = $$props.companyValues);
    		if ('companyPhoto' in $$props) $$invalidate(3, companyPhoto = $$props.companyPhoto);
    		if ('openJobs' in $$props) $$invalidate(0, openJobs = $$props.openJobs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [openJobs, members, companyValues, companyPhoto];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
