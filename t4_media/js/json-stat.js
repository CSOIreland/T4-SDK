/*

JSON-stat Javascript Toolkit v. 0.12.2 (JSON-stat v. 2.0 ready)
http://json-stat.com
https://github.com/badosa/JSON-stat

Copyright 2016 Xavier Badosa (http://xavierbadosa.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied. See the License for the specific language governing
permissions and limitations under the License.

*/

function JSONstat(t, e, n) { return window === this ? new JSONstat.jsonstat(t, e, n) : void 0 }
var JSONstat = JSONstat || {};
JSONstat.version = "0.12.2",
    function() { "use strict";

        function t(t) { return "[object Array]" === Object.prototype.toString.call(t) }

        function e(e, n, i) { var r, s, l, o, a = function(t, e, n) { var i, r, s = e !== !1; if (n = e ? n : !0, window.XDomainRequest && /^(http(s)?:)?\/\//.test(t)) { if (!s) return;
                        r = new XDomainRequest, r.onload = function() { i = JSON.parse(r.responseText), n ? e.call(JSONstat(i)) : e.call(i) }, r.open("GET", t), r.send() } else if (r = new XMLHttpRequest, r.onreadystatechange = function() { if (4 === r.readyState) { var t = r.status;
                                i = t && r.responseText && (t >= 200 && 300 > t || 304 === t) ? JSON.parse(r.responseText) : null, s && (n ? e.call(JSONstat(i)) : e.call(i)) } }, r.open("GET", t, s), r.send(null), !s) return i },
                u = function(e, n) { var i, r = []; if ("string" == typeof e && (e = [e]), t(e)) { if (e.length === n) return e; if (1 === e.length) { for (i = 0; n > i; i++) r.push(e[0]); return r } } for (i = 0; n > i; i++) { var s = void 0 === e[i] ? null : e[i];
                        r.push(s) } return r },
                h = function(e) { var n = void 0 === e.index ? e.label : e.index; return t(n) ? n.length : Object.keys(n).length }; if (this.length = 0, this.id = [], null !== e && void 0 !== e) switch (this["class"] = e["class"] || "bundle", this["class"]) {
                case "bundle":
                    var f = [],
                        c = 0; if (this.error = null, this.length = 0, "string" == typeof e && e.length > 0 && (e = a(e, "function" == typeof n ? n : !1, void 0 === i ? !0 : i)), null === e || "object" != typeof e) return this["class"] = null, void(void 0 === e && (delete this.id, delete this["class"], delete this.error, delete this.length)); if (e.hasOwnProperty("error")) return void(this.error = e.error); if ("dataset" === e["class"] || "collection" === e["class"] || "dimension" === e["class"]) return JSONstat(e); for (s in e) c++, f.push(s);
                    this.__tree__ = e, this.length = c, this.id = f; break;
                case "dataset":
                    e.hasOwnProperty("__tree__") ? this.__tree__ = r = e.__tree__ : this.__tree__ = r = e, this.label = r.label || null, this.note = r.note || null, this.link = r.link || null, this.href = r.href || null, this.updated = r.updated || null, this.source = r.source || null, this.extension = r.extension || null; var d, v = 0,
                        p = r.size || r.dimension && r.dimension.size; if (this.size = p, r.hasOwnProperty("value") && t(r.value)) v = r.value.length;
                    else { var y = 1; for (d = p.length; d--;) y *= p[d];
                        v = y } if (this.value = u(r.value, v), this.status = r.hasOwnProperty("status") ? u(r.status, v) : null, r.hasOwnProperty("dimension")) { var g = r.dimension,
                            _ = r.role || !r.version && g.role || null,
                            b = r.id || g.id,
                            m = p.length,
                            O = function(t) { _.hasOwnProperty(t) || (_[t] = null) }; if (!t(b) || !t(p) || b.length != m) return; if (this.length = m, this.id = b, _ && (O("time"), O("geo"), O("metric"), O("classification")), _ && null === _.classification) { var w = [],
                                x = ["time", "geo", "metric"],
                                S = function(t, e) { for (var n = e.length; n--;)
                                        if (t === e[n]) return !0;
                                    return !1 }; for (d = 0; 3 > d; d++) { var k = _[x[d]];
                                null !== k && (w = w.concat(k)) } for (_.classification = [], d = 0; m > d; d++) S(b[d], w) || _.classification.push(b[d]);
                            0 === _.classification.length && (_.classification = null) }
                        this.role = _, this.n = v; for (var j = 0, J = this.length; J > j; j++)
                            if (g[b[j]].category.hasOwnProperty("index")) { if (t(g[b[j]].category.index)) { var N = {},
                                        D = g[b[j]].category.index; for (l = D.length, o = 0; l > o; o++) N[D[o]] = o;
                                    g[b[j]].category.index = N } } else { var P = 0;
                                g[b[j]].category.index = {}; for (s in g[b[j]].category.label) g[b[j]].category.index[s] = P++ } } else this.length = 0; break;
                case "dimension":
                    if (!e.hasOwnProperty("__tree__")) return JSONstat({ version: "2.0", "class": "dataset", dimension: { d: e }, id: ["d"], size: [h(e.category)], value: [null] }).Dimension(0);
                    r = e.__tree__; var z = [],
                        T = r.category; if (!r.hasOwnProperty("category")) return; if (!T.hasOwnProperty("label")) { T.label = {}; for (s in T.index) T.label[s] = s } for (s in T.index) z[T.index[s]] = s;
                    this.__tree__ = r, this.label = r.label || null, this.note = r.note || null, this.link = r.link || null, this.href = r.href || null, this.id = z, this.length = z.length, this.role = e.role, this.hierarchy = T.hasOwnProperty("child"), this.extension = r.extension || null; break;
                case "category":
                    var E = e.child;
                    this.id = E, this.length = null === E ? 0 : E.length, this.index = e.index, this.label = e.label, this.note = e.note || null, this.unit = e.unit, this.coordinates = e.coord; break;
                case "collection":
                    if (this.length = 0, this.label = e.label || null, this.note = e.note || null, this.link = e.link || null, this.href = e.href || null, this.updated = e.updated || null, this.source = e.source || null, this.extension = e.extension || null, null !== this.link && e.link.item) { var A = e.link.item; if (this.length = t(A) ? A.length : 0, this.length)
                            for (o = 0; o < this.length; o++) this.id[o] = A[o].href } } }
        Array.prototype.indexOf || (Array.prototype.indexOf = function(t, e) { var n; if (null == this) throw new TypeError('"this" is null or not defined'); var i = Object(this),
                r = i.length >>> 0; if (0 === r) return -1; var s = +e || 0; if (Math.abs(s) === 1 / 0 && (s = 0), s >= r) return -1; for (n = Math.max(s >= 0 ? s : r - Math.abs(s), 0); r > n;) { if (n in i && i[n] === t) return n;
                n++ } return -1 }), Array.prototype.forEach || (Array.prototype.forEach = function(t, e) { var n, i; if (null == this) throw new TypeError(" this is null or not defined"); var r = Object(this),
                s = r.length >>> 0; if ("function" != typeof t) throw new TypeError(t + " is not a function"); for (arguments.length > 1 && (n = e), i = 0; s > i;) { var l;
                i in r && (l = r[i], t.call(n, l, i, r)), i++ } }), Object.keys || (Object.keys = function(t) { var e, n = []; for (e in t) Object.prototype.hasOwnProperty.call(t, e) && n.push(e); return n }), e.prototype.Item = function(t) { if (null === this || "collection" !== this["class"] || !this.length) return null; if ("number" == typeof t) return t > this.length || 0 > t ? null : this.link.item[t]; var e, n = []; if ("object" == typeof t) { if (!t["class"] && !t.follow) return null;
                t["class"] ? e = "dataset" === t["class"] && "boolean" == typeof t.embedded ? t.embedded === !0 ? function(t, e, i) { var r = t.link.item[e];
                    i["class"] === r["class"] && r.id && r.size && r.dimension && n.push(r) } : function(t, e, i) { var r = t.link.item[e];
                    i["class"] !== r["class"] || r.id && r.size && r.dimension || n.push(r) } : function(t, e, i) { i["class"] === t.link.item[e]["class"] && n.push(t.link.item[e]) } : t.follow && (e = function(t, e) { n.push(JSONstat(t.id[e])) }) } else e = function(t, e) { n.push(t.link.item[e]) }; for (var i = 0; i < this.length; i++) e(this, i, t); return n }, e.prototype.Dataset = function(t) { if (null === this) return null; if ("dataset" === this["class"]) return void 0 !== t ? this : [this]; var n, i = [],
                r = 0; if ("collection" === this["class"]) { var s = this.Item({ "class": "dataset", embedded: !0 }); if (void 0 === t) { for (n = s.length; n > r; r++) i.push(JSONstat(s[r])); return i } if ("number" == typeof t && t >= 0 && t < s.length) return JSONstat(s[t]); if ("string" == typeof t)
                    for (n = s.length; n > r; r++)
                        if (s[r].href === t) return JSONstat(s[r]);
                return null } if ("bundle" !== this["class"]) return null; if (void 0 === t) { for (n = this.id.length; n > r; r++) i.push(this.Dataset(this.id[r])); return i } if ("number" == typeof t) { var l = this.id[t]; return void 0 !== l ? this.Dataset(l) : null } var o = this.__tree__[t]; return void 0 === o ? null : new e({ "class": "dataset", __tree__: o }) }, e.prototype.Dimension = function(t, n) { n = "boolean" == typeof n ? n : !0; var i, r = [],
                s = this.id.length,
                l = function(t, e) { if (null !== t)
                        for (var n in t)
                            for (var i = null !== t[n] ? t[n].length : 0; i--;)
                                if (t[n][i] === e) return n;
                    return null }; if (null === this || "dataset" !== this["class"]) return null; if (void 0 === t) { for (i = 0; s > i; i++) r.push(this.Dimension(this.id[i])); return r } if ("number" == typeof t) { var o = this.id[t]; return void 0 !== o ? this.Dimension(o, n) : null } var a = this.role; if ("object" == typeof t) { if (t.hasOwnProperty("role")) { for (i = 0; s > i; i++) { var u = this.id[i];
                        l(a, u) === t.role && r.push(this.Dimension(u, n)) } return void 0 === r[0] ? null : r } return null } var h = this.__tree__.dimension; if (void 0 === h) return null; var f = h[t]; return void 0 === f ? null : n ? new e({ "class": "dimension", __tree__: f, role: l(a, t) }) : function(t, e) { var n = []; for (var i in t) n[t[i]] = e[i]; return n }(f.category.index, f.category.label) }, e.prototype.Category = function(t) { if (null === this || "dimension" !== this["class"]) return null; if (void 0 === t) { for (var n = [], i = 0, r = this.id.length; r > i; i++) n.push(this.Category(this.id[i])); return n } if ("number" == typeof t) { var s = this.id[t]; return void 0 !== s ? this.Category(s) : null } var l = this.__tree__.category; if (void 0 === l) return null; var o = l.index[t]; if (void 0 === o) return null; var a = l.unit && l.unit[t] || null,
                u = l.coordinates && l.coordinates[t] || null,
                h = l.child && l.child[t] || null,
                f = l.note && l.note[t] || null; return new e({ "class": "category", index: o, label: l.label[t], note: f, child: h, unit: a, coord: u }) }, e.prototype.Slice = function(e) { if (null === this || "dataset" !== this["class"]) return null; if (void 0 === e) return this; if (!t(e)) { var n, i = []; for (n in e) i.push([n, e[n]]);
                e = i } var r = this,
                s = e.length,
                l = r.toTable({ field: "id", content: "id", status: !0 }),
                o = r.status,
                a = l.shift(),
                u = !1,
                h = [],
                f = [],
                c = [],
                d = []; return e.forEach(function(t) { var e = r.Dimension(t[0]); if (null === e) return void(u = !0); var n = e.id.indexOf(t[1]); return -1 === n ? void(u = !0) : (c.push([r.id.indexOf(t[0]), n]), void d.push(e.Category(n).label)) }), u ? null : (l.forEach(function(t) { var n, i = {},
                    r = 0; for (n = t.length; n--;) i[a[n]] = t[n];
                e.forEach(function(t) { i[t[0]] === t[1] && r++ }), s === r && (h.push(i.value), f.push(i.status)) }), r.n = h.length, r.value = r.__tree__.value = h, r.status = r.__tree__.status = null !== o ? f : null, e.forEach(function(t, e) { r.size[c[e][0]] = 1, r.__tree__.dimension[t[0]].category.index = {}, r.__tree__.dimension[t[0]].category.index[t[1]] = 0, r.__tree__.dimension[t[0]].category.label = {}, r.__tree__.dimension[t[0]].category.label[t[1]] = d[e] }), r) }, e.prototype.Data = function(e, n) { var i, r, s = [],
                l = function(t) { for (var e in t)
                        if (t.hasOwnProperty(e)) return e },
                o = function(t, e, n) { var i, r = [],
                        s = {},
                        o = t.dimension,
                        a = t.id || o.id,
                        u = t.size || o && o.size; if ("array" === n) { for (i = e.length; i--;) s[e[i][0]] = e[i][1];
                        e = s } for (var h = 0, f = a.length; f > h; h++) { var c = a[h],
                            d = e[c];
                        r.push("string" == typeof d ? d : 1 === u[h] ? l(o[c].category.index) : null) } return r }; if (null === this || "dataset" !== this["class"]) return null; if (void 0 === e) { for (r = this.value.length, i = 0; r > i; i++) s.push(this.Data(i)); return s } if ("boolean" != typeof n && (n = !0), "number" == typeof e) { var a = this.value[e]; return void 0 === a ? null : n ? { value: a, status: this.status ? this.status[e] : null } : a } var u = "object",
                h = this.__tree__,
                f = h.size || h.dimension && h.dimension.size,
                c = f.length; if (t(e)) { if (!t(e[0])) { if (this.length !== e.length) return null; var d = 1,
                        v = 0,
                        p = [],
                        y = []; for (i = 0; c > i; i++)
                        if (void 0 !== e[i]) { if ("number" != typeof e[i] || e[i] >= f[i]) return null;
                            d *= i > 0 ? f[c - i] : 1, v += d * e[c - i - 1] } else p.push(i), y.push(f[i]);
                    if (p.length > 1) return null; if (1 === p.length) { for (var g = 0, _ = y[0]; _ > g; g++) { var b = []; for (i = 0; c > i; i++) i !== p[0] ? b.push(e[i]) : b.push(g);
                            s.push(this.Data(b, n)) } return s } return n ? { value: this.value[v], status: this.status ? this.status[v] : null } : this.value[v] }
                u = "array" } var m = o(h, e, u),
                O = [],
                w = h.dimension,
                x = h.id || w.id; for (i = 0, r = m.length; r > i; i++) O.push(w[x[i]].category.index[m[i]]); return this.Data(O, n) }, e.prototype.toTable = function(t, e) { if (null === this || "dataset" !== this["class"]) return null;
            1 == arguments.length && "function" == typeof t && (e = t, t = null); var n, i, r, s, l, o = this.__tree__; if (t = t || { field: "label", content: "label", vlabel: "Value", slabel: "Status", type: "array", status: !1 }, "function" == typeof e) { n = this.toTable(t); var a = [],
                    u = "array" !== t.type ? 0 : 1,
                    h = "object" !== t.type ? n.slice(u) : n.rows.slice(0); for (l = h.length, i = 0; l > i; i++) { var f = e.call(this, h[i], i);
                    void 0 !== f && a.push(f) } return "object" === t.type ? { cols: n.cols, rows: a } : ("array" === t.type && a.unshift(n[0]), a) } if ("arrobj" === t.type) { n = this.toTable({ field: "id", content: t.content, status: t.status }); var c = [],
                    d = n.shift(); for (l = n.length, i = 0; l > i; i++) { var v = {}; for (r = n[i].length; r--;) v[d[r]] = n[i][r];
                    c.push(v) } return c } var p, y, g, _, b = "id" === t.field; if ("object" === t.type) { var m = "number" == typeof this.value[0] || null === this.value[0] ? "number" : "string";
                p = function(t, e) { var n = b && t || e || t;
                    T.push({ id: t, label: n, type: "string" }) }, y = function(t, e, n) { var i = b && "value" || t || "Value",
                        r = b && "status" || e || "Status";
                    n && T.push({ id: "status", label: r, type: "string" }), T.push({ id: "value", label: i, type: m }) }, g = function(t) { B.push({ v: t }) }, _ = function(t) { B.push({ v: t }), E.push({ c: B }) } } else p = function(t, e) { var n = b && t || e || t;
                T.push(n) }, y = function(t, e, n) { var i = b && "value" || t || "Value",
                    r = b && "status" || e || "Status";
                n && T.push(r), T.push(i), z.push(T) }, g = function(t) { B.push(t) }, _ = function(t) { B.push(t), z.push(B) }; var O = o.dimension,
                w = o.id || O.id,
                x = o.size || O.size,
                S = w.length; if (S != x.length) return !1; var k = [],
                j = 1,
                J = 1,
                N = [],
                D = [],
                P = [],
                z = [],
                T = [],
                E = []; for (i = 0; S > i; i++) { var A = w[i],
                    C = O[A].label;
                p(A, C), j *= x[i], J *= x[i]; var M = []; for (r = 0; r < x[i]; r++)
                    for (var V in O[w[i]].category.index)
                        if (O[w[i]].category.index[V] === r) { var q = "id" !== t.content && O[w[i]].category.label ? O[w[i]].category.label[V] : V;
                            M.push(q) }
                k.push(M), N.push(J) } for (y(t.vlabel, t.slabel, t.status), l = k.length, i = 0; l > i; i++) { for (var R = [], X = 0, G = k[i].length; G > X; X++)
                    for (var I = 0; I < j / N[i]; I++) R.push(k[i][X]);
                D.push(R) } for (l = D.length, i = 0; l > i; i++) { var H = [],
                    L = 0; for (s = 0; j > s; s++) H.push(D[i][L]), L++, L === D[i].length && (L = 0);
                P.push(H) } for (s = 0; j > s; s++) { var B = [];
                l = D.length; for (var F = 0; l > F; F++) g(P[F][s]);
                t.status && g(this.status ? this.status[s] : null), _(this.value[s]) } return "object" === t.type ? { cols: T, rows: E } : z }, e.prototype.node = function() { return this.__tree__ }, e.prototype.toString = function() { return this["class"] }, e.prototype.toValue = function() { return this.length }, JSONstat.jsonstat = e }();