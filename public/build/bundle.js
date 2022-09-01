
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
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                else
                    this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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

    const file$7 = "src\\components\\CeoWords.svelte";

    function create_fragment$9(ctx) {
    	let section;
    	let div7;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div6;
    	let div5;
    	let div2;
    	let span0;
    	let t2;
    	let div3;
    	let span1;
    	let em;
    	let t4;
    	let div4;
    	let article;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div7 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "PALAVRA DO CEO";
    			t2 = space();
    			div3 = element("div");
    			span1 = element("span");
    			em = element("em");
    			em.textContent = "Carlos Curioni";
    			t4 = space();
    			div4 = element("div");
    			article = element("article");
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor \r\n                            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation \r\n                            ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    			attr_dev(img, "class", "ceo-words-photo-style svelte-1bplmtn");
    			if (!src_url_equal(img.src, img_src_value = "assets/placeholder-video.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Ceo");
    			add_location(img, file$7, 130, 16, 3561);
    			attr_dev(div0, "id", "video_9TIQ_u0TBaY");
    			add_location(div0, file$7, 125, 12, 3362);
    			attr_dev(div1, "class", "ceo-words-photo svelte-1bplmtn");
    			add_location(div1, file$7, 124, 8, 3307);
    			add_location(span0, file$7, 136, 20, 3854);
    			attr_dev(div2, "class", "ceo-words-info-title svelte-1bplmtn");
    			add_location(div2, file$7, 135, 16, 3798);
    			add_location(em, file$7, 139, 26, 3988);
    			add_location(span1, file$7, 139, 20, 3982);
    			attr_dev(div3, "class", "ceo-words-info-subtitle svelte-1bplmtn");
    			add_location(div3, file$7, 138, 16, 3923);
    			add_location(p, file$7, 143, 24, 4150);
    			add_location(article, file$7, 142, 20, 4115);
    			attr_dev(div4, "class", "ceo-words-info-text svelte-1bplmtn");
    			add_location(div4, file$7, 141, 16, 4060);
    			attr_dev(div5, "class", "ceo-words-info-container svelte-1bplmtn");
    			add_location(div5, file$7, 134, 12, 3742);
    			attr_dev(div6, "class", "ceo-words-info svelte-1bplmtn");
    			add_location(div6, file$7, 133, 8, 3700);
    			attr_dev(div7, "class", "ceo-words-container svelte-1bplmtn");
    			add_location(div7, file$7, 123, 4, 3264);
    			attr_dev(section, "class", "ceo-words svelte-1bplmtn");
    			add_location(section, file$7, 122, 0, 3227);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div7);
    			append_dev(div7, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div7, t0);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div2, span0);
    			append_dev(div5, t2);
    			append_dev(div5, div3);
    			append_dev(div3, span1);
    			append_dev(span1, em);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, article);
    			append_dev(article, p);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(clickOutside.call(null, div0)),
    					listen_dev(div0, "click_outside", /*handleClickOutside*/ ctx[1], false, false, false),
    					listen_dev(div0, "click", /*playYoutubeVideo*/ ctx[0], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function clickOutside(node) {
    	const handleClick = event => {
    		if (node && !node.contains(event.target) && !event.defaultPrevented) {
    			node.dispatchEvent(new CustomEvent('click_outside', node));
    		}
    	};

    	document.addEventListener('click', handleClick, true);

    	return {
    		destroy() {
    			document.removeEventListener('click', handleClick, true);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CeoWords', slots, []);
    	let videoId = '9TIQ_u0TBaY';

    	function playYoutubeVideo() {
    		let videoYT = "<iframe width='400' height='220' src='https://www.youtube.com/embed/" + videoId + "?&theme=dark&autoplay=1&autohide=2frameborder='0'></iframe>";
    		document.getElementById('video_' + videoId).innerHTML = videoYT;
    	}

    	/* bring back CEO image */
    	function handleClickOutside(event) {
    		let ceoImage = `<img class="ceo-words-photo-style" src="assets/placeholder-video.png" alt="Ceo">`;
    		document.getElementById('video_' + videoId).innerHTML = ceoImage;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CeoWords> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		videoId,
    		playYoutubeVideo,
    		clickOutside,
    		handleClickOutside
    	});

    	$$self.$inject_state = $$props => {
    		if ('videoId' in $$props) videoId = $$props.videoId;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [playYoutubeVideo, handleClickOutside];
    }

    class CeoWords extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CeoWords",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\CompanyOpenJobs.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1 } = globals;
    const file$6 = "src\\components\\CompanyOpenJobs.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (108:8) {:else}
    function create_else_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "LOADING.....";
    			add_location(p, file$6, 108, 12, 3496);
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
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(108:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (78:8) {#if openJobs}
    function create_if_block$3(ctx) {
    	let div;
    	let each_value = /*openJobs*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "company-open-jobs-container-jobs svelte-180rb5t");
    			add_location(div, file$6, 78, 12, 1904);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, openJobs*/ 1) {
    				each_value = /*openJobs*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(78:8) {#if openJobs}",
    		ctx
    	});

    	return block;
    }

    // (82:20) {#if job.ativa === true}
    function create_if_block_1$1(ctx) {
    	let div2;
    	let div0;
    	let a;
    	let span;
    	let t0_value = /*job*/ ctx[1].cargo + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let div1;
    	let t2;

    	function select_block_type_1(ctx, dirty) {
    		if (/*job*/ ctx[1].localizacao) return create_if_block_2$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			a = element("a");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			if_block.c();
    			t2 = space();
    			attr_dev(span, "class", "job-title-span svelte-180rb5t");
    			add_location(span, file$6, 85, 36, 2316);
    			attr_dev(a, "href", a_href_value = /*job*/ ctx[1].link);
    			add_location(a, file$6, 84, 32, 2259);
    			attr_dev(div0, "class", "job-title svelte-180rb5t");
    			add_location(div0, file$6, 83, 28, 2202);
    			attr_dev(div1, "class", "job-address");
    			add_location(div1, file$6, 88, 28, 2491);
    			attr_dev(div2, "class", "company-open-jobs-container-job svelte-180rb5t");
    			add_location(div2, file$6, 82, 24, 2127);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, a);
    			append_dev(a, span);
    			append_dev(span, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			if_block.m(div1, null);
    			append_dev(div2, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openJobs*/ 1 && t0_value !== (t0_value = /*job*/ ctx[1].cargo + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*openJobs*/ 1 && a_href_value !== (a_href_value = /*job*/ ctx[1].link)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(82:20) {#if job.ativa === true}",
    		ctx
    	});

    	return block;
    }

    // (100:32) {:else}
    function create_else_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Remoto";
    			add_location(span, file$6, 100, 36, 3231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(100:32) {:else}",
    		ctx
    	});

    	return block;
    }

    // (90:32) {#if job.localizacao}
    function create_if_block_2$1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value_1 = Object.entries(/*job*/ ctx[1].localizacao);
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*key*/ ctx[4];
    	validate_each_keys(ctx, each_value_1, get_each_context_1$3, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$3(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$3(key, child_ctx));
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
    				validate_each_keys(ctx, each_value_1, get_each_context_1$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block_1$3, each_1_anchor, get_each_context_1$3);
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(90:32) {#if job.localizacao}",
    		ctx
    	});

    	return block;
    }

    // (96:40) {:else}
    function create_else_block$2(ctx) {
    	let span;
    	let t_value = /*value*/ ctx[5] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$6, 96, 44, 3040);
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
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(96:40) {:else}",
    		ctx
    	});

    	return block;
    }

    // (94:66) 
    function create_if_block_4$1(ctx) {
    	let span;
    	let t0_value = /*value*/ ctx[5] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(", ");
    			add_location(span, file$6, 94, 44, 2923);
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
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(94:66) ",
    		ctx
    	});

    	return block;
    }

    // (92:40) {#if key == "bairro"}
    function create_if_block_3$1(ctx) {
    	let span;
    	let t0_value = /*value*/ ctx[5] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			add_location(span, file$6, 92, 44, 2786);
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
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(92:40) {#if key == \\\"bairro\\\"}",
    		ctx
    	});

    	return block;
    }

    // (91:36) {#each Object.entries(job.localizacao) as [key, value], index (key)}
    function create_each_block_1$3(key_1, ctx) {
    	let first;
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*key*/ ctx[4] == "bairro") return create_if_block_3$1;
    		if (/*key*/ ctx[4] == "cidade") return create_if_block_4$1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_2(ctx);
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

    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
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
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(91:36) {#each Object.entries(job.localizacao) as [key, value], index (key)}",
    		ctx
    	});

    	return block;
    }

    // (81:16) {#each openJobs as job, index}
    function create_each_block$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*job*/ ctx[1].ativa === true && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*job*/ ctx[1].ativa === true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(81:16) {#each openJobs as job, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section;
    	let div2;
    	let div0;
    	let span0;
    	let t1;
    	let div1;
    	let span1;
    	let t3;

    	function select_block_type(ctx, dirty) {
    		if (/*openJobs*/ ctx[0]) return create_if_block$3;
    		return create_else_block_2;
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
    			add_location(span0, file$6, 72, 12, 1688);
    			attr_dev(div0, "class", "company-open-jobs-container-title svelte-180rb5t");
    			add_location(div0, file$6, 71, 8, 1627);
    			add_location(span1, file$6, 75, 12, 1806);
    			attr_dev(div1, "class", "company-open-jobs-container-subtitle svelte-180rb5t");
    			add_location(div1, file$6, 74, 8, 1742);
    			attr_dev(div2, "class", "company-open-jobs-container svelte-180rb5t");
    			add_location(div2, file$6, 70, 4, 1576);
    			attr_dev(section, "class", "company-open-jobs-section svelte-180rb5t");
    			attr_dev(section, "id", "section-open-jobs");
    			add_location(section, file$6, 69, 0, 1504);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { openJobs: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompanyOpenJobs",
    			options,
    			id: create_fragment$8.name
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

    const file$5 = "src\\components\\CompanyPhoto.svelte";

    function create_fragment$7(ctx) {
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
    			attr_dev(img, "class", "svelte-18o4o2v");
    			add_location(img, file$5, 38, 8, 821);
    			attr_dev(div, "class", "company-photo-container svelte-18o4o2v");
    			add_location(div, file$5, 37, 4, 774);
    			attr_dev(section, "class", "company-photo-section svelte-18o4o2v");
    			add_location(section, file$5, 36, 0, 729);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { companyPhoto: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompanyPhoto",
    			options,
    			id: create_fragment$7.name
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

    const file$4 = "src\\components\\CompanyValues.svelte";

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (114:8) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let each_value_1 = /*companyValues*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "company-values-container svelte-19o89xc");
    			add_location(div, file$4, 114, 8, 3154);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*companyValues*/ 1) {
    				each_value_1 = /*companyValues*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(114:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (92:8) {#if innerWidth < 767}
    function create_if_block$2(ctx) {
    	let div;
    	let each_value = /*companyValues*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "company-values-container-smartphone svelte-19o89xc");
    			add_location(div, file$4, 93, 8, 2082);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*companyValues*/ 1) {
    				each_value = /*companyValues*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(92:8) {#if innerWidth < 767}",
    		ctx
    	});

    	return block;
    }

    // (116:12) {#each companyValues as companyValue, index}
    function create_each_block_1$2(ctx) {
    	let div3;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let span0;
    	let t1_value = /*companyValue*/ ctx[3].title + "";
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
    			if (!src_url_equal(img.src, img_src_value = /*companyValue*/ ctx[3].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Company Values image");
    			add_location(img, file$4, 118, 24, 3412);
    			attr_dev(div0, "class", "company-values-container-column-image");
    			add_location(div0, file$4, 117, 20, 3335);
    			add_location(span0, file$4, 121, 24, 3594);
    			attr_dev(div1, "class", "company-values-container-column-title svelte-19o89xc");
    			add_location(div1, file$4, 120, 20, 3517);
    			add_location(span1, file$4, 124, 24, 3753);
    			attr_dev(div2, "class", "company-values-container-column-text svelte-19o89xc");
    			add_location(div2, file$4, 123, 20, 3677);
    			attr_dev(div3, "class", "company-values-container-column svelte-19o89xc");
    			add_location(div3, file$4, 116, 16, 3268);
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
    			if (dirty & /*companyValues*/ 1 && !src_url_equal(img.src, img_src_value = /*companyValue*/ ctx[3].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*companyValues*/ 1 && t1_value !== (t1_value = /*companyValue*/ ctx[3].title + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(116:12) {#each companyValues as companyValue, index}",
    		ctx
    	});

    	return block;
    }

    // (95:12) {#each companyValues as companyValue, index}
    function create_each_block$2(ctx) {
    	let div3;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let span;
    	let t1_value = /*companyValue*/ ctx[3].title + "";
    	let t1;
    	let t2;
    	let div2;
    	let article;
    	let p;
    	let t4;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			article = element("article");
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod \r\n                                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam";
    			t4 = space();
    			if (!src_url_equal(img.src, img_src_value = /*companyValue*/ ctx[3].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Company Values image");
    			add_location(img, file$4, 97, 24, 2362);
    			attr_dev(div0, "class", "company-values-container-column-image");
    			add_location(div0, file$4, 96, 20, 2285);
    			add_location(span, file$4, 100, 24, 2544);
    			attr_dev(div1, "class", "company-values-container-column-title svelte-19o89xc");
    			add_location(div1, file$4, 99, 20, 2467);
    			add_location(p, file$4, 104, 28, 2742);
    			add_location(article, file$4, 103, 24, 2703);
    			attr_dev(div2, "class", "company-values-container-column-text svelte-19o89xc");
    			add_location(div2, file$4, 102, 20, 2627);
    			attr_dev(div3, "class", "company-values-container-column-smartphone svelte-19o89xc");
    			add_location(div3, file$4, 95, 16, 2207);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, img);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, span);
    			append_dev(span, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, article);
    			append_dev(article, p);
    			append_dev(div3, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*companyValues*/ 1 && !src_url_equal(img.src, img_src_value = /*companyValue*/ ctx[3].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*companyValues*/ 1 && t1_value !== (t1_value = /*companyValue*/ ctx[3].title + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(95:12) {#each companyValues as companyValue, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section;
    	let div0;
    	let t0;
    	let div1;
    	let hr;
    	let t1;
    	let div2;
    	let a;
    	let span;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[2]);

    	function select_block_type(ctx, dirty) {
    		if (/*innerWidth*/ ctx[1] < 767) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			if_block.c();
    			t0 = space();
    			div1 = element("div");
    			hr = element("hr");
    			t1 = space();
    			div2 = element("div");
    			a = element("a");
    			span = element("span");
    			span.textContent = "SAIBA MAIS >>";
    			attr_dev(div0, "class", "company-values svelte-19o89xc");
    			add_location(div0, file$4, 90, 4, 1947);
    			attr_dev(hr, "class", "company-values-hr svelte-19o89xc");
    			add_location(hr, file$4, 134, 8, 4145);
    			attr_dev(div1, "class", "company-values-hr-div svelte-19o89xc");
    			add_location(div1, file$4, 133, 4, 4100);
    			attr_dev(span, "class", "company-values-know-more-link svelte-19o89xc");
    			add_location(span, file$4, 138, 12, 4290);
    			attr_dev(a, "href", "https://www.elo7.com.br/");
    			add_location(a, file$4, 137, 8, 4241);
    			attr_dev(div2, "class", "company-values-know-more svelte-19o89xc");
    			add_location(div2, file$4, 136, 4, 4193);
    			attr_dev(section, "class", "company-values-section svelte-19o89xc");
    			add_location(section, file$4, 89, 0, 1901);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			if_block.m(div0, null);
    			append_dev(section, t0);
    			append_dev(section, div1);
    			append_dev(div1, hr);
    			append_dev(section, t1);
    			append_dev(section, div2);
    			append_dev(div2, a);
    			append_dev(a, span);

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    			mounted = false;
    			dispose();
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
    	let innerWidth;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CompanyValues', slots, []);
    	let { companyValues } = $$props;
    	const writable_props = ['companyValues'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CompanyValues> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(1, innerWidth = window.innerWidth);
    	}

    	$$self.$$set = $$props => {
    		if ('companyValues' in $$props) $$invalidate(0, companyValues = $$props.companyValues);
    	};

    	$$self.$capture_state = () => ({ companyValues, innerWidth });

    	$$self.$inject_state = $$props => {
    		if ('companyValues' in $$props) $$invalidate(0, companyValues = $$props.companyValues);
    		if ('innerWidth' in $$props) $$invalidate(1, innerWidth = $$props.innerWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(1, innerWidth = 0);
    	return [companyValues, innerWidth, onwindowresize];
    }

    class CompanyValues extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { companyValues: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompanyValues",
    			options,
    			id: create_fragment$6.name
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

    /* src\components\HeroSection.svelte generated by Svelte v3.49.0 */

    const file$3 = "src\\components\\HeroSection.svelte";

    function create_fragment$5(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let p;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Trabalhe no Elo7";
    			attr_dev(p, "class", "main-text svelte-1gl74vg");
    			add_location(p, file$3, 69, 16, 1557);
    			attr_dev(div0, "class", "main-text-container svelte-1gl74vg");
    			add_location(div0, file$3, 68, 12, 1506);
    			attr_dev(div1, "class", "darkness svelte-1gl74vg");
    			add_location(div1, file$3, 67, 8, 1470);
    			attr_dev(div2, "class", "full-screen-width svelte-1gl74vg");
    			add_location(div2, file$3, 66, 4, 1429);
    			attr_dev(div3, "class", "section team-image-section");
    			add_location(div3, file$3, 65, 0, 1383);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
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

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HeroSection', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HeroSection> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class HeroSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeroSection",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\MainSubTitle.svelte generated by Svelte v3.49.0 */

    const file$2 = "src\\components\\MainSubTitle.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div3;
    	let div0;
    	let article;
    	let p;
    	let t1;
    	let div1;
    	let hr;
    	let t2;
    	let div2;
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div0 = element("div");
    			article = element("article");
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, \r\n                    sed do eiusmod tempor incididunt ut labore et dolore magna \r\n                    aliqua. Ut enim ad minim veniam Lorem ipsum dolor sit amet.";
    			t1 = space();
    			div1 = element("div");
    			hr = element("hr");
    			t2 = space();
    			div2 = element("div");
    			a = element("a");
    			span = element("span");
    			span.textContent = "VAGAS EM ABERTO >>";
    			add_location(p, file$2, 73, 16, 1590);
    			add_location(article, file$2, 72, 12, 1563);
    			attr_dev(div0, "class", "info-container_info svelte-5q0irx");
    			add_location(div0, file$2, 71, 8, 1516);
    			add_location(hr, file$2, 80, 12, 1955);
    			attr_dev(div1, "class", "info-container_horizontal_rule svelte-5q0irx");
    			add_location(div1, file$2, 79, 8, 1897);
    			attr_dev(span, "class", "info-container_open_jobs_link svelte-5q0irx");
    			add_location(span, file$2, 84, 16, 2084);
    			attr_dev(a, "href", "#section-open-jobs");
    			add_location(a, file$2, 83, 12, 2037);
    			attr_dev(div2, "class", "info-container_open_jobs svelte-5q0irx");
    			add_location(div2, file$2, 82, 8, 1985);
    			attr_dev(div3, "class", "info-container svelte-5q0irx");
    			add_location(div3, file$2, 70, 4, 1478);
    			attr_dev(section, "class", "mainsubtitle-section svelte-5q0irx");
    			add_location(section, file$2, 69, 0, 1434);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div0);
    			append_dev(div0, article);
    			append_dev(article, p);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, hr);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, a);
    			append_dev(a, span);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainSubTitle",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\MeetOurTeam.svelte generated by Svelte v3.49.0 */

    const file$1 = "src\\components\\MeetOurTeam.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (95:8) {:else}
    function create_else_block(ctx) {
    	let div;
    	let each_value_1 = /*members*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "meet-our-team-container-members svelte-9l7s7y");
    			add_location(div, file$1, 95, 12, 2728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*members*/ 1) {
    				each_value_1 = /*members*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(95:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (74:8) {#if innerWidth < 767}
    function create_if_block$1(ctx) {
    	let div;
    	let each_value = /*members*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "meet-our-team-container-members-smartphone svelte-9l7s7y");
    			add_location(div, file$1, 74, 12, 1706);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*membersNames, members*/ 3) {
    				each_value = /*members*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(74:8) {#if innerWidth < 767}",
    		ctx
    	});

    	return block;
    }

    // (97:16) {#each members as member, index}
    function create_each_block_1$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*member*/ ctx[4].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Team Member");
    			attr_dev(img, "index", /*index*/ ctx[6]);
    			add_location(img, file$1, 97, 20, 2861);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*members*/ 1 && !src_url_equal(img.src, img_src_value = /*member*/ ctx[4].src)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(97:16) {#each members as member, index}",
    		ctx
    	});

    	return block;
    }

    // (76:16) {#each members as member, index}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let span0;
    	let t1_value = /*membersNames*/ ctx[1][/*index*/ ctx[6]] + "";
    	let t1;
    	let t2;
    	let span1;
    	let t3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			span1 = element("span");
    			t3 = space();
    			if (!src_url_equal(img.src, img_src_value = /*member*/ ctx[4].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Team Member");
    			attr_dev(img, "index", /*index*/ ctx[6]);
    			add_location(img, file$1, 78, 28, 1951);
    			attr_dev(div0, "class", "member-image svelte-9l7s7y");
    			add_location(div0, file$1, 77, 24, 1895);
    			set_style(span0, "color", "#7d7873");
    			set_style(span0, "font-weight", "600");
    			set_style(span0, "font-size", "18px");
    			add_location(span0, file$1, 81, 28, 2120);
    			set_style(span1, "color", "#7d7873");
    			set_style(span1, "font-size", "16px");
    			add_location(span1, file$1, 86, 28, 2375);
    			attr_dev(div1, "class", "member-info svelte-9l7s7y");
    			add_location(div1, file$1, 80, 24, 2065);
    			attr_dev(div2, "class", "member-container-info svelte-9l7s7y");
    			add_location(div2, file$1, 76, 20, 1834);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(span0, t1);
    			append_dev(div1, t2);
    			append_dev(div1, span1);
    			append_dev(div2, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*members*/ 1 && !src_url_equal(img.src, img_src_value = /*member*/ ctx[4].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*membersNames*/ 2 && t1_value !== (t1_value = /*membersNames*/ ctx[1][/*index*/ ctx[6]] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(76:16) {#each members as member, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let div1;
    	let div0;
    	let h10;
    	let t1;
    	let h11;
    	let t3;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[3]);

    	function select_block_type(ctx, dirty) {
    		if (/*innerWidth*/ ctx[2] < 767) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "CONHEÇA NOSSO TIME";
    			t1 = space();
    			h11 = element("h1");
    			h11.textContent = "FORA DE SÉRIE";
    			t3 = space();
    			if_block.c();
    			add_location(h10, file$1, 70, 12, 1557);
    			add_location(h11, file$1, 71, 12, 1598);
    			attr_dev(div0, "class", "meet-our-team-container-title");
    			add_location(div0, file$1, 69, 8, 1500);
    			attr_dev(div1, "class", "meet-our-team-container svelte-9l7s7y");
    			add_location(div1, file$1, 68, 4, 1453);
    			attr_dev(section, "class", "meet-our-team svelte-9l7s7y");
    			add_location(section, file$1, 67, 0, 1416);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t1);
    			append_dev(div0, h11);
    			append_dev(div1, t3);
    			if_block.m(div1, null);

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
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
    	let innerWidth;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MeetOurTeam', slots, []);
    	let { members } = $$props;
    	let { membersNames } = $$props;
    	const writable_props = ['members', 'membersNames'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MeetOurTeam> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(2, innerWidth = window.innerWidth);
    	}

    	$$self.$$set = $$props => {
    		if ('members' in $$props) $$invalidate(0, members = $$props.members);
    		if ('membersNames' in $$props) $$invalidate(1, membersNames = $$props.membersNames);
    	};

    	$$self.$capture_state = () => ({ members, membersNames, innerWidth });

    	$$self.$inject_state = $$props => {
    		if ('members' in $$props) $$invalidate(0, members = $$props.members);
    		if ('membersNames' in $$props) $$invalidate(1, membersNames = $$props.membersNames);
    		if ('innerWidth' in $$props) $$invalidate(2, innerWidth = $$props.innerWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(2, innerWidth = 0);
    	return [members, membersNames, innerWidth, onwindowresize];
    }

    class MeetOurTeam extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { members: 0, membersNames: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MeetOurTeam",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*members*/ ctx[0] === undefined && !('members' in props)) {
    			console.warn("<MeetOurTeam> was created without expected prop 'members'");
    		}

    		if (/*membersNames*/ ctx[1] === undefined && !('membersNames' in props)) {
    			console.warn("<MeetOurTeam> was created without expected prop 'membersNames'");
    		}
    	}

    	get members() {
    		throw new Error("<MeetOurTeam>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set members(value) {
    		throw new Error("<MeetOurTeam>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get membersNames() {
    		throw new Error("<MeetOurTeam>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set membersNames(value) {
    		throw new Error("<MeetOurTeam>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\Home.svelte generated by Svelte v3.49.0 */

    function create_fragment$2(ctx) {
    	let herosection;
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

    	herosection = new HeroSection({
    			props: {
    				heroSectionPhoto: /*heroSectionPhoto*/ ctx[1]
    			},
    			$$inline: true
    		});

    	mainsubtitle = new MainSubTitle({ $$inline: true });
    	ceowords = new CeoWords({ $$inline: true });

    	meetourteam = new MeetOurTeam({
    			props: {
    				members: /*members*/ ctx[2],
    				membersNames: /*membersNames*/ ctx[3]
    			},
    			$$inline: true
    		});

    	companyvalues = new CompanyValues({
    			props: { companyValues: /*companyValues*/ ctx[4] },
    			$$inline: true
    		});

    	companyphoto = new CompanyPhoto({
    			props: { companyPhoto: /*companyPhoto*/ ctx[5] },
    			$$inline: true
    		});

    	companyopenjobs = new CompanyOpenJobs({
    			props: { openJobs: /*openJobs*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(herosection.$$.fragment);
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
    			mount_component(herosection, target, anchor);
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
    			transition_in(herosection.$$.fragment, local);
    			transition_in(mainsubtitle.$$.fragment, local);
    			transition_in(ceowords.$$.fragment, local);
    			transition_in(meetourteam.$$.fragment, local);
    			transition_in(companyvalues.$$.fragment, local);
    			transition_in(companyphoto.$$.fragment, local);
    			transition_in(companyopenjobs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(herosection.$$.fragment, local);
    			transition_out(mainsubtitle.$$.fragment, local);
    			transition_out(ceowords.$$.fragment, local);
    			transition_out(meetourteam.$$.fragment, local);
    			transition_out(companyvalues.$$.fragment, local);
    			transition_out(companyphoto.$$.fragment, local);
    			transition_out(companyopenjobs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(herosection, detaching);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let heroSectionPhoto = { src: "assets/foto-header.png" };

    	let members = [
    		{ src: "assets/camila.png" },
    		{ src: "assets/guto.png" },
    		{ src: "assets/david.png" },
    		{ src: "assets/beatriz.png" }
    	];

    	let membersNames = ['Beatriz', 'Guto', 'David', 'Camila'];

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
    		const response = await fetch('http://www.mocky.io/v2/5d6fb6b1310000f89166087b');
    		const data = await response.json();
    		$$invalidate(0, openJobs = data.vagas);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		CeoWords,
    		CompanyOpenJobs,
    		CompanyPhoto,
    		CompanyValues,
    		HeroSection,
    		MainSubTitle,
    		MeetOurTeam,
    		heroSectionPhoto,
    		members,
    		membersNames,
    		companyValues,
    		companyPhoto,
    		openJobs
    	});

    	$$self.$inject_state = $$props => {
    		if ('heroSectionPhoto' in $$props) $$invalidate(1, heroSectionPhoto = $$props.heroSectionPhoto);
    		if ('members' in $$props) $$invalidate(2, members = $$props.members);
    		if ('membersNames' in $$props) $$invalidate(3, membersNames = $$props.membersNames);
    		if ('companyValues' in $$props) $$invalidate(4, companyValues = $$props.companyValues);
    		if ('companyPhoto' in $$props) $$invalidate(5, companyPhoto = $$props.companyPhoto);
    		if ('openJobs' in $$props) $$invalidate(0, openJobs = $$props.openJobs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [openJobs, heroSectionPhoto, members, membersNames, companyValues, companyPhoto];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* node_modules\svelte-seo\src\SvelteSeo.svelte generated by Svelte v3.49.0 */

    const file = "node_modules\\svelte-seo\\src\\SvelteSeo.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (14:2) {#if title}
    function create_if_block_29(ctx) {
    	document.title = /*title*/ ctx[0];
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_29.name,
    		type: "if",
    		source: "(14:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (25:2) {#if description}
    function create_if_block_28(ctx) {
    	let meta;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "description");
    			attr_dev(meta, "content", /*description*/ ctx[3]);
    			add_location(meta, file, 25, 4, 645);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*description*/ 8) {
    				attr_dev(meta, "content", /*description*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_28.name,
    		type: "if",
    		source: "(25:2) {#if description}",
    		ctx
    	});

    	return block;
    }

    // (29:2) {#if canonical}
    function create_if_block_27(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "canonical");
    			attr_dev(link, "href", /*canonical*/ ctx[5]);
    			add_location(link, file, 29, 4, 726);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*canonical*/ 32) {
    				attr_dev(link, "href", /*canonical*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_27.name,
    		type: "if",
    		source: "(29:2) {#if canonical}",
    		ctx
    	});

    	return block;
    }

    // (33:2) {#if keywords}
    function create_if_block_26(ctx) {
    	let meta;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "keywords");
    			attr_dev(meta, "content", /*keywords*/ ctx[4]);
    			add_location(meta, file, 33, 4, 797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*keywords*/ 16) {
    				attr_dev(meta, "content", /*keywords*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_26.name,
    		type: "if",
    		source: "(33:2) {#if keywords}",
    		ctx
    	});

    	return block;
    }

    // (37:2) {#if openGraph}
    function create_if_block_10(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let if_block5_anchor;
    	let if_block0 = /*openGraph*/ ctx[6].title && create_if_block_25(ctx);
    	let if_block1 = /*openGraph*/ ctx[6].description && create_if_block_24(ctx);
    	let if_block2 = (/*openGraph*/ ctx[6].url || /*canonical*/ ctx[5]) && create_if_block_23(ctx);
    	let if_block3 = /*openGraph*/ ctx[6].type && create_if_block_22(ctx);
    	let if_block4 = /*openGraph*/ ctx[6].article && create_if_block_15(ctx);
    	let if_block5 = /*openGraph*/ ctx[6].images && /*openGraph*/ ctx[6].images.length && create_if_block_11(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			if_block5_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, if_block5_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*openGraph*/ ctx[6].title) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_25(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*openGraph*/ ctx[6].description) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_24(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*openGraph*/ ctx[6].url || /*canonical*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_23(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*openGraph*/ ctx[6].type) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_22(ctx);
    					if_block3.c();
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*openGraph*/ ctx[6].article) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_15(ctx);
    					if_block4.c();
    					if_block4.m(t4.parentNode, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*openGraph*/ ctx[6].images && /*openGraph*/ ctx[6].images.length) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_11(ctx);
    					if_block5.c();
    					if_block5.m(if_block5_anchor.parentNode, if_block5_anchor);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(if_block5_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(37:2) {#if openGraph}",
    		ctx
    	});

    	return block;
    }

    // (38:4) {#if openGraph.title}
    function create_if_block_25(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:title");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[6].title);
    			add_location(meta, file, 38, 8, 902);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[6].title)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_25.name,
    		type: "if",
    		source: "(38:4) {#if openGraph.title}",
    		ctx
    	});

    	return block;
    }

    // (42:4) {#if openGraph.description}
    function create_if_block_24(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:description");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[6].description);
    			add_location(meta, file, 42, 6, 1006);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[6].description)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_24.name,
    		type: "if",
    		source: "(42:4) {#if openGraph.description}",
    		ctx
    	});

    	return block;
    }

    // (46:4) {#if openGraph.url || canonical}
    function create_if_block_23(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:url");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[6].url || /*canonical*/ ctx[5]);
    			add_location(meta, file, 46, 6, 1127);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph, canonical*/ 96 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[6].url || /*canonical*/ ctx[5])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_23.name,
    		type: "if",
    		source: "(46:4) {#if openGraph.url || canonical}",
    		ctx
    	});

    	return block;
    }

    // (50:4) {#if openGraph.type}
    function create_if_block_22(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:type");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[6].type.toLowerCase());
    			add_location(meta, file, 50, 6, 1233);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[6].type.toLowerCase())) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(50:4) {#if openGraph.type}",
    		ctx
    	});

    	return block;
    }

    // (54:4) {#if openGraph.article}
    function create_if_block_15(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let if_block5_anchor;
    	let if_block0 = /*openGraph*/ ctx[6].article.publishedTime && create_if_block_21(ctx);
    	let if_block1 = /*openGraph*/ ctx[6].article.modifiedTime && create_if_block_20(ctx);
    	let if_block2 = /*openGraph*/ ctx[6].article.expirationTime && create_if_block_19(ctx);
    	let if_block3 = /*openGraph*/ ctx[6].article.section && create_if_block_18(ctx);
    	let if_block4 = /*openGraph*/ ctx[6].article.authors && /*openGraph*/ ctx[6].article.authors.length && create_if_block_17(ctx);
    	let if_block5 = /*openGraph*/ ctx[6].article.tags && /*openGraph*/ ctx[6].article.tags.length && create_if_block_16(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			if_block5_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, if_block5_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*openGraph*/ ctx[6].article.publishedTime) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_21(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*openGraph*/ ctx[6].article.modifiedTime) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_20(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*openGraph*/ ctx[6].article.expirationTime) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_19(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*openGraph*/ ctx[6].article.section) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_18(ctx);
    					if_block3.c();
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*openGraph*/ ctx[6].article.authors && /*openGraph*/ ctx[6].article.authors.length) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_17(ctx);
    					if_block4.c();
    					if_block4.m(t4.parentNode, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*openGraph*/ ctx[6].article.tags && /*openGraph*/ ctx[6].article.tags.length) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_16(ctx);
    					if_block5.c();
    					if_block5.m(if_block5_anchor.parentNode, if_block5_anchor);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(if_block5_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(54:4) {#if openGraph.article}",
    		ctx
    	});

    	return block;
    }

    // (55:6) {#if openGraph.article.publishedTime}
    function create_if_block_21(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "article:published_time");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[6].article.publishedTime);
    			add_location(meta, file, 55, 8, 1391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[6].article.publishedTime)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(55:6) {#if openGraph.article.publishedTime}",
    		ctx
    	});

    	return block;
    }

    // (61:6) {#if openGraph.article.modifiedTime}
    function create_if_block_20(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "article:modified_time");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[6].article.modifiedTime);
    			add_location(meta, file, 61, 8, 1560);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[6].article.modifiedTime)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(61:6) {#if openGraph.article.modifiedTime}",
    		ctx
    	});

    	return block;
    }

    // (67:6) {#if openGraph.article.expirationTime}
    function create_if_block_19(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "article:expiration_time");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[6].article.expirationTime);
    			add_location(meta, file, 67, 8, 1729);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[6].article.expirationTime)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(67:6) {#if openGraph.article.expirationTime}",
    		ctx
    	});

    	return block;
    }

    // (73:6) {#if openGraph.article.section}
    function create_if_block_18(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "article:section");
    			attr_dev(meta, "content", meta_content_value = /*openGraph*/ ctx[6].article.section);
    			add_location(meta, file, 73, 8, 1895);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*openGraph*/ ctx[6].article.section)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(73:6) {#if openGraph.article.section}",
    		ctx
    	});

    	return block;
    }

    // (77:6) {#if openGraph.article.authors && openGraph.article.authors.length}
    function create_if_block_17(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*openGraph*/ ctx[6].article.authors;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
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
    			if (dirty & /*openGraph*/ 64) {
    				each_value_2 = /*openGraph*/ ctx[6].article.authors;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(77:6) {#if openGraph.article.authors && openGraph.article.authors.length}",
    		ctx
    	});

    	return block;
    }

    // (78:8) {#each openGraph.article.authors as author}
    function create_each_block_2(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "article:author");
    			attr_dev(meta, "content", meta_content_value = /*author*/ ctx[17]);
    			add_location(meta, file, 78, 10, 2116);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*author*/ ctx[17])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(78:8) {#each openGraph.article.authors as author}",
    		ctx
    	});

    	return block;
    }

    // (83:6) {#if openGraph.article.tags && openGraph.article.tags.length}
    function create_if_block_16(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*openGraph*/ ctx[6].article.tags;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
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
    			if (dirty & /*openGraph*/ 64) {
    				each_value_1 = /*openGraph*/ ctx[6].article.tags;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(83:6) {#if openGraph.article.tags && openGraph.article.tags.length}",
    		ctx
    	});

    	return block;
    }

    // (84:8) {#each openGraph.article.tags as tag}
    function create_each_block_1(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "article:tag");
    			attr_dev(meta, "content", meta_content_value = /*tag*/ ctx[14]);
    			add_location(meta, file, 84, 10, 2321);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*tag*/ ctx[14])) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(84:8) {#each openGraph.article.tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (90:4) {#if openGraph.images && openGraph.images.length}
    function create_if_block_11(ctx) {
    	let each_1_anchor;
    	let each_value = /*openGraph*/ ctx[6].images;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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
    			if (dirty & /*openGraph*/ 64) {
    				each_value = /*openGraph*/ ctx[6].images;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(90:4) {#if openGraph.images && openGraph.images.length}",
    		ctx
    	});

    	return block;
    }

    // (93:8) {#if image.alt}
    function create_if_block_14(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:image:alt");
    			attr_dev(meta, "content", meta_content_value = /*image*/ ctx[11].alt);
    			add_location(meta, file, 93, 10, 2591);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*image*/ ctx[11].alt)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(93:8) {#if image.alt}",
    		ctx
    	});

    	return block;
    }

    // (96:8) {#if image.width}
    function create_if_block_13(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:image:width");
    			attr_dev(meta, "content", meta_content_value = /*image*/ ctx[11].width.toString());
    			add_location(meta, file, 96, 10, 2694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*image*/ ctx[11].width.toString())) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(96:8) {#if image.width}",
    		ctx
    	});

    	return block;
    }

    // (99:8) {#if image.height}
    function create_if_block_12(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "property", "og:image:height");
    			attr_dev(meta, "content", meta_content_value = /*image*/ ctx[11].height.toString());
    			add_location(meta, file, 99, 10, 2813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*image*/ ctx[11].height.toString())) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(99:8) {#if image.height}",
    		ctx
    	});

    	return block;
    }

    // (91:6) {#each openGraph.images as image}
    function create_each_block(ctx) {
    	let meta;
    	let meta_content_value;
    	let t0;
    	let t1;
    	let t2;
    	let if_block2_anchor;
    	let if_block0 = /*image*/ ctx[11].alt && create_if_block_14(ctx);
    	let if_block1 = /*image*/ ctx[11].width && create_if_block_13(ctx);
    	let if_block2 = /*image*/ ctx[11].height && create_if_block_12(ctx);

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(meta, "property", "og:image");
    			attr_dev(meta, "content", meta_content_value = /*image*/ ctx[11].url);
    			add_location(meta, file, 91, 8, 2508);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openGraph*/ 64 && meta_content_value !== (meta_content_value = /*image*/ ctx[11].url)) {
    				attr_dev(meta, "content", meta_content_value);
    			}

    			if (/*image*/ ctx[11].alt) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_14(ctx);
    					if_block0.c();
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*image*/ ctx[11].width) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_13(ctx);
    					if_block1.c();
    					if_block1.m(t2.parentNode, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*image*/ ctx[11].height) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_12(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(91:6) {#each openGraph.images as image}",
    		ctx
    	});

    	return block;
    }

    // (106:2) {#if twitter}
    function create_if_block_1(ctx) {
    	let meta;
    	let meta_content_value;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let if_block7_anchor;
    	let if_block0 = /*twitter*/ ctx[7].site && create_if_block_9(ctx);
    	let if_block1 = /*twitter*/ ctx[7].title && create_if_block_8(ctx);
    	let if_block2 = /*twitter*/ ctx[7].description && create_if_block_7(ctx);
    	let if_block3 = /*twitter*/ ctx[7].image && create_if_block_6(ctx);
    	let if_block4 = /*twitter*/ ctx[7].imageAlt && create_if_block_5(ctx);
    	let if_block5 = /*twitter*/ ctx[7].player && create_if_block_4(ctx);
    	let if_block6 = /*twitter*/ ctx[7].playerWidth && create_if_block_3(ctx);
    	let if_block7 = /*twitter*/ ctx[7].playerHeight && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			t4 = space();
    			if (if_block4) if_block4.c();
    			t5 = space();
    			if (if_block5) if_block5.c();
    			t6 = space();
    			if (if_block6) if_block6.c();
    			t7 = space();
    			if (if_block7) if_block7.c();
    			if_block7_anchor = empty();
    			attr_dev(meta, "name", "twitter:card");
    			attr_dev(meta, "content", meta_content_value = /*twitter*/ ctx[7].card || "summary_large_image");
    			add_location(meta, file, 106, 4, 2950);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, if_block7_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*twitter*/ 128 && meta_content_value !== (meta_content_value = /*twitter*/ ctx[7].card || "summary_large_image")) {
    				attr_dev(meta, "content", meta_content_value);
    			}

    			if (/*twitter*/ ctx[7].site) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_9(ctx);
    					if_block0.c();
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*twitter*/ ctx[7].title) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_8(ctx);
    					if_block1.c();
    					if_block1.m(t2.parentNode, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*twitter*/ ctx[7].description) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_7(ctx);
    					if_block2.c();
    					if_block2.m(t3.parentNode, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*twitter*/ ctx[7].image) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_6(ctx);
    					if_block3.c();
    					if_block3.m(t4.parentNode, t4);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*twitter*/ ctx[7].imageAlt) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_5(ctx);
    					if_block4.c();
    					if_block4.m(t5.parentNode, t5);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*twitter*/ ctx[7].player) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_4(ctx);
    					if_block5.c();
    					if_block5.m(t6.parentNode, t6);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*twitter*/ ctx[7].playerWidth) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_3(ctx);
    					if_block6.c();
    					if_block6.m(t7.parentNode, t7);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*twitter*/ ctx[7].playerHeight) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_2(ctx);
    					if_block7.c();
    					if_block7.m(if_block7_anchor.parentNode, if_block7_anchor);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(if_block7_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(106:2) {#if twitter}",
    		ctx
    	});

    	return block;
    }

    // (108:4) {#if twitter.site}
    function create_if_block_9(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "twitter:site");
    			attr_dev(meta, "content", meta_content_value = /*twitter*/ ctx[7].site);
    			add_location(meta, file, 108, 6, 3056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*twitter*/ 128 && meta_content_value !== (meta_content_value = /*twitter*/ ctx[7].site)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(108:4) {#if twitter.site}",
    		ctx
    	});

    	return block;
    }

    // (114:4) {#if twitter.title}
    function create_if_block_8(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "twitter:title");
    			attr_dev(meta, "content", meta_content_value = /*twitter*/ ctx[7].title);
    			add_location(meta, file, 114, 6, 3170);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*twitter*/ 128 && meta_content_value !== (meta_content_value = /*twitter*/ ctx[7].title)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(114:4) {#if twitter.title}",
    		ctx
    	});

    	return block;
    }

    // (120:4) {#if twitter.description}
    function create_if_block_7(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "twitter:description");
    			attr_dev(meta, "content", meta_content_value = /*twitter*/ ctx[7].description);
    			add_location(meta, file, 120, 6, 3292);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*twitter*/ 128 && meta_content_value !== (meta_content_value = /*twitter*/ ctx[7].description)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(120:4) {#if twitter.description}",
    		ctx
    	});

    	return block;
    }

    // (126:4) {#if twitter.image}
    function create_if_block_6(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "twitter:image");
    			attr_dev(meta, "content", meta_content_value = /*twitter*/ ctx[7].image);
    			add_location(meta, file, 126, 6, 3420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*twitter*/ 128 && meta_content_value !== (meta_content_value = /*twitter*/ ctx[7].image)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(126:4) {#if twitter.image}",
    		ctx
    	});

    	return block;
    }

    // (132:5) {#if twitter.imageAlt}
    function create_if_block_5(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "twitter:image:alt");
    			attr_dev(meta, "content", meta_content_value = /*twitter*/ ctx[7].imageAlt);
    			add_location(meta, file, 132, 6, 3540);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*twitter*/ 128 && meta_content_value !== (meta_content_value = /*twitter*/ ctx[7].imageAlt)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(132:5) {#if twitter.imageAlt}",
    		ctx
    	});

    	return block;
    }

    // (138:4) {#if twitter.player}
    function create_if_block_4(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "twitter:player");
    			attr_dev(meta, "content", meta_content_value = /*twitter*/ ctx[7].player);
    			add_location(meta, file, 138, 6, 3664);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*twitter*/ 128 && meta_content_value !== (meta_content_value = /*twitter*/ ctx[7].player)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(138:4) {#if twitter.player}",
    		ctx
    	});

    	return block;
    }

    // (144:5) {#if twitter.playerWidth}
    function create_if_block_3(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "twitter:player:width");
    			attr_dev(meta, "content", meta_content_value = /*twitter*/ ctx[7].playerWidth);
    			add_location(meta, file, 144, 6, 3789);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*twitter*/ 128 && meta_content_value !== (meta_content_value = /*twitter*/ ctx[7].playerWidth)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(144:5) {#if twitter.playerWidth}",
    		ctx
    	});

    	return block;
    }

    // (150:4) {#if twitter.playerHeight}
    function create_if_block_2(ctx) {
    	let meta;
    	let meta_content_value;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			attr_dev(meta, "name", "twitter:player:height");
    			attr_dev(meta, "content", meta_content_value = /*twitter*/ ctx[7].playerHeight);
    			add_location(meta, file, 150, 6, 3925);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, meta, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*twitter*/ 128 && meta_content_value !== (meta_content_value = /*twitter*/ ctx[7].playerHeight)) {
    				attr_dev(meta, "content", meta_content_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(meta);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(150:4) {#if twitter.playerHeight}",
    		ctx
    	});

    	return block;
    }

    // (158:2) {#if jsonLd}
    function create_if_block(ctx) {
    	let html_tag;

    	let raw_value = `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		.../*jsonLd*/ ctx[8]
	}) + "<"}/script>` + "";

    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*jsonLd*/ 256 && raw_value !== (raw_value = `<script type="application/ld+json">${JSON.stringify({
				"@context": "https://schema.org",
				.../*jsonLd*/ ctx[8]
			}) + "<"}/script>` + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(158:2) {#if jsonLd}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let meta0;
    	let meta0_content_value;
    	let meta1;
    	let meta1_content_value;
    	let if_block1_anchor;
    	let if_block2_anchor;
    	let if_block3_anchor;
    	let if_block4_anchor;
    	let if_block5_anchor;
    	let if_block6_anchor;
    	let current;
    	let if_block0 = /*title*/ ctx[0] && create_if_block_29(ctx);
    	let if_block1 = /*description*/ ctx[3] && create_if_block_28(ctx);
    	let if_block2 = /*canonical*/ ctx[5] && create_if_block_27(ctx);
    	let if_block3 = /*keywords*/ ctx[4] && create_if_block_26(ctx);
    	let if_block4 = /*openGraph*/ ctx[6] && create_if_block_10(ctx);
    	let if_block5 = /*twitter*/ ctx[7] && create_if_block_1(ctx);
    	let if_block6 = /*jsonLd*/ ctx[8] && create_if_block(ctx);
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			meta0 = element("meta");
    			meta1 = element("meta");
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			if (if_block4) if_block4.c();
    			if_block4_anchor = empty();
    			if (if_block5) if_block5.c();
    			if_block5_anchor = empty();
    			if (if_block6) if_block6.c();
    			if_block6_anchor = empty();
    			if (default_slot) default_slot.c();
    			attr_dev(meta0, "name", "robots");
    			attr_dev(meta0, "content", meta0_content_value = `${/*noindex*/ ctx[1] ? 'noindex' : 'index'},${/*nofollow*/ ctx[2] ? 'nofollow' : 'follow'}`);
    			add_location(meta0, file, 17, 2, 391);
    			attr_dev(meta1, "name", "googlebot");
    			attr_dev(meta1, "content", meta1_content_value = `${/*noindex*/ ctx[1] ? 'noindex' : 'index'},${/*nofollow*/ ctx[2] ? 'nofollow' : 'follow'}`);
    			add_location(meta1, file, 20, 2, 505);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(document.head, null);
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			if (if_block1) if_block1.m(document.head, null);
    			append_dev(document.head, if_block1_anchor);
    			if (if_block2) if_block2.m(document.head, null);
    			append_dev(document.head, if_block2_anchor);
    			if (if_block3) if_block3.m(document.head, null);
    			append_dev(document.head, if_block3_anchor);
    			if (if_block4) if_block4.m(document.head, null);
    			append_dev(document.head, if_block4_anchor);
    			if (if_block5) if_block5.m(document.head, null);
    			append_dev(document.head, if_block5_anchor);
    			if (if_block6) if_block6.m(document.head, null);
    			append_dev(document.head, if_block6_anchor);

    			if (default_slot) {
    				default_slot.m(document.head, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[0]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_29(ctx);
    					if_block0.c();
    					if_block0.m(meta0.parentNode, meta0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*noindex, nofollow*/ 6 && meta0_content_value !== (meta0_content_value = `${/*noindex*/ ctx[1] ? 'noindex' : 'index'},${/*nofollow*/ ctx[2] ? 'nofollow' : 'follow'}`)) {
    				attr_dev(meta0, "content", meta0_content_value);
    			}

    			if (!current || dirty & /*noindex, nofollow*/ 6 && meta1_content_value !== (meta1_content_value = `${/*noindex*/ ctx[1] ? 'noindex' : 'index'},${/*nofollow*/ ctx[2] ? 'nofollow' : 'follow'}`)) {
    				attr_dev(meta1, "content", meta1_content_value);
    			}

    			if (/*description*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_28(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*canonical*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_27(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*keywords*/ ctx[4]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_26(ctx);
    					if_block3.c();
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*openGraph*/ ctx[6]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_10(ctx);
    					if_block4.c();
    					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*twitter*/ ctx[7]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_1(ctx);
    					if_block5.c();
    					if_block5.m(if_block5_anchor.parentNode, if_block5_anchor);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*jsonLd*/ ctx[8]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block(ctx);
    					if_block6.c();
    					if_block6.m(if_block6_anchor.parentNode, if_block6_anchor);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			detach_dev(meta0);
    			detach_dev(meta1);
    			if (if_block1) if_block1.d(detaching);
    			detach_dev(if_block1_anchor);
    			if (if_block2) if_block2.d(detaching);
    			detach_dev(if_block2_anchor);
    			if (if_block3) if_block3.d(detaching);
    			detach_dev(if_block3_anchor);
    			if (if_block4) if_block4.d(detaching);
    			detach_dev(if_block4_anchor);
    			if (if_block5) if_block5.d(detaching);
    			detach_dev(if_block5_anchor);
    			if (if_block6) if_block6.d(detaching);
    			detach_dev(if_block6_anchor);
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots('SvelteSeo', slots, ['default']);
    	let { title = undefined } = $$props;
    	let { noindex = false } = $$props;
    	let { nofollow = false } = $$props;
    	let { description = undefined } = $$props;
    	let { keywords = undefined } = $$props;
    	let { canonical = undefined } = $$props;
    	let { openGraph = undefined } = $$props;
    	let { twitter = undefined } = $$props;
    	let { jsonLd = undefined } = $$props;

    	const writable_props = [
    		'title',
    		'noindex',
    		'nofollow',
    		'description',
    		'keywords',
    		'canonical',
    		'openGraph',
    		'twitter',
    		'jsonLd'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvelteSeo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('noindex' in $$props) $$invalidate(1, noindex = $$props.noindex);
    		if ('nofollow' in $$props) $$invalidate(2, nofollow = $$props.nofollow);
    		if ('description' in $$props) $$invalidate(3, description = $$props.description);
    		if ('keywords' in $$props) $$invalidate(4, keywords = $$props.keywords);
    		if ('canonical' in $$props) $$invalidate(5, canonical = $$props.canonical);
    		if ('openGraph' in $$props) $$invalidate(6, openGraph = $$props.openGraph);
    		if ('twitter' in $$props) $$invalidate(7, twitter = $$props.twitter);
    		if ('jsonLd' in $$props) $$invalidate(8, jsonLd = $$props.jsonLd);
    		if ('$$scope' in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		title,
    		noindex,
    		nofollow,
    		description,
    		keywords,
    		canonical,
    		openGraph,
    		twitter,
    		jsonLd
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('noindex' in $$props) $$invalidate(1, noindex = $$props.noindex);
    		if ('nofollow' in $$props) $$invalidate(2, nofollow = $$props.nofollow);
    		if ('description' in $$props) $$invalidate(3, description = $$props.description);
    		if ('keywords' in $$props) $$invalidate(4, keywords = $$props.keywords);
    		if ('canonical' in $$props) $$invalidate(5, canonical = $$props.canonical);
    		if ('openGraph' in $$props) $$invalidate(6, openGraph = $$props.openGraph);
    		if ('twitter' in $$props) $$invalidate(7, twitter = $$props.twitter);
    		if ('jsonLd' in $$props) $$invalidate(8, jsonLd = $$props.jsonLd);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		noindex,
    		nofollow,
    		description,
    		keywords,
    		canonical,
    		openGraph,
    		twitter,
    		jsonLd,
    		$$scope,
    		slots
    	];
    }

    class SvelteSeo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			title: 0,
    			noindex: 1,
    			nofollow: 2,
    			description: 3,
    			keywords: 4,
    			canonical: 5,
    			openGraph: 6,
    			twitter: 7,
    			jsonLd: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvelteSeo",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get title() {
    		throw new Error("<SvelteSeo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<SvelteSeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noindex() {
    		throw new Error("<SvelteSeo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noindex(value) {
    		throw new Error("<SvelteSeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nofollow() {
    		throw new Error("<SvelteSeo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nofollow(value) {
    		throw new Error("<SvelteSeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<SvelteSeo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<SvelteSeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywords() {
    		throw new Error("<SvelteSeo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywords(value) {
    		throw new Error("<SvelteSeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get canonical() {
    		throw new Error("<SvelteSeo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set canonical(value) {
    		throw new Error("<SvelteSeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openGraph() {
    		throw new Error("<SvelteSeo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openGraph(value) {
    		throw new Error("<SvelteSeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get twitter() {
    		throw new Error("<SvelteSeo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set twitter(value) {
    		throw new Error("<SvelteSeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get jsonLd() {
    		throw new Error("<SvelteSeo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set jsonLd(value) {
    		throw new Error("<SvelteSeo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const title = "ELO7 | Extraordinariamente criativo. ";

    const description = "Quer fazer parte do maior site de produtos autorais e criativos do Brasil e que oferece tecnologias modernas para nossa comunidade de vendedores e compradores? Inscreva-se e venha fazer parte deste time que é #foradeserie!";


    const SEO = {
        title: title,
        description: description,
        canonical: 'https://www.elo7.com.br/',
        openGraph:{
            type: 'website',
            locale: 'pt_BR',
            url: 'https://www.elo7.com.br/',
            title: 'Elo7 - Temos vagas!',
            description: description,
            images:[
                {
                    url: 'https://s3-sa-east-1.amazonaws.com/prod-jobsite-files.kenoby.com/uploads/Elo7-1632767633-4jpg.jpg',
                    alt: title,
                    width: 1280,
                    height: 720,
                },
            ],
        },
    };

    /* src\App.svelte generated by Svelte v3.49.0 */

    function create_fragment(ctx) {
    	let svelteseo;
    	let t;
    	let home;
    	let current;
    	const svelteseo_spread_levels = [SEO];
    	let svelteseo_props = {};

    	for (let i = 0; i < svelteseo_spread_levels.length; i += 1) {
    		svelteseo_props = assign(svelteseo_props, svelteseo_spread_levels[i]);
    	}

    	svelteseo = new SvelteSeo({ props: svelteseo_props, $$inline: true });
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(svelteseo.$$.fragment);
    			t = space();
    			create_component(home.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(svelteseo, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svelteseo_changes = (dirty & /*SEO*/ 0)
    			? get_spread_update(svelteseo_spread_levels, [get_spread_object(SEO)])
    			: {};

    			svelteseo.$set(svelteseo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svelteseo.$$.fragment, local);
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svelteseo.$$.fragment, local);
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svelteseo, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(home, detaching);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Home, SvelteSeo, SEO });
    	return [];
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
