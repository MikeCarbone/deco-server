import qe from "crypto";
import re from "node:crypto";
import Ur from "buffer";
var Ci = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, fe = {};
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
fe.parse = Ni;
fe.serialize = Di;
var Oi = Object.prototype.toString, oe = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
function Ni(o, t) {
  if (typeof o != "string")
    throw new TypeError("argument str must be a string");
  for (var r = {}, n = t || {}, f = n.decode || Ui, a = 0; a < o.length; ) {
    var m = o.indexOf("=", a);
    if (m === -1)
      break;
    var g = o.indexOf(";", a);
    if (g === -1)
      g = o.length;
    else if (g < m) {
      a = o.lastIndexOf(";", m - 1) + 1;
      continue;
    }
    var w = o.slice(a, m).trim();
    if (r[w] === void 0) {
      var M = o.slice(m + 1, g).trim();
      M.charCodeAt(0) === 34 && (M = M.slice(1, -1)), r[w] = ji(M, f);
    }
    a = g + 1;
  }
  return r;
}
function Di(o, t, r) {
  var n = r || {}, f = n.encode || $i;
  if (typeof f != "function")
    throw new TypeError("option encode is invalid");
  if (!oe.test(o))
    throw new TypeError("argument name is invalid");
  var a = f(t);
  if (a && !oe.test(a))
    throw new TypeError("argument val is invalid");
  var m = o + "=" + a;
  if (n.maxAge != null) {
    var g = n.maxAge - 0;
    if (isNaN(g) || !isFinite(g))
      throw new TypeError("option maxAge is invalid");
    m += "; Max-Age=" + Math.floor(g);
  }
  if (n.domain) {
    if (!oe.test(n.domain))
      throw new TypeError("option domain is invalid");
    m += "; Domain=" + n.domain;
  }
  if (n.path) {
    if (!oe.test(n.path))
      throw new TypeError("option path is invalid");
    m += "; Path=" + n.path;
  }
  if (n.expires) {
    var w = n.expires;
    if (!Li(w) || isNaN(w.valueOf()))
      throw new TypeError("option expires is invalid");
    m += "; Expires=" + w.toUTCString();
  }
  if (n.httpOnly && (m += "; HttpOnly"), n.secure && (m += "; Secure"), n.partitioned && (m += "; Partitioned"), n.priority) {
    var M = typeof n.priority == "string" ? n.priority.toLowerCase() : n.priority;
    switch (M) {
      case "low":
        m += "; Priority=Low";
        break;
      case "medium":
        m += "; Priority=Medium";
        break;
      case "high":
        m += "; Priority=High";
        break;
      default:
        throw new TypeError("option priority is invalid");
    }
  }
  if (n.sameSite) {
    var b = typeof n.sameSite == "string" ? n.sameSite.toLowerCase() : n.sameSite;
    switch (b) {
      case !0:
        m += "; SameSite=Strict";
        break;
      case "lax":
        m += "; SameSite=Lax";
        break;
      case "strict":
        m += "; SameSite=Strict";
        break;
      case "none":
        m += "; SameSite=None";
        break;
      default:
        throw new TypeError("option sameSite is invalid");
    }
  }
  return m;
}
function Ui(o) {
  return o.indexOf("%") !== -1 ? decodeURIComponent(o) : o;
}
function $i(o) {
  return encodeURIComponent(o);
}
function Li(o) {
  return Oi.call(o) === "[object Date]" || o instanceof Date;
}
function ji(o, t) {
  try {
    return t(o);
  } catch {
    return o;
  }
}
const $r = {
  invalidType: "FAST_JWT_INVALID_TYPE",
  //  Invalid token type
  invalidOption: "FAST_JWT_INVALID_OPTION",
  // The option object is not valid
  invalidAlgorithm: "FAST_JWT_INVALID_ALGORITHM",
  //  The token algorithm is invalid
  invalidClaimType: "FAST_JWT_INVALID_CLAIM_TYPE",
  // The claim type is not supported
  invalidClaimValue: "FAST_JWT_INVALID_CLAIM_VALUE",
  // The claim type is not a positive integer or an number array
  invalidKey: "FAST_JWT_INVALID_KEY",
  // The key is not a string or a buffer or is unsupported
  invalidSignature: "FAST_JWT_INVALID_SIGNATURE",
  //  The token signature is invalid
  invalidPayload: "FAST_JWT_INVALID_PAYLOAD",
  // The payload to be decoded must be an object
  malformed: "FAST_JWT_MALFORMED",
  // The token is malformed
  inactive: "FAST_JWT_INACTIVE",
  // The token is not valid yet
  expired: "FAST_JWT_EXPIRED",
  // The token is expired
  missingKey: "FAST_JWT_MISSING_KEY",
  // The key option is missing
  keyFetchingError: "FAST_JWT_KEY_FETCHING_ERROR",
  // Could not retrieve the key
  signError: "FAST_JWT_SIGN_ERROR",
  // Cannot create the signature
  verifyError: "FAST_JWT_VERIFY_ERROR",
  // Cannot verify the signature
  missingRequiredClaim: "FAST_JWT_MISSING_REQUIRED_CLAIM",
  // A required claim is missing
  missingSignature: "FAST_JWT_MISSING_SIGNATURE"
  // The token signature is missing
};
let Qt = class extends Error {
  constructor(t, r, n) {
    if (super(r), Error.captureStackTrace(this, this.constructor), this.code = t, n)
      for (const f in n)
        this[f] = n[f];
  }
};
Qt.codes = $r;
Qt.wrap = function(o, t, r) {
  return o instanceof Qt ? o : new Qt(t, r, { originalError: o });
};
var ie = {
  TokenError: Qt,
  TOKEN_ERROR_CODES: $r
};
const { TokenError: Lt } = ie;
function Ki({ complete: o, checkTyp: t }, r) {
  if (r instanceof Buffer)
    r = r.toString("utf-8");
  else if (typeof r != "string")
    throw new Lt(Lt.codes.invalidType, "The token must be a string or a buffer.");
  const n = r.indexOf("."), f = r.lastIndexOf(".");
  if (n === -1 || n >= f)
    throw new Lt(Lt.codes.malformed, "The token is malformed.");
  let a = !1;
  try {
    const m = JSON.parse(Buffer.from(r.slice(0, n), "base64").toString("utf-8"));
    if (t && m.typ !== t)
      throw new Lt(Lt.codes.invalidType, `The type must be "${t}".`, { header: m });
    a = !0;
    let g = Buffer.from(r.slice(n + 1, f), "base64").toString("utf-8");
    if (g = JSON.parse(g), !g || typeof g != "object")
      throw new Lt(Lt.codes.invalidPayload, "The payload must be an object", { payload: g });
    return o ? { header: m, payload: g, signature: r.slice(f + 1), input: r.slice(0, f) } : g;
  } catch (m) {
    throw Lt.wrap(
      m,
      Lt.codes.malformed,
      `The token ${a ? "payload" : "header"} is not a valid base64url serialized JSON.`
    );
  }
}
var Lr = function(t = {}) {
  const r = t.complete || !1, n = t.checkTyp;
  return Ki.bind(null, { complete: r, checkTyp: n });
};
function jt(o) {
  if (typeof o != "function")
    throw new Error("obliterator/iterator: expecting a function!");
  this.next = o;
}
typeof Symbol < "u" && (jt.prototype[Symbol.iterator] = function() {
  return this;
});
jt.of = function() {
  var o = arguments, t = o.length, r = 0;
  return new jt(function() {
    return r >= t ? { done: !0 } : { done: !1, value: o[r++] };
  });
};
jt.empty = function() {
  var o = new jt(function() {
    return { done: !0 };
  });
  return o;
};
jt.fromSequence = function(o) {
  var t = 0, r = o.length;
  return new jt(function() {
    return t >= r ? { done: !0 } : { done: !1, value: o[t++] };
  });
};
jt.is = function(o) {
  return o instanceof jt ? !0 : typeof o == "object" && o !== null && typeof o.next == "function";
};
var Fi = jt, Ye = {};
Ye.ARRAY_BUFFER_SUPPORT = typeof ArrayBuffer < "u";
Ye.SYMBOL_SUPPORT = typeof Symbol < "u";
var jr = Ye, qi = jr.ARRAY_BUFFER_SUPPORT, Vi = jr.SYMBOL_SUPPORT, Kr = function(t, r) {
  var n, f, a, m, g;
  if (!t)
    throw new Error("obliterator/forEach: invalid iterable.");
  if (typeof r != "function")
    throw new Error("obliterator/forEach: expecting a callback.");
  if (Array.isArray(t) || qi && ArrayBuffer.isView(t) || typeof t == "string" || t.toString() === "[object Arguments]") {
    for (a = 0, m = t.length; a < m; a++)
      r(t[a], a);
    return;
  }
  if (typeof t.forEach == "function") {
    t.forEach(r);
    return;
  }
  if (Vi && Symbol.iterator in t && typeof t.next != "function" && (t = t[Symbol.iterator]()), typeof t.next == "function") {
    for (n = t, a = 0; g = n.next(), g.done !== !0; )
      r(g.value, a), a++;
    return;
  }
  for (f in t)
    t.hasOwnProperty(f) && r(t[f], f);
}, Ze = {};
(function(o) {
  var t = Math.pow(2, 8) - 1, r = Math.pow(2, 16) - 1, n = Math.pow(2, 32) - 1, f = Math.pow(2, 7) - 1, a = Math.pow(2, 15) - 1, m = Math.pow(2, 31) - 1;
  o.getPointerArray = function(w) {
    var M = w - 1;
    if (M <= t)
      return Uint8Array;
    if (M <= r)
      return Uint16Array;
    if (M <= n)
      return Uint32Array;
    throw new Error("mnemonist: Pointer Array of size > 4294967295 is not supported.");
  }, o.getSignedPointerArray = function(w) {
    var M = w - 1;
    return M <= f ? Int8Array : M <= a ? Int16Array : M <= m ? Int32Array : Float64Array;
  }, o.getNumberType = function(w) {
    return w === (w | 0) ? Math.sign(w) === -1 ? w <= 127 && w >= -128 ? Int8Array : w <= 32767 && w >= -32768 ? Int16Array : Int32Array : w <= 255 ? Uint8Array : w <= 65535 ? Uint16Array : Uint32Array : Float64Array;
  };
  var g = {
    Uint8Array: 1,
    Int8Array: 2,
    Uint16Array: 3,
    Int16Array: 4,
    Uint32Array: 5,
    Int32Array: 6,
    Float32Array: 7,
    Float64Array: 8
  };
  o.getMinimalRepresentation = function(w, M) {
    var b = null, _ = 0, I, k, $, F, G;
    for (F = 0, G = w.length; F < G; F++)
      $ = M ? M(w[F]) : w[F], k = o.getNumberType($), I = g[k.name], I > _ && (_ = I, b = k);
    return b;
  }, o.isTypedArray = function(w) {
    return typeof ArrayBuffer < "u" && ArrayBuffer.isView(w);
  }, o.concat = function() {
    var w = 0, M, b, _;
    for (M = 0, _ = arguments.length; M < _; M++)
      w += arguments[M].length;
    var I = new arguments[0].constructor(w);
    for (M = 0, b = 0; M < _; M++)
      I.set(arguments[M], b), b += arguments[M].length;
    return I;
  }, o.indices = function(w) {
    for (var M = o.getPointerArray(w), b = new M(w), _ = 0; _ < w; _++)
      b[_] = _;
    return b;
  };
})(Ze);
var ne = {}, Fr = Kr, qr = Ze;
function Gi(o) {
  return Array.isArray(o) || qr.isTypedArray(o);
}
function We(o) {
  if (typeof o.length == "number")
    return o.length;
  if (typeof o.size == "number")
    return o.size;
}
function Ji(o) {
  var t = We(o), r = typeof t == "number" ? new Array(t) : [], n = 0;
  return Fr(o, function(f) {
    r[n++] = f;
  }), r;
}
function Hi(o) {
  var t = We(o), r = typeof t == "number" ? qr.getPointerArray(t) : Array, n = typeof t == "number" ? new Array(t) : [], f = typeof t == "number" ? new r(t) : [], a = 0;
  return Fr(o, function(m) {
    n[a] = m, f[a] = a++;
  }), [n, f];
}
ne.isArrayLike = Gi;
ne.guessLength = We;
ne.toArray = Ji;
ne.toArrayWithIndices = Hi;
var Xe = Fi, zi = Kr, Yi = Ze, Zi = ne;
function Tt(o, t, r) {
  if (arguments.length < 2 && (r = o, o = null, t = null), this.capacity = r, typeof this.capacity != "number" || this.capacity <= 0)
    throw new Error("mnemonist/lru-cache: capacity should be positive number.");
  if (!isFinite(this.capacity) || Math.floor(this.capacity) !== this.capacity)
    throw new Error("mnemonist/lru-cache: capacity should be a finite positive integer.");
  var n = Yi.getPointerArray(r);
  this.forward = new n(r), this.backward = new n(r), this.K = typeof o == "function" ? new o(r) : new Array(r), this.V = typeof t == "function" ? new t(r) : new Array(r), this.size = 0, this.head = 0, this.tail = 0, this.items = {};
}
Tt.prototype.clear = function() {
  this.size = 0, this.head = 0, this.tail = 0, this.items = {};
};
Tt.prototype.splayOnTop = function(o) {
  var t = this.head;
  if (this.head === o)
    return this;
  var r = this.backward[o], n = this.forward[o];
  return this.tail === o ? this.tail = r : this.backward[n] = r, this.forward[r] = n, this.backward[t] = o, this.head = o, this.forward[o] = t, this;
};
Tt.prototype.set = function(o, t) {
  var r = this.items[o];
  if (typeof r < "u") {
    this.splayOnTop(r), this.V[r] = t;
    return;
  }
  this.size < this.capacity ? r = this.size++ : (r = this.tail, this.tail = this.backward[r], delete this.items[this.K[r]]), this.items[o] = r, this.K[r] = o, this.V[r] = t, this.forward[r] = this.head, this.backward[this.head] = r, this.head = r;
};
Tt.prototype.setpop = function(o, t) {
  var r = null, n = null, f = this.items[o];
  return typeof f < "u" ? (this.splayOnTop(f), r = this.V[f], this.V[f] = t, { evicted: !1, key: o, value: r }) : (this.size < this.capacity ? f = this.size++ : (f = this.tail, this.tail = this.backward[f], r = this.V[f], n = this.K[f], delete this.items[this.K[f]]), this.items[o] = f, this.K[f] = o, this.V[f] = t, this.forward[f] = this.head, this.backward[this.head] = f, this.head = f, n ? { evicted: !0, key: n, value: r } : null);
};
Tt.prototype.has = function(o) {
  return o in this.items;
};
Tt.prototype.get = function(o) {
  var t = this.items[o];
  if (!(typeof t > "u"))
    return this.splayOnTop(t), this.V[t];
};
Tt.prototype.peek = function(o) {
  var t = this.items[o];
  if (!(typeof t > "u"))
    return this.V[t];
};
Tt.prototype.forEach = function(o, t) {
  t = arguments.length > 1 ? t : this;
  for (var r = 0, n = this.size, f = this.head, a = this.K, m = this.V, g = this.forward; r < n; )
    o.call(t, m[f], a[f], this), f = g[f], r++;
};
Tt.prototype.keys = function() {
  var o = 0, t = this.size, r = this.head, n = this.K, f = this.forward;
  return new Xe(function() {
    if (o >= t)
      return { done: !0 };
    var a = n[r];
    return o++, o < t && (r = f[r]), {
      done: !1,
      value: a
    };
  });
};
Tt.prototype.values = function() {
  var o = 0, t = this.size, r = this.head, n = this.V, f = this.forward;
  return new Xe(function() {
    if (o >= t)
      return { done: !0 };
    var a = n[r];
    return o++, o < t && (r = f[r]), {
      done: !1,
      value: a
    };
  });
};
Tt.prototype.entries = function() {
  var o = 0, t = this.size, r = this.head, n = this.K, f = this.V, a = this.forward;
  return new Xe(function() {
    if (o >= t)
      return { done: !0 };
    var m = n[r], g = f[r];
    return o++, o < t && (r = a[r]), {
      done: !1,
      value: [m, g]
    };
  });
};
typeof Symbol < "u" && (Tt.prototype[Symbol.iterator] = Tt.prototype.entries);
Tt.prototype.inspect = function() {
  for (var o = /* @__PURE__ */ new Map(), t = this.entries(), r; r = t.next(), !r.done; )
    o.set(r.value[0], r.value[1]);
  return Object.defineProperty(o, "constructor", {
    value: Tt,
    enumerable: !1
  }), o;
};
typeof Symbol < "u" && (Tt.prototype[Symbol.for("nodejs.util.inspect.custom")] = Tt.prototype.inspect);
Tt.from = function(o, t, r, n) {
  if (arguments.length < 2) {
    if (n = Zi.guessLength(o), typeof n != "number")
      throw new Error("mnemonist/lru-cache.from: could not guess iterable length. Please provide desired capacity as last argument.");
  } else
    arguments.length === 2 && (n = t, t = null, r = null);
  var f = new Tt(t, r, n);
  return zi(o, function(a, m) {
    f.set(m, a);
  }), f;
};
var Vr = Tt, Gr = {}, Qe = { exports: {} };
Qe.exports;
(function(o) {
  (function(t, r) {
    function n(p, e) {
      if (!p)
        throw new Error(e || "Assertion failed");
    }
    function f(p, e) {
      p.super_ = e;
      var s = function() {
      };
      s.prototype = e.prototype, p.prototype = new s(), p.prototype.constructor = p;
    }
    function a(p, e, s) {
      if (a.isBN(p))
        return p;
      this.negative = 0, this.words = null, this.length = 0, this.red = null, p !== null && ((e === "le" || e === "be") && (s = e, e = 10), this._init(p || 0, e || 10, s || "be"));
    }
    typeof t == "object" ? t.exports = a : r.BN = a, a.BN = a, a.wordSize = 26;
    var m;
    try {
      typeof window < "u" && typeof window.Buffer < "u" ? m = window.Buffer : m = require("buffer").Buffer;
    } catch {
    }
    a.isBN = function(e) {
      return e instanceof a ? !0 : e !== null && typeof e == "object" && e.constructor.wordSize === a.wordSize && Array.isArray(e.words);
    }, a.max = function(e, s) {
      return e.cmp(s) > 0 ? e : s;
    }, a.min = function(e, s) {
      return e.cmp(s) < 0 ? e : s;
    }, a.prototype._init = function(e, s, h) {
      if (typeof e == "number")
        return this._initNumber(e, s, h);
      if (typeof e == "object")
        return this._initArray(e, s, h);
      s === "hex" && (s = 16), n(s === (s | 0) && s >= 2 && s <= 36), e = e.toString().replace(/\s+/g, "");
      var u = 0;
      e[0] === "-" && (u++, this.negative = 1), u < e.length && (s === 16 ? this._parseHex(e, u, h) : (this._parseBase(e, s, u), h === "le" && this._initArray(this.toArray(), s, h)));
    }, a.prototype._initNumber = function(e, s, h) {
      e < 0 && (this.negative = 1, e = -e), e < 67108864 ? (this.words = [e & 67108863], this.length = 1) : e < 4503599627370496 ? (this.words = [
        e & 67108863,
        e / 67108864 & 67108863
      ], this.length = 2) : (n(e < 9007199254740992), this.words = [
        e & 67108863,
        e / 67108864 & 67108863,
        1
      ], this.length = 3), h === "le" && this._initArray(this.toArray(), s, h);
    }, a.prototype._initArray = function(e, s, h) {
      if (n(typeof e.length == "number"), e.length <= 0)
        return this.words = [0], this.length = 1, this;
      this.length = Math.ceil(e.length / 3), this.words = new Array(this.length);
      for (var u = 0; u < this.length; u++)
        this.words[u] = 0;
      var d, v, y = 0;
      if (h === "be")
        for (u = e.length - 1, d = 0; u >= 0; u -= 3)
          v = e[u] | e[u - 1] << 8 | e[u - 2] << 16, this.words[d] |= v << y & 67108863, this.words[d + 1] = v >>> 26 - y & 67108863, y += 24, y >= 26 && (y -= 26, d++);
      else if (h === "le")
        for (u = 0, d = 0; u < e.length; u += 3)
          v = e[u] | e[u + 1] << 8 | e[u + 2] << 16, this.words[d] |= v << y & 67108863, this.words[d + 1] = v >>> 26 - y & 67108863, y += 24, y >= 26 && (y -= 26, d++);
      return this.strip();
    };
    function g(p, e) {
      var s = p.charCodeAt(e);
      return s >= 65 && s <= 70 ? s - 55 : s >= 97 && s <= 102 ? s - 87 : s - 48 & 15;
    }
    function w(p, e, s) {
      var h = g(p, s);
      return s - 1 >= e && (h |= g(p, s - 1) << 4), h;
    }
    a.prototype._parseHex = function(e, s, h) {
      this.length = Math.ceil((e.length - s) / 6), this.words = new Array(this.length);
      for (var u = 0; u < this.length; u++)
        this.words[u] = 0;
      var d = 0, v = 0, y;
      if (h === "be")
        for (u = e.length - 1; u >= s; u -= 2)
          y = w(e, s, u) << d, this.words[v] |= y & 67108863, d >= 18 ? (d -= 18, v += 1, this.words[v] |= y >>> 26) : d += 8;
      else {
        var l = e.length - s;
        for (u = l % 2 === 0 ? s + 1 : s; u < e.length; u += 2)
          y = w(e, s, u) << d, this.words[v] |= y & 67108863, d >= 18 ? (d -= 18, v += 1, this.words[v] |= y >>> 26) : d += 8;
      }
      this.strip();
    };
    function M(p, e, s, h) {
      for (var u = 0, d = Math.min(p.length, s), v = e; v < d; v++) {
        var y = p.charCodeAt(v) - 48;
        u *= h, y >= 49 ? u += y - 49 + 10 : y >= 17 ? u += y - 17 + 10 : u += y;
      }
      return u;
    }
    a.prototype._parseBase = function(e, s, h) {
      this.words = [0], this.length = 1;
      for (var u = 0, d = 1; d <= 67108863; d *= s)
        u++;
      u--, d = d / s | 0;
      for (var v = e.length - h, y = v % u, l = Math.min(v, v - y) + h, i = 0, c = h; c < l; c += u)
        i = M(e, c, c + u, s), this.imuln(d), this.words[0] + i < 67108864 ? this.words[0] += i : this._iaddn(i);
      if (y !== 0) {
        var S = 1;
        for (i = M(e, c, e.length, s), c = 0; c < y; c++)
          S *= s;
        this.imuln(S), this.words[0] + i < 67108864 ? this.words[0] += i : this._iaddn(i);
      }
      this.strip();
    }, a.prototype.copy = function(e) {
      e.words = new Array(this.length);
      for (var s = 0; s < this.length; s++)
        e.words[s] = this.words[s];
      e.length = this.length, e.negative = this.negative, e.red = this.red;
    }, a.prototype.clone = function() {
      var e = new a(null);
      return this.copy(e), e;
    }, a.prototype._expand = function(e) {
      for (; this.length < e; )
        this.words[this.length++] = 0;
      return this;
    }, a.prototype.strip = function() {
      for (; this.length > 1 && this.words[this.length - 1] === 0; )
        this.length--;
      return this._normSign();
    }, a.prototype._normSign = function() {
      return this.length === 1 && this.words[0] === 0 && (this.negative = 0), this;
    }, a.prototype.inspect = function() {
      return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
    };
    var b = [
      "",
      "0",
      "00",
      "000",
      "0000",
      "00000",
      "000000",
      "0000000",
      "00000000",
      "000000000",
      "0000000000",
      "00000000000",
      "000000000000",
      "0000000000000",
      "00000000000000",
      "000000000000000",
      "0000000000000000",
      "00000000000000000",
      "000000000000000000",
      "0000000000000000000",
      "00000000000000000000",
      "000000000000000000000",
      "0000000000000000000000",
      "00000000000000000000000",
      "000000000000000000000000",
      "0000000000000000000000000"
    ], _ = [
      0,
      0,
      25,
      16,
      12,
      11,
      10,
      9,
      8,
      8,
      7,
      7,
      7,
      7,
      6,
      6,
      6,
      6,
      6,
      6,
      6,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5
    ], I = [
      0,
      0,
      33554432,
      43046721,
      16777216,
      48828125,
      60466176,
      40353607,
      16777216,
      43046721,
      1e7,
      19487171,
      35831808,
      62748517,
      7529536,
      11390625,
      16777216,
      24137569,
      34012224,
      47045881,
      64e6,
      4084101,
      5153632,
      6436343,
      7962624,
      9765625,
      11881376,
      14348907,
      17210368,
      20511149,
      243e5,
      28629151,
      33554432,
      39135393,
      45435424,
      52521875,
      60466176
    ];
    a.prototype.toString = function(e, s) {
      e = e || 10, s = s | 0 || 1;
      var h;
      if (e === 16 || e === "hex") {
        h = "";
        for (var u = 0, d = 0, v = 0; v < this.length; v++) {
          var y = this.words[v], l = ((y << u | d) & 16777215).toString(16);
          d = y >>> 24 - u & 16777215, d !== 0 || v !== this.length - 1 ? h = b[6 - l.length] + l + h : h = l + h, u += 2, u >= 26 && (u -= 26, v--);
        }
        for (d !== 0 && (h = d.toString(16) + h); h.length % s !== 0; )
          h = "0" + h;
        return this.negative !== 0 && (h = "-" + h), h;
      }
      if (e === (e | 0) && e >= 2 && e <= 36) {
        var i = _[e], c = I[e];
        h = "";
        var S = this.clone();
        for (S.negative = 0; !S.isZero(); ) {
          var x = S.modn(c).toString(e);
          S = S.idivn(c), S.isZero() ? h = x + h : h = b[i - x.length] + x + h;
        }
        for (this.isZero() && (h = "0" + h); h.length % s !== 0; )
          h = "0" + h;
        return this.negative !== 0 && (h = "-" + h), h;
      }
      n(!1, "Base should be between 2 and 36");
    }, a.prototype.toNumber = function() {
      var e = this.words[0];
      return this.length === 2 ? e += this.words[1] * 67108864 : this.length === 3 && this.words[2] === 1 ? e += 4503599627370496 + this.words[1] * 67108864 : this.length > 2 && n(!1, "Number can only safely store up to 53 bits"), this.negative !== 0 ? -e : e;
    }, a.prototype.toJSON = function() {
      return this.toString(16);
    }, a.prototype.toBuffer = function(e, s) {
      return n(typeof m < "u"), this.toArrayLike(m, e, s);
    }, a.prototype.toArray = function(e, s) {
      return this.toArrayLike(Array, e, s);
    }, a.prototype.toArrayLike = function(e, s, h) {
      var u = this.byteLength(), d = h || Math.max(1, u);
      n(u <= d, "byte array longer than desired length"), n(d > 0, "Requested array length <= 0"), this.strip();
      var v = s === "le", y = new e(d), l, i, c = this.clone();
      if (v) {
        for (i = 0; !c.isZero(); i++)
          l = c.andln(255), c.iushrn(8), y[i] = l;
        for (; i < d; i++)
          y[i] = 0;
      } else {
        for (i = 0; i < d - u; i++)
          y[i] = 0;
        for (i = 0; !c.isZero(); i++)
          l = c.andln(255), c.iushrn(8), y[d - i - 1] = l;
      }
      return y;
    }, Math.clz32 ? a.prototype._countBits = function(e) {
      return 32 - Math.clz32(e);
    } : a.prototype._countBits = function(e) {
      var s = e, h = 0;
      return s >= 4096 && (h += 13, s >>>= 13), s >= 64 && (h += 7, s >>>= 7), s >= 8 && (h += 4, s >>>= 4), s >= 2 && (h += 2, s >>>= 2), h + s;
    }, a.prototype._zeroBits = function(e) {
      if (e === 0)
        return 26;
      var s = e, h = 0;
      return s & 8191 || (h += 13, s >>>= 13), s & 127 || (h += 7, s >>>= 7), s & 15 || (h += 4, s >>>= 4), s & 3 || (h += 2, s >>>= 2), s & 1 || h++, h;
    }, a.prototype.bitLength = function() {
      var e = this.words[this.length - 1], s = this._countBits(e);
      return (this.length - 1) * 26 + s;
    };
    function k(p) {
      for (var e = new Array(p.bitLength()), s = 0; s < e.length; s++) {
        var h = s / 26 | 0, u = s % 26;
        e[s] = (p.words[h] & 1 << u) >>> u;
      }
      return e;
    }
    a.prototype.zeroBits = function() {
      if (this.isZero())
        return 0;
      for (var e = 0, s = 0; s < this.length; s++) {
        var h = this._zeroBits(this.words[s]);
        if (e += h, h !== 26)
          break;
      }
      return e;
    }, a.prototype.byteLength = function() {
      return Math.ceil(this.bitLength() / 8);
    }, a.prototype.toTwos = function(e) {
      return this.negative !== 0 ? this.abs().inotn(e).iaddn(1) : this.clone();
    }, a.prototype.fromTwos = function(e) {
      return this.testn(e - 1) ? this.notn(e).iaddn(1).ineg() : this.clone();
    }, a.prototype.isNeg = function() {
      return this.negative !== 0;
    }, a.prototype.neg = function() {
      return this.clone().ineg();
    }, a.prototype.ineg = function() {
      return this.isZero() || (this.negative ^= 1), this;
    }, a.prototype.iuor = function(e) {
      for (; this.length < e.length; )
        this.words[this.length++] = 0;
      for (var s = 0; s < e.length; s++)
        this.words[s] = this.words[s] | e.words[s];
      return this.strip();
    }, a.prototype.ior = function(e) {
      return n((this.negative | e.negative) === 0), this.iuor(e);
    }, a.prototype.or = function(e) {
      return this.length > e.length ? this.clone().ior(e) : e.clone().ior(this);
    }, a.prototype.uor = function(e) {
      return this.length > e.length ? this.clone().iuor(e) : e.clone().iuor(this);
    }, a.prototype.iuand = function(e) {
      var s;
      this.length > e.length ? s = e : s = this;
      for (var h = 0; h < s.length; h++)
        this.words[h] = this.words[h] & e.words[h];
      return this.length = s.length, this.strip();
    }, a.prototype.iand = function(e) {
      return n((this.negative | e.negative) === 0), this.iuand(e);
    }, a.prototype.and = function(e) {
      return this.length > e.length ? this.clone().iand(e) : e.clone().iand(this);
    }, a.prototype.uand = function(e) {
      return this.length > e.length ? this.clone().iuand(e) : e.clone().iuand(this);
    }, a.prototype.iuxor = function(e) {
      var s, h;
      this.length > e.length ? (s = this, h = e) : (s = e, h = this);
      for (var u = 0; u < h.length; u++)
        this.words[u] = s.words[u] ^ h.words[u];
      if (this !== s)
        for (; u < s.length; u++)
          this.words[u] = s.words[u];
      return this.length = s.length, this.strip();
    }, a.prototype.ixor = function(e) {
      return n((this.negative | e.negative) === 0), this.iuxor(e);
    }, a.prototype.xor = function(e) {
      return this.length > e.length ? this.clone().ixor(e) : e.clone().ixor(this);
    }, a.prototype.uxor = function(e) {
      return this.length > e.length ? this.clone().iuxor(e) : e.clone().iuxor(this);
    }, a.prototype.inotn = function(e) {
      n(typeof e == "number" && e >= 0);
      var s = Math.ceil(e / 26) | 0, h = e % 26;
      this._expand(s), h > 0 && s--;
      for (var u = 0; u < s; u++)
        this.words[u] = ~this.words[u] & 67108863;
      return h > 0 && (this.words[u] = ~this.words[u] & 67108863 >> 26 - h), this.strip();
    }, a.prototype.notn = function(e) {
      return this.clone().inotn(e);
    }, a.prototype.setn = function(e, s) {
      n(typeof e == "number" && e >= 0);
      var h = e / 26 | 0, u = e % 26;
      return this._expand(h + 1), s ? this.words[h] = this.words[h] | 1 << u : this.words[h] = this.words[h] & ~(1 << u), this.strip();
    }, a.prototype.iadd = function(e) {
      var s;
      if (this.negative !== 0 && e.negative === 0)
        return this.negative = 0, s = this.isub(e), this.negative ^= 1, this._normSign();
      if (this.negative === 0 && e.negative !== 0)
        return e.negative = 0, s = this.isub(e), e.negative = 1, s._normSign();
      var h, u;
      this.length > e.length ? (h = this, u = e) : (h = e, u = this);
      for (var d = 0, v = 0; v < u.length; v++)
        s = (h.words[v] | 0) + (u.words[v] | 0) + d, this.words[v] = s & 67108863, d = s >>> 26;
      for (; d !== 0 && v < h.length; v++)
        s = (h.words[v] | 0) + d, this.words[v] = s & 67108863, d = s >>> 26;
      if (this.length = h.length, d !== 0)
        this.words[this.length] = d, this.length++;
      else if (h !== this)
        for (; v < h.length; v++)
          this.words[v] = h.words[v];
      return this;
    }, a.prototype.add = function(e) {
      var s;
      return e.negative !== 0 && this.negative === 0 ? (e.negative = 0, s = this.sub(e), e.negative ^= 1, s) : e.negative === 0 && this.negative !== 0 ? (this.negative = 0, s = e.sub(this), this.negative = 1, s) : this.length > e.length ? this.clone().iadd(e) : e.clone().iadd(this);
    }, a.prototype.isub = function(e) {
      if (e.negative !== 0) {
        e.negative = 0;
        var s = this.iadd(e);
        return e.negative = 1, s._normSign();
      } else if (this.negative !== 0)
        return this.negative = 0, this.iadd(e), this.negative = 1, this._normSign();
      var h = this.cmp(e);
      if (h === 0)
        return this.negative = 0, this.length = 1, this.words[0] = 0, this;
      var u, d;
      h > 0 ? (u = this, d = e) : (u = e, d = this);
      for (var v = 0, y = 0; y < d.length; y++)
        s = (u.words[y] | 0) - (d.words[y] | 0) + v, v = s >> 26, this.words[y] = s & 67108863;
      for (; v !== 0 && y < u.length; y++)
        s = (u.words[y] | 0) + v, v = s >> 26, this.words[y] = s & 67108863;
      if (v === 0 && y < u.length && u !== this)
        for (; y < u.length; y++)
          this.words[y] = u.words[y];
      return this.length = Math.max(this.length, y), u !== this && (this.negative = 1), this.strip();
    }, a.prototype.sub = function(e) {
      return this.clone().isub(e);
    };
    function $(p, e, s) {
      s.negative = e.negative ^ p.negative;
      var h = p.length + e.length | 0;
      s.length = h, h = h - 1 | 0;
      var u = p.words[0] | 0, d = e.words[0] | 0, v = u * d, y = v & 67108863, l = v / 67108864 | 0;
      s.words[0] = y;
      for (var i = 1; i < h; i++) {
        for (var c = l >>> 26, S = l & 67108863, x = Math.min(i, e.length - 1), E = Math.max(0, i - p.length + 1); E <= x; E++) {
          var A = i - E | 0;
          u = p.words[A] | 0, d = e.words[E] | 0, v = u * d + S, c += v / 67108864 | 0, S = v & 67108863;
        }
        s.words[i] = S | 0, l = c | 0;
      }
      return l !== 0 ? s.words[i] = l | 0 : s.length--, s.strip();
    }
    var F = function(e, s, h) {
      var u = e.words, d = s.words, v = h.words, y = 0, l, i, c, S = u[0] | 0, x = S & 8191, E = S >>> 13, A = u[1] | 0, N = A & 8191, L = A >>> 13, Ft = u[2] | 0, j = Ft & 8191, V = Ft >>> 13, lr = u[3] | 0, H = lr & 8191, z = lr >>> 13, cr = u[4] | 0, Y = cr & 8191, Z = cr >>> 13, dr = u[5] | 0, W = dr & 8191, X = dr >>> 13, pr = u[6] | 0, Q = pr & 8191, tt = pr >>> 13, mr = u[7] | 0, et = mr & 8191, rt = mr >>> 13, vr = u[8] | 0, it = vr & 8191, nt = vr >>> 13, yr = u[9] | 0, ot = yr & 8191, st = yr >>> 13, gr = d[0] | 0, at = gr & 8191, ft = gr >>> 13, wr = d[1] | 0, ht = wr & 8191, ut = wr >>> 13, Mr = d[2] | 0, lt = Mr & 8191, ct = Mr >>> 13, br = d[3] | 0, dt = br & 8191, pt = br >>> 13, _r = d[4] | 0, mt = _r & 8191, vt = _r >>> 13, Sr = d[5] | 0, yt = Sr & 8191, gt = Sr >>> 13, xr = d[6] | 0, wt = xr & 8191, Mt = xr >>> 13, Er = d[7] | 0, bt = Er & 8191, _t = Er >>> 13, Ar = d[8] | 0, St = Ar & 8191, xt = Ar >>> 13, Tr = d[9] | 0, Et = Tr & 8191, At = Tr >>> 13;
      h.negative = e.negative ^ s.negative, h.length = 19, l = Math.imul(x, at), i = Math.imul(x, ft), i = i + Math.imul(E, at) | 0, c = Math.imul(E, ft);
      var we = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (we >>> 26) | 0, we &= 67108863, l = Math.imul(N, at), i = Math.imul(N, ft), i = i + Math.imul(L, at) | 0, c = Math.imul(L, ft), l = l + Math.imul(x, ht) | 0, i = i + Math.imul(x, ut) | 0, i = i + Math.imul(E, ht) | 0, c = c + Math.imul(E, ut) | 0;
      var Me = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (Me >>> 26) | 0, Me &= 67108863, l = Math.imul(j, at), i = Math.imul(j, ft), i = i + Math.imul(V, at) | 0, c = Math.imul(V, ft), l = l + Math.imul(N, ht) | 0, i = i + Math.imul(N, ut) | 0, i = i + Math.imul(L, ht) | 0, c = c + Math.imul(L, ut) | 0, l = l + Math.imul(x, lt) | 0, i = i + Math.imul(x, ct) | 0, i = i + Math.imul(E, lt) | 0, c = c + Math.imul(E, ct) | 0;
      var be = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (be >>> 26) | 0, be &= 67108863, l = Math.imul(H, at), i = Math.imul(H, ft), i = i + Math.imul(z, at) | 0, c = Math.imul(z, ft), l = l + Math.imul(j, ht) | 0, i = i + Math.imul(j, ut) | 0, i = i + Math.imul(V, ht) | 0, c = c + Math.imul(V, ut) | 0, l = l + Math.imul(N, lt) | 0, i = i + Math.imul(N, ct) | 0, i = i + Math.imul(L, lt) | 0, c = c + Math.imul(L, ct) | 0, l = l + Math.imul(x, dt) | 0, i = i + Math.imul(x, pt) | 0, i = i + Math.imul(E, dt) | 0, c = c + Math.imul(E, pt) | 0;
      var _e = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (_e >>> 26) | 0, _e &= 67108863, l = Math.imul(Y, at), i = Math.imul(Y, ft), i = i + Math.imul(Z, at) | 0, c = Math.imul(Z, ft), l = l + Math.imul(H, ht) | 0, i = i + Math.imul(H, ut) | 0, i = i + Math.imul(z, ht) | 0, c = c + Math.imul(z, ut) | 0, l = l + Math.imul(j, lt) | 0, i = i + Math.imul(j, ct) | 0, i = i + Math.imul(V, lt) | 0, c = c + Math.imul(V, ct) | 0, l = l + Math.imul(N, dt) | 0, i = i + Math.imul(N, pt) | 0, i = i + Math.imul(L, dt) | 0, c = c + Math.imul(L, pt) | 0, l = l + Math.imul(x, mt) | 0, i = i + Math.imul(x, vt) | 0, i = i + Math.imul(E, mt) | 0, c = c + Math.imul(E, vt) | 0;
      var Se = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (Se >>> 26) | 0, Se &= 67108863, l = Math.imul(W, at), i = Math.imul(W, ft), i = i + Math.imul(X, at) | 0, c = Math.imul(X, ft), l = l + Math.imul(Y, ht) | 0, i = i + Math.imul(Y, ut) | 0, i = i + Math.imul(Z, ht) | 0, c = c + Math.imul(Z, ut) | 0, l = l + Math.imul(H, lt) | 0, i = i + Math.imul(H, ct) | 0, i = i + Math.imul(z, lt) | 0, c = c + Math.imul(z, ct) | 0, l = l + Math.imul(j, dt) | 0, i = i + Math.imul(j, pt) | 0, i = i + Math.imul(V, dt) | 0, c = c + Math.imul(V, pt) | 0, l = l + Math.imul(N, mt) | 0, i = i + Math.imul(N, vt) | 0, i = i + Math.imul(L, mt) | 0, c = c + Math.imul(L, vt) | 0, l = l + Math.imul(x, yt) | 0, i = i + Math.imul(x, gt) | 0, i = i + Math.imul(E, yt) | 0, c = c + Math.imul(E, gt) | 0;
      var xe = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (xe >>> 26) | 0, xe &= 67108863, l = Math.imul(Q, at), i = Math.imul(Q, ft), i = i + Math.imul(tt, at) | 0, c = Math.imul(tt, ft), l = l + Math.imul(W, ht) | 0, i = i + Math.imul(W, ut) | 0, i = i + Math.imul(X, ht) | 0, c = c + Math.imul(X, ut) | 0, l = l + Math.imul(Y, lt) | 0, i = i + Math.imul(Y, ct) | 0, i = i + Math.imul(Z, lt) | 0, c = c + Math.imul(Z, ct) | 0, l = l + Math.imul(H, dt) | 0, i = i + Math.imul(H, pt) | 0, i = i + Math.imul(z, dt) | 0, c = c + Math.imul(z, pt) | 0, l = l + Math.imul(j, mt) | 0, i = i + Math.imul(j, vt) | 0, i = i + Math.imul(V, mt) | 0, c = c + Math.imul(V, vt) | 0, l = l + Math.imul(N, yt) | 0, i = i + Math.imul(N, gt) | 0, i = i + Math.imul(L, yt) | 0, c = c + Math.imul(L, gt) | 0, l = l + Math.imul(x, wt) | 0, i = i + Math.imul(x, Mt) | 0, i = i + Math.imul(E, wt) | 0, c = c + Math.imul(E, Mt) | 0;
      var Ee = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (Ee >>> 26) | 0, Ee &= 67108863, l = Math.imul(et, at), i = Math.imul(et, ft), i = i + Math.imul(rt, at) | 0, c = Math.imul(rt, ft), l = l + Math.imul(Q, ht) | 0, i = i + Math.imul(Q, ut) | 0, i = i + Math.imul(tt, ht) | 0, c = c + Math.imul(tt, ut) | 0, l = l + Math.imul(W, lt) | 0, i = i + Math.imul(W, ct) | 0, i = i + Math.imul(X, lt) | 0, c = c + Math.imul(X, ct) | 0, l = l + Math.imul(Y, dt) | 0, i = i + Math.imul(Y, pt) | 0, i = i + Math.imul(Z, dt) | 0, c = c + Math.imul(Z, pt) | 0, l = l + Math.imul(H, mt) | 0, i = i + Math.imul(H, vt) | 0, i = i + Math.imul(z, mt) | 0, c = c + Math.imul(z, vt) | 0, l = l + Math.imul(j, yt) | 0, i = i + Math.imul(j, gt) | 0, i = i + Math.imul(V, yt) | 0, c = c + Math.imul(V, gt) | 0, l = l + Math.imul(N, wt) | 0, i = i + Math.imul(N, Mt) | 0, i = i + Math.imul(L, wt) | 0, c = c + Math.imul(L, Mt) | 0, l = l + Math.imul(x, bt) | 0, i = i + Math.imul(x, _t) | 0, i = i + Math.imul(E, bt) | 0, c = c + Math.imul(E, _t) | 0;
      var Ae = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (Ae >>> 26) | 0, Ae &= 67108863, l = Math.imul(it, at), i = Math.imul(it, ft), i = i + Math.imul(nt, at) | 0, c = Math.imul(nt, ft), l = l + Math.imul(et, ht) | 0, i = i + Math.imul(et, ut) | 0, i = i + Math.imul(rt, ht) | 0, c = c + Math.imul(rt, ut) | 0, l = l + Math.imul(Q, lt) | 0, i = i + Math.imul(Q, ct) | 0, i = i + Math.imul(tt, lt) | 0, c = c + Math.imul(tt, ct) | 0, l = l + Math.imul(W, dt) | 0, i = i + Math.imul(W, pt) | 0, i = i + Math.imul(X, dt) | 0, c = c + Math.imul(X, pt) | 0, l = l + Math.imul(Y, mt) | 0, i = i + Math.imul(Y, vt) | 0, i = i + Math.imul(Z, mt) | 0, c = c + Math.imul(Z, vt) | 0, l = l + Math.imul(H, yt) | 0, i = i + Math.imul(H, gt) | 0, i = i + Math.imul(z, yt) | 0, c = c + Math.imul(z, gt) | 0, l = l + Math.imul(j, wt) | 0, i = i + Math.imul(j, Mt) | 0, i = i + Math.imul(V, wt) | 0, c = c + Math.imul(V, Mt) | 0, l = l + Math.imul(N, bt) | 0, i = i + Math.imul(N, _t) | 0, i = i + Math.imul(L, bt) | 0, c = c + Math.imul(L, _t) | 0, l = l + Math.imul(x, St) | 0, i = i + Math.imul(x, xt) | 0, i = i + Math.imul(E, St) | 0, c = c + Math.imul(E, xt) | 0;
      var Te = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (Te >>> 26) | 0, Te &= 67108863, l = Math.imul(ot, at), i = Math.imul(ot, ft), i = i + Math.imul(st, at) | 0, c = Math.imul(st, ft), l = l + Math.imul(it, ht) | 0, i = i + Math.imul(it, ut) | 0, i = i + Math.imul(nt, ht) | 0, c = c + Math.imul(nt, ut) | 0, l = l + Math.imul(et, lt) | 0, i = i + Math.imul(et, ct) | 0, i = i + Math.imul(rt, lt) | 0, c = c + Math.imul(rt, ct) | 0, l = l + Math.imul(Q, dt) | 0, i = i + Math.imul(Q, pt) | 0, i = i + Math.imul(tt, dt) | 0, c = c + Math.imul(tt, pt) | 0, l = l + Math.imul(W, mt) | 0, i = i + Math.imul(W, vt) | 0, i = i + Math.imul(X, mt) | 0, c = c + Math.imul(X, vt) | 0, l = l + Math.imul(Y, yt) | 0, i = i + Math.imul(Y, gt) | 0, i = i + Math.imul(Z, yt) | 0, c = c + Math.imul(Z, gt) | 0, l = l + Math.imul(H, wt) | 0, i = i + Math.imul(H, Mt) | 0, i = i + Math.imul(z, wt) | 0, c = c + Math.imul(z, Mt) | 0, l = l + Math.imul(j, bt) | 0, i = i + Math.imul(j, _t) | 0, i = i + Math.imul(V, bt) | 0, c = c + Math.imul(V, _t) | 0, l = l + Math.imul(N, St) | 0, i = i + Math.imul(N, xt) | 0, i = i + Math.imul(L, St) | 0, c = c + Math.imul(L, xt) | 0, l = l + Math.imul(x, Et) | 0, i = i + Math.imul(x, At) | 0, i = i + Math.imul(E, Et) | 0, c = c + Math.imul(E, At) | 0;
      var Be = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (Be >>> 26) | 0, Be &= 67108863, l = Math.imul(ot, ht), i = Math.imul(ot, ut), i = i + Math.imul(st, ht) | 0, c = Math.imul(st, ut), l = l + Math.imul(it, lt) | 0, i = i + Math.imul(it, ct) | 0, i = i + Math.imul(nt, lt) | 0, c = c + Math.imul(nt, ct) | 0, l = l + Math.imul(et, dt) | 0, i = i + Math.imul(et, pt) | 0, i = i + Math.imul(rt, dt) | 0, c = c + Math.imul(rt, pt) | 0, l = l + Math.imul(Q, mt) | 0, i = i + Math.imul(Q, vt) | 0, i = i + Math.imul(tt, mt) | 0, c = c + Math.imul(tt, vt) | 0, l = l + Math.imul(W, yt) | 0, i = i + Math.imul(W, gt) | 0, i = i + Math.imul(X, yt) | 0, c = c + Math.imul(X, gt) | 0, l = l + Math.imul(Y, wt) | 0, i = i + Math.imul(Y, Mt) | 0, i = i + Math.imul(Z, wt) | 0, c = c + Math.imul(Z, Mt) | 0, l = l + Math.imul(H, bt) | 0, i = i + Math.imul(H, _t) | 0, i = i + Math.imul(z, bt) | 0, c = c + Math.imul(z, _t) | 0, l = l + Math.imul(j, St) | 0, i = i + Math.imul(j, xt) | 0, i = i + Math.imul(V, St) | 0, c = c + Math.imul(V, xt) | 0, l = l + Math.imul(N, Et) | 0, i = i + Math.imul(N, At) | 0, i = i + Math.imul(L, Et) | 0, c = c + Math.imul(L, At) | 0;
      var Ie = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (Ie >>> 26) | 0, Ie &= 67108863, l = Math.imul(ot, lt), i = Math.imul(ot, ct), i = i + Math.imul(st, lt) | 0, c = Math.imul(st, ct), l = l + Math.imul(it, dt) | 0, i = i + Math.imul(it, pt) | 0, i = i + Math.imul(nt, dt) | 0, c = c + Math.imul(nt, pt) | 0, l = l + Math.imul(et, mt) | 0, i = i + Math.imul(et, vt) | 0, i = i + Math.imul(rt, mt) | 0, c = c + Math.imul(rt, vt) | 0, l = l + Math.imul(Q, yt) | 0, i = i + Math.imul(Q, gt) | 0, i = i + Math.imul(tt, yt) | 0, c = c + Math.imul(tt, gt) | 0, l = l + Math.imul(W, wt) | 0, i = i + Math.imul(W, Mt) | 0, i = i + Math.imul(X, wt) | 0, c = c + Math.imul(X, Mt) | 0, l = l + Math.imul(Y, bt) | 0, i = i + Math.imul(Y, _t) | 0, i = i + Math.imul(Z, bt) | 0, c = c + Math.imul(Z, _t) | 0, l = l + Math.imul(H, St) | 0, i = i + Math.imul(H, xt) | 0, i = i + Math.imul(z, St) | 0, c = c + Math.imul(z, xt) | 0, l = l + Math.imul(j, Et) | 0, i = i + Math.imul(j, At) | 0, i = i + Math.imul(V, Et) | 0, c = c + Math.imul(V, At) | 0;
      var Re = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (Re >>> 26) | 0, Re &= 67108863, l = Math.imul(ot, dt), i = Math.imul(ot, pt), i = i + Math.imul(st, dt) | 0, c = Math.imul(st, pt), l = l + Math.imul(it, mt) | 0, i = i + Math.imul(it, vt) | 0, i = i + Math.imul(nt, mt) | 0, c = c + Math.imul(nt, vt) | 0, l = l + Math.imul(et, yt) | 0, i = i + Math.imul(et, gt) | 0, i = i + Math.imul(rt, yt) | 0, c = c + Math.imul(rt, gt) | 0, l = l + Math.imul(Q, wt) | 0, i = i + Math.imul(Q, Mt) | 0, i = i + Math.imul(tt, wt) | 0, c = c + Math.imul(tt, Mt) | 0, l = l + Math.imul(W, bt) | 0, i = i + Math.imul(W, _t) | 0, i = i + Math.imul(X, bt) | 0, c = c + Math.imul(X, _t) | 0, l = l + Math.imul(Y, St) | 0, i = i + Math.imul(Y, xt) | 0, i = i + Math.imul(Z, St) | 0, c = c + Math.imul(Z, xt) | 0, l = l + Math.imul(H, Et) | 0, i = i + Math.imul(H, At) | 0, i = i + Math.imul(z, Et) | 0, c = c + Math.imul(z, At) | 0;
      var ke = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (ke >>> 26) | 0, ke &= 67108863, l = Math.imul(ot, mt), i = Math.imul(ot, vt), i = i + Math.imul(st, mt) | 0, c = Math.imul(st, vt), l = l + Math.imul(it, yt) | 0, i = i + Math.imul(it, gt) | 0, i = i + Math.imul(nt, yt) | 0, c = c + Math.imul(nt, gt) | 0, l = l + Math.imul(et, wt) | 0, i = i + Math.imul(et, Mt) | 0, i = i + Math.imul(rt, wt) | 0, c = c + Math.imul(rt, Mt) | 0, l = l + Math.imul(Q, bt) | 0, i = i + Math.imul(Q, _t) | 0, i = i + Math.imul(tt, bt) | 0, c = c + Math.imul(tt, _t) | 0, l = l + Math.imul(W, St) | 0, i = i + Math.imul(W, xt) | 0, i = i + Math.imul(X, St) | 0, c = c + Math.imul(X, xt) | 0, l = l + Math.imul(Y, Et) | 0, i = i + Math.imul(Y, At) | 0, i = i + Math.imul(Z, Et) | 0, c = c + Math.imul(Z, At) | 0;
      var Pe = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (Pe >>> 26) | 0, Pe &= 67108863, l = Math.imul(ot, yt), i = Math.imul(ot, gt), i = i + Math.imul(st, yt) | 0, c = Math.imul(st, gt), l = l + Math.imul(it, wt) | 0, i = i + Math.imul(it, Mt) | 0, i = i + Math.imul(nt, wt) | 0, c = c + Math.imul(nt, Mt) | 0, l = l + Math.imul(et, bt) | 0, i = i + Math.imul(et, _t) | 0, i = i + Math.imul(rt, bt) | 0, c = c + Math.imul(rt, _t) | 0, l = l + Math.imul(Q, St) | 0, i = i + Math.imul(Q, xt) | 0, i = i + Math.imul(tt, St) | 0, c = c + Math.imul(tt, xt) | 0, l = l + Math.imul(W, Et) | 0, i = i + Math.imul(W, At) | 0, i = i + Math.imul(X, Et) | 0, c = c + Math.imul(X, At) | 0;
      var Ce = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (Ce >>> 26) | 0, Ce &= 67108863, l = Math.imul(ot, wt), i = Math.imul(ot, Mt), i = i + Math.imul(st, wt) | 0, c = Math.imul(st, Mt), l = l + Math.imul(it, bt) | 0, i = i + Math.imul(it, _t) | 0, i = i + Math.imul(nt, bt) | 0, c = c + Math.imul(nt, _t) | 0, l = l + Math.imul(et, St) | 0, i = i + Math.imul(et, xt) | 0, i = i + Math.imul(rt, St) | 0, c = c + Math.imul(rt, xt) | 0, l = l + Math.imul(Q, Et) | 0, i = i + Math.imul(Q, At) | 0, i = i + Math.imul(tt, Et) | 0, c = c + Math.imul(tt, At) | 0;
      var Oe = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (Oe >>> 26) | 0, Oe &= 67108863, l = Math.imul(ot, bt), i = Math.imul(ot, _t), i = i + Math.imul(st, bt) | 0, c = Math.imul(st, _t), l = l + Math.imul(it, St) | 0, i = i + Math.imul(it, xt) | 0, i = i + Math.imul(nt, St) | 0, c = c + Math.imul(nt, xt) | 0, l = l + Math.imul(et, Et) | 0, i = i + Math.imul(et, At) | 0, i = i + Math.imul(rt, Et) | 0, c = c + Math.imul(rt, At) | 0;
      var Ne = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (Ne >>> 26) | 0, Ne &= 67108863, l = Math.imul(ot, St), i = Math.imul(ot, xt), i = i + Math.imul(st, St) | 0, c = Math.imul(st, xt), l = l + Math.imul(it, Et) | 0, i = i + Math.imul(it, At) | 0, i = i + Math.imul(nt, Et) | 0, c = c + Math.imul(nt, At) | 0;
      var De = (y + l | 0) + ((i & 8191) << 13) | 0;
      y = (c + (i >>> 13) | 0) + (De >>> 26) | 0, De &= 67108863, l = Math.imul(ot, Et), i = Math.imul(ot, At), i = i + Math.imul(st, Et) | 0, c = Math.imul(st, At);
      var Ue = (y + l | 0) + ((i & 8191) << 13) | 0;
      return y = (c + (i >>> 13) | 0) + (Ue >>> 26) | 0, Ue &= 67108863, v[0] = we, v[1] = Me, v[2] = be, v[3] = _e, v[4] = Se, v[5] = xe, v[6] = Ee, v[7] = Ae, v[8] = Te, v[9] = Be, v[10] = Ie, v[11] = Re, v[12] = ke, v[13] = Pe, v[14] = Ce, v[15] = Oe, v[16] = Ne, v[17] = De, v[18] = Ue, y !== 0 && (v[19] = y, h.length++), h;
    };
    Math.imul || (F = $);
    function G(p, e, s) {
      s.negative = e.negative ^ p.negative, s.length = p.length + e.length;
      for (var h = 0, u = 0, d = 0; d < s.length - 1; d++) {
        var v = u;
        u = 0;
        for (var y = h & 67108863, l = Math.min(d, e.length - 1), i = Math.max(0, d - p.length + 1); i <= l; i++) {
          var c = d - i, S = p.words[c] | 0, x = e.words[i] | 0, E = S * x, A = E & 67108863;
          v = v + (E / 67108864 | 0) | 0, A = A + y | 0, y = A & 67108863, v = v + (A >>> 26) | 0, u += v >>> 26, v &= 67108863;
        }
        s.words[d] = y, h = v, v = u;
      }
      return h !== 0 ? s.words[d] = h : s.length--, s.strip();
    }
    function Bt(p, e, s) {
      var h = new C();
      return h.mulp(p, e, s);
    }
    a.prototype.mulTo = function(e, s) {
      var h, u = this.length + e.length;
      return this.length === 10 && e.length === 10 ? h = F(this, e, s) : u < 63 ? h = $(this, e, s) : u < 1024 ? h = G(this, e, s) : h = Bt(this, e, s), h;
    };
    function C(p, e) {
      this.x = p, this.y = e;
    }
    C.prototype.makeRBT = function(e) {
      for (var s = new Array(e), h = a.prototype._countBits(e) - 1, u = 0; u < e; u++)
        s[u] = this.revBin(u, h, e);
      return s;
    }, C.prototype.revBin = function(e, s, h) {
      if (e === 0 || e === h - 1)
        return e;
      for (var u = 0, d = 0; d < s; d++)
        u |= (e & 1) << s - d - 1, e >>= 1;
      return u;
    }, C.prototype.permute = function(e, s, h, u, d, v) {
      for (var y = 0; y < v; y++)
        u[y] = s[e[y]], d[y] = h[e[y]];
    }, C.prototype.transform = function(e, s, h, u, d, v) {
      this.permute(v, e, s, h, u, d);
      for (var y = 1; y < d; y <<= 1)
        for (var l = y << 1, i = Math.cos(2 * Math.PI / l), c = Math.sin(2 * Math.PI / l), S = 0; S < d; S += l)
          for (var x = i, E = c, A = 0; A < y; A++) {
            var N = h[S + A], L = u[S + A], Ft = h[S + A + y], j = u[S + A + y], V = x * Ft - E * j;
            j = x * j + E * Ft, Ft = V, h[S + A] = N + Ft, u[S + A] = L + j, h[S + A + y] = N - Ft, u[S + A + y] = L - j, A !== l && (V = i * x - c * E, E = i * E + c * x, x = V);
          }
    }, C.prototype.guessLen13b = function(e, s) {
      var h = Math.max(s, e) | 1, u = h & 1, d = 0;
      for (h = h / 2 | 0; h; h = h >>> 1)
        d++;
      return 1 << d + 1 + u;
    }, C.prototype.conjugate = function(e, s, h) {
      if (!(h <= 1))
        for (var u = 0; u < h / 2; u++) {
          var d = e[u];
          e[u] = e[h - u - 1], e[h - u - 1] = d, d = s[u], s[u] = -s[h - u - 1], s[h - u - 1] = -d;
        }
    }, C.prototype.normalize13b = function(e, s) {
      for (var h = 0, u = 0; u < s / 2; u++) {
        var d = Math.round(e[2 * u + 1] / s) * 8192 + Math.round(e[2 * u] / s) + h;
        e[u] = d & 67108863, d < 67108864 ? h = 0 : h = d / 67108864 | 0;
      }
      return e;
    }, C.prototype.convert13b = function(e, s, h, u) {
      for (var d = 0, v = 0; v < s; v++)
        d = d + (e[v] | 0), h[2 * v] = d & 8191, d = d >>> 13, h[2 * v + 1] = d & 8191, d = d >>> 13;
      for (v = 2 * s; v < u; ++v)
        h[v] = 0;
      n(d === 0), n((d & -8192) === 0);
    }, C.prototype.stub = function(e) {
      for (var s = new Array(e), h = 0; h < e; h++)
        s[h] = 0;
      return s;
    }, C.prototype.mulp = function(e, s, h) {
      var u = 2 * this.guessLen13b(e.length, s.length), d = this.makeRBT(u), v = this.stub(u), y = new Array(u), l = new Array(u), i = new Array(u), c = new Array(u), S = new Array(u), x = new Array(u), E = h.words;
      E.length = u, this.convert13b(e.words, e.length, y, u), this.convert13b(s.words, s.length, c, u), this.transform(y, v, l, i, u, d), this.transform(c, v, S, x, u, d);
      for (var A = 0; A < u; A++) {
        var N = l[A] * S[A] - i[A] * x[A];
        i[A] = l[A] * x[A] + i[A] * S[A], l[A] = N;
      }
      return this.conjugate(l, i, u), this.transform(l, i, E, v, u, d), this.conjugate(E, v, u), this.normalize13b(E, u), h.negative = e.negative ^ s.negative, h.length = e.length + s.length, h.strip();
    }, a.prototype.mul = function(e) {
      var s = new a(null);
      return s.words = new Array(this.length + e.length), this.mulTo(e, s);
    }, a.prototype.mulf = function(e) {
      var s = new a(null);
      return s.words = new Array(this.length + e.length), Bt(this, e, s);
    }, a.prototype.imul = function(e) {
      return this.clone().mulTo(e, this);
    }, a.prototype.imuln = function(e) {
      n(typeof e == "number"), n(e < 67108864);
      for (var s = 0, h = 0; h < this.length; h++) {
        var u = (this.words[h] | 0) * e, d = (u & 67108863) + (s & 67108863);
        s >>= 26, s += u / 67108864 | 0, s += d >>> 26, this.words[h] = d & 67108863;
      }
      return s !== 0 && (this.words[h] = s, this.length++), this;
    }, a.prototype.muln = function(e) {
      return this.clone().imuln(e);
    }, a.prototype.sqr = function() {
      return this.mul(this);
    }, a.prototype.isqr = function() {
      return this.imul(this.clone());
    }, a.prototype.pow = function(e) {
      var s = k(e);
      if (s.length === 0)
        return new a(1);
      for (var h = this, u = 0; u < s.length && s[u] === 0; u++, h = h.sqr())
        ;
      if (++u < s.length)
        for (var d = h.sqr(); u < s.length; u++, d = d.sqr())
          s[u] !== 0 && (h = h.mul(d));
      return h;
    }, a.prototype.iushln = function(e) {
      n(typeof e == "number" && e >= 0);
      var s = e % 26, h = (e - s) / 26, u = 67108863 >>> 26 - s << 26 - s, d;
      if (s !== 0) {
        var v = 0;
        for (d = 0; d < this.length; d++) {
          var y = this.words[d] & u, l = (this.words[d] | 0) - y << s;
          this.words[d] = l | v, v = y >>> 26 - s;
        }
        v && (this.words[d] = v, this.length++);
      }
      if (h !== 0) {
        for (d = this.length - 1; d >= 0; d--)
          this.words[d + h] = this.words[d];
        for (d = 0; d < h; d++)
          this.words[d] = 0;
        this.length += h;
      }
      return this.strip();
    }, a.prototype.ishln = function(e) {
      return n(this.negative === 0), this.iushln(e);
    }, a.prototype.iushrn = function(e, s, h) {
      n(typeof e == "number" && e >= 0);
      var u;
      s ? u = (s - s % 26) / 26 : u = 0;
      var d = e % 26, v = Math.min((e - d) / 26, this.length), y = 67108863 ^ 67108863 >>> d << d, l = h;
      if (u -= v, u = Math.max(0, u), l) {
        for (var i = 0; i < v; i++)
          l.words[i] = this.words[i];
        l.length = v;
      }
      if (v !== 0)
        if (this.length > v)
          for (this.length -= v, i = 0; i < this.length; i++)
            this.words[i] = this.words[i + v];
        else
          this.words[0] = 0, this.length = 1;
      var c = 0;
      for (i = this.length - 1; i >= 0 && (c !== 0 || i >= u); i--) {
        var S = this.words[i] | 0;
        this.words[i] = c << 26 - d | S >>> d, c = S & y;
      }
      return l && c !== 0 && (l.words[l.length++] = c), this.length === 0 && (this.words[0] = 0, this.length = 1), this.strip();
    }, a.prototype.ishrn = function(e, s, h) {
      return n(this.negative === 0), this.iushrn(e, s, h);
    }, a.prototype.shln = function(e) {
      return this.clone().ishln(e);
    }, a.prototype.ushln = function(e) {
      return this.clone().iushln(e);
    }, a.prototype.shrn = function(e) {
      return this.clone().ishrn(e);
    }, a.prototype.ushrn = function(e) {
      return this.clone().iushrn(e);
    }, a.prototype.testn = function(e) {
      n(typeof e == "number" && e >= 0);
      var s = e % 26, h = (e - s) / 26, u = 1 << s;
      if (this.length <= h)
        return !1;
      var d = this.words[h];
      return !!(d & u);
    }, a.prototype.imaskn = function(e) {
      n(typeof e == "number" && e >= 0);
      var s = e % 26, h = (e - s) / 26;
      if (n(this.negative === 0, "imaskn works only with positive numbers"), this.length <= h)
        return this;
      if (s !== 0 && h++, this.length = Math.min(h, this.length), s !== 0) {
        var u = 67108863 ^ 67108863 >>> s << s;
        this.words[this.length - 1] &= u;
      }
      return this.strip();
    }, a.prototype.maskn = function(e) {
      return this.clone().imaskn(e);
    }, a.prototype.iaddn = function(e) {
      return n(typeof e == "number"), n(e < 67108864), e < 0 ? this.isubn(-e) : this.negative !== 0 ? this.length === 1 && (this.words[0] | 0) < e ? (this.words[0] = e - (this.words[0] | 0), this.negative = 0, this) : (this.negative = 0, this.isubn(e), this.negative = 1, this) : this._iaddn(e);
    }, a.prototype._iaddn = function(e) {
      this.words[0] += e;
      for (var s = 0; s < this.length && this.words[s] >= 67108864; s++)
        this.words[s] -= 67108864, s === this.length - 1 ? this.words[s + 1] = 1 : this.words[s + 1]++;
      return this.length = Math.max(this.length, s + 1), this;
    }, a.prototype.isubn = function(e) {
      if (n(typeof e == "number"), n(e < 67108864), e < 0)
        return this.iaddn(-e);
      if (this.negative !== 0)
        return this.negative = 0, this.iaddn(e), this.negative = 1, this;
      if (this.words[0] -= e, this.length === 1 && this.words[0] < 0)
        this.words[0] = -this.words[0], this.negative = 1;
      else
        for (var s = 0; s < this.length && this.words[s] < 0; s++)
          this.words[s] += 67108864, this.words[s + 1] -= 1;
      return this.strip();
    }, a.prototype.addn = function(e) {
      return this.clone().iaddn(e);
    }, a.prototype.subn = function(e) {
      return this.clone().isubn(e);
    }, a.prototype.iabs = function() {
      return this.negative = 0, this;
    }, a.prototype.abs = function() {
      return this.clone().iabs();
    }, a.prototype._ishlnsubmul = function(e, s, h) {
      var u = e.length + h, d;
      this._expand(u);
      var v, y = 0;
      for (d = 0; d < e.length; d++) {
        v = (this.words[d + h] | 0) + y;
        var l = (e.words[d] | 0) * s;
        v -= l & 67108863, y = (v >> 26) - (l / 67108864 | 0), this.words[d + h] = v & 67108863;
      }
      for (; d < this.length - h; d++)
        v = (this.words[d + h] | 0) + y, y = v >> 26, this.words[d + h] = v & 67108863;
      if (y === 0)
        return this.strip();
      for (n(y === -1), y = 0, d = 0; d < this.length; d++)
        v = -(this.words[d] | 0) + y, y = v >> 26, this.words[d] = v & 67108863;
      return this.negative = 1, this.strip();
    }, a.prototype._wordDiv = function(e, s) {
      var h = this.length - e.length, u = this.clone(), d = e, v = d.words[d.length - 1] | 0, y = this._countBits(v);
      h = 26 - y, h !== 0 && (d = d.ushln(h), u.iushln(h), v = d.words[d.length - 1] | 0);
      var l = u.length - d.length, i;
      if (s !== "mod") {
        i = new a(null), i.length = l + 1, i.words = new Array(i.length);
        for (var c = 0; c < i.length; c++)
          i.words[c] = 0;
      }
      var S = u.clone()._ishlnsubmul(d, 1, l);
      S.negative === 0 && (u = S, i && (i.words[l] = 1));
      for (var x = l - 1; x >= 0; x--) {
        var E = (u.words[d.length + x] | 0) * 67108864 + (u.words[d.length + x - 1] | 0);
        for (E = Math.min(E / v | 0, 67108863), u._ishlnsubmul(d, E, x); u.negative !== 0; )
          E--, u.negative = 0, u._ishlnsubmul(d, 1, x), u.isZero() || (u.negative ^= 1);
        i && (i.words[x] = E);
      }
      return i && i.strip(), u.strip(), s !== "div" && h !== 0 && u.iushrn(h), {
        div: i || null,
        mod: u
      };
    }, a.prototype.divmod = function(e, s, h) {
      if (n(!e.isZero()), this.isZero())
        return {
          div: new a(0),
          mod: new a(0)
        };
      var u, d, v;
      return this.negative !== 0 && e.negative === 0 ? (v = this.neg().divmod(e, s), s !== "mod" && (u = v.div.neg()), s !== "div" && (d = v.mod.neg(), h && d.negative !== 0 && d.iadd(e)), {
        div: u,
        mod: d
      }) : this.negative === 0 && e.negative !== 0 ? (v = this.divmod(e.neg(), s), s !== "mod" && (u = v.div.neg()), {
        div: u,
        mod: v.mod
      }) : this.negative & e.negative ? (v = this.neg().divmod(e.neg(), s), s !== "div" && (d = v.mod.neg(), h && d.negative !== 0 && d.isub(e)), {
        div: v.div,
        mod: d
      }) : e.length > this.length || this.cmp(e) < 0 ? {
        div: new a(0),
        mod: this
      } : e.length === 1 ? s === "div" ? {
        div: this.divn(e.words[0]),
        mod: null
      } : s === "mod" ? {
        div: null,
        mod: new a(this.modn(e.words[0]))
      } : {
        div: this.divn(e.words[0]),
        mod: new a(this.modn(e.words[0]))
      } : this._wordDiv(e, s);
    }, a.prototype.div = function(e) {
      return this.divmod(e, "div", !1).div;
    }, a.prototype.mod = function(e) {
      return this.divmod(e, "mod", !1).mod;
    }, a.prototype.umod = function(e) {
      return this.divmod(e, "mod", !0).mod;
    }, a.prototype.divRound = function(e) {
      var s = this.divmod(e);
      if (s.mod.isZero())
        return s.div;
      var h = s.div.negative !== 0 ? s.mod.isub(e) : s.mod, u = e.ushrn(1), d = e.andln(1), v = h.cmp(u);
      return v < 0 || d === 1 && v === 0 ? s.div : s.div.negative !== 0 ? s.div.isubn(1) : s.div.iaddn(1);
    }, a.prototype.modn = function(e) {
      n(e <= 67108863);
      for (var s = (1 << 26) % e, h = 0, u = this.length - 1; u >= 0; u--)
        h = (s * h + (this.words[u] | 0)) % e;
      return h;
    }, a.prototype.idivn = function(e) {
      n(e <= 67108863);
      for (var s = 0, h = this.length - 1; h >= 0; h--) {
        var u = (this.words[h] | 0) + s * 67108864;
        this.words[h] = u / e | 0, s = u % e;
      }
      return this.strip();
    }, a.prototype.divn = function(e) {
      return this.clone().idivn(e);
    }, a.prototype.egcd = function(e) {
      n(e.negative === 0), n(!e.isZero());
      var s = this, h = e.clone();
      s.negative !== 0 ? s = s.umod(e) : s = s.clone();
      for (var u = new a(1), d = new a(0), v = new a(0), y = new a(1), l = 0; s.isEven() && h.isEven(); )
        s.iushrn(1), h.iushrn(1), ++l;
      for (var i = h.clone(), c = s.clone(); !s.isZero(); ) {
        for (var S = 0, x = 1; !(s.words[0] & x) && S < 26; ++S, x <<= 1)
          ;
        if (S > 0)
          for (s.iushrn(S); S-- > 0; )
            (u.isOdd() || d.isOdd()) && (u.iadd(i), d.isub(c)), u.iushrn(1), d.iushrn(1);
        for (var E = 0, A = 1; !(h.words[0] & A) && E < 26; ++E, A <<= 1)
          ;
        if (E > 0)
          for (h.iushrn(E); E-- > 0; )
            (v.isOdd() || y.isOdd()) && (v.iadd(i), y.isub(c)), v.iushrn(1), y.iushrn(1);
        s.cmp(h) >= 0 ? (s.isub(h), u.isub(v), d.isub(y)) : (h.isub(s), v.isub(u), y.isub(d));
      }
      return {
        a: v,
        b: y,
        gcd: h.iushln(l)
      };
    }, a.prototype._invmp = function(e) {
      n(e.negative === 0), n(!e.isZero());
      var s = this, h = e.clone();
      s.negative !== 0 ? s = s.umod(e) : s = s.clone();
      for (var u = new a(1), d = new a(0), v = h.clone(); s.cmpn(1) > 0 && h.cmpn(1) > 0; ) {
        for (var y = 0, l = 1; !(s.words[0] & l) && y < 26; ++y, l <<= 1)
          ;
        if (y > 0)
          for (s.iushrn(y); y-- > 0; )
            u.isOdd() && u.iadd(v), u.iushrn(1);
        for (var i = 0, c = 1; !(h.words[0] & c) && i < 26; ++i, c <<= 1)
          ;
        if (i > 0)
          for (h.iushrn(i); i-- > 0; )
            d.isOdd() && d.iadd(v), d.iushrn(1);
        s.cmp(h) >= 0 ? (s.isub(h), u.isub(d)) : (h.isub(s), d.isub(u));
      }
      var S;
      return s.cmpn(1) === 0 ? S = u : S = d, S.cmpn(0) < 0 && S.iadd(e), S;
    }, a.prototype.gcd = function(e) {
      if (this.isZero())
        return e.abs();
      if (e.isZero())
        return this.abs();
      var s = this.clone(), h = e.clone();
      s.negative = 0, h.negative = 0;
      for (var u = 0; s.isEven() && h.isEven(); u++)
        s.iushrn(1), h.iushrn(1);
      do {
        for (; s.isEven(); )
          s.iushrn(1);
        for (; h.isEven(); )
          h.iushrn(1);
        var d = s.cmp(h);
        if (d < 0) {
          var v = s;
          s = h, h = v;
        } else if (d === 0 || h.cmpn(1) === 0)
          break;
        s.isub(h);
      } while (!0);
      return h.iushln(u);
    }, a.prototype.invm = function(e) {
      return this.egcd(e).a.umod(e);
    }, a.prototype.isEven = function() {
      return (this.words[0] & 1) === 0;
    }, a.prototype.isOdd = function() {
      return (this.words[0] & 1) === 1;
    }, a.prototype.andln = function(e) {
      return this.words[0] & e;
    }, a.prototype.bincn = function(e) {
      n(typeof e == "number");
      var s = e % 26, h = (e - s) / 26, u = 1 << s;
      if (this.length <= h)
        return this._expand(h + 1), this.words[h] |= u, this;
      for (var d = u, v = h; d !== 0 && v < this.length; v++) {
        var y = this.words[v] | 0;
        y += d, d = y >>> 26, y &= 67108863, this.words[v] = y;
      }
      return d !== 0 && (this.words[v] = d, this.length++), this;
    }, a.prototype.isZero = function() {
      return this.length === 1 && this.words[0] === 0;
    }, a.prototype.cmpn = function(e) {
      var s = e < 0;
      if (this.negative !== 0 && !s)
        return -1;
      if (this.negative === 0 && s)
        return 1;
      this.strip();
      var h;
      if (this.length > 1)
        h = 1;
      else {
        s && (e = -e), n(e <= 67108863, "Number is too big");
        var u = this.words[0] | 0;
        h = u === e ? 0 : u < e ? -1 : 1;
      }
      return this.negative !== 0 ? -h | 0 : h;
    }, a.prototype.cmp = function(e) {
      if (this.negative !== 0 && e.negative === 0)
        return -1;
      if (this.negative === 0 && e.negative !== 0)
        return 1;
      var s = this.ucmp(e);
      return this.negative !== 0 ? -s | 0 : s;
    }, a.prototype.ucmp = function(e) {
      if (this.length > e.length)
        return 1;
      if (this.length < e.length)
        return -1;
      for (var s = 0, h = this.length - 1; h >= 0; h--) {
        var u = this.words[h] | 0, d = e.words[h] | 0;
        if (u !== d) {
          u < d ? s = -1 : u > d && (s = 1);
          break;
        }
      }
      return s;
    }, a.prototype.gtn = function(e) {
      return this.cmpn(e) === 1;
    }, a.prototype.gt = function(e) {
      return this.cmp(e) === 1;
    }, a.prototype.gten = function(e) {
      return this.cmpn(e) >= 0;
    }, a.prototype.gte = function(e) {
      return this.cmp(e) >= 0;
    }, a.prototype.ltn = function(e) {
      return this.cmpn(e) === -1;
    }, a.prototype.lt = function(e) {
      return this.cmp(e) === -1;
    }, a.prototype.lten = function(e) {
      return this.cmpn(e) <= 0;
    }, a.prototype.lte = function(e) {
      return this.cmp(e) <= 0;
    }, a.prototype.eqn = function(e) {
      return this.cmpn(e) === 0;
    }, a.prototype.eq = function(e) {
      return this.cmp(e) === 0;
    }, a.red = function(e) {
      return new O(e);
    }, a.prototype.toRed = function(e) {
      return n(!this.red, "Already a number in reduction context"), n(this.negative === 0, "red works only with positives"), e.convertTo(this)._forceRed(e);
    }, a.prototype.fromRed = function() {
      return n(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this);
    }, a.prototype._forceRed = function(e) {
      return this.red = e, this;
    }, a.prototype.forceRed = function(e) {
      return n(!this.red, "Already a number in reduction context"), this._forceRed(e);
    }, a.prototype.redAdd = function(e) {
      return n(this.red, "redAdd works only with red numbers"), this.red.add(this, e);
    }, a.prototype.redIAdd = function(e) {
      return n(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, e);
    }, a.prototype.redSub = function(e) {
      return n(this.red, "redSub works only with red numbers"), this.red.sub(this, e);
    }, a.prototype.redISub = function(e) {
      return n(this.red, "redISub works only with red numbers"), this.red.isub(this, e);
    }, a.prototype.redShl = function(e) {
      return n(this.red, "redShl works only with red numbers"), this.red.shl(this, e);
    }, a.prototype.redMul = function(e) {
      return n(this.red, "redMul works only with red numbers"), this.red._verify2(this, e), this.red.mul(this, e);
    }, a.prototype.redIMul = function(e) {
      return n(this.red, "redMul works only with red numbers"), this.red._verify2(this, e), this.red.imul(this, e);
    }, a.prototype.redSqr = function() {
      return n(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this);
    }, a.prototype.redISqr = function() {
      return n(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this);
    }, a.prototype.redSqrt = function() {
      return n(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this);
    }, a.prototype.redInvm = function() {
      return n(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this);
    }, a.prototype.redNeg = function() {
      return n(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this);
    }, a.prototype.redPow = function(e) {
      return n(this.red && !e.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, e);
    };
    var It = {
      k256: null,
      p224: null,
      p192: null,
      p25519: null
    };
    function P(p, e) {
      this.name = p, this.p = new a(e, 16), this.n = this.p.bitLength(), this.k = new a(1).iushln(this.n).isub(this.p), this.tmp = this._tmp();
    }
    P.prototype._tmp = function() {
      var e = new a(null);
      return e.words = new Array(Math.ceil(this.n / 13)), e;
    }, P.prototype.ireduce = function(e) {
      var s = e, h;
      do
        this.split(s, this.tmp), s = this.imulK(s), s = s.iadd(this.tmp), h = s.bitLength();
      while (h > this.n);
      var u = h < this.n ? -1 : s.ucmp(this.p);
      return u === 0 ? (s.words[0] = 0, s.length = 1) : u > 0 ? s.isub(this.p) : s.strip !== void 0 ? s.strip() : s._strip(), s;
    }, P.prototype.split = function(e, s) {
      e.iushrn(this.n, 0, s);
    }, P.prototype.imulK = function(e) {
      return e.imul(this.k);
    };
    function R() {
      P.call(
        this,
        "k256",
        "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
      );
    }
    f(R, P), R.prototype.split = function(e, s) {
      for (var h = 4194303, u = Math.min(e.length, 9), d = 0; d < u; d++)
        s.words[d] = e.words[d];
      if (s.length = u, e.length <= 9) {
        e.words[0] = 0, e.length = 1;
        return;
      }
      var v = e.words[9];
      for (s.words[s.length++] = v & h, d = 10; d < e.length; d++) {
        var y = e.words[d] | 0;
        e.words[d - 10] = (y & h) << 4 | v >>> 22, v = y;
      }
      v >>>= 22, e.words[d - 10] = v, v === 0 && e.length > 10 ? e.length -= 10 : e.length -= 9;
    }, R.prototype.imulK = function(e) {
      e.words[e.length] = 0, e.words[e.length + 1] = 0, e.length += 2;
      for (var s = 0, h = 0; h < e.length; h++) {
        var u = e.words[h] | 0;
        s += u * 977, e.words[h] = s & 67108863, s = u * 64 + (s / 67108864 | 0);
      }
      return e.words[e.length - 1] === 0 && (e.length--, e.words[e.length - 1] === 0 && e.length--), e;
    };
    function K() {
      P.call(
        this,
        "p224",
        "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
      );
    }
    f(K, P);
    function q() {
      P.call(
        this,
        "p192",
        "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
      );
    }
    f(q, P);
    function Rt() {
      P.call(
        this,
        "25519",
        "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
      );
    }
    f(Rt, P), Rt.prototype.imulK = function(e) {
      for (var s = 0, h = 0; h < e.length; h++) {
        var u = (e.words[h] | 0) * 19 + s, d = u & 67108863;
        u >>>= 26, e.words[h] = d, s = u;
      }
      return s !== 0 && (e.words[e.length++] = s), e;
    }, a._prime = function(e) {
      if (It[e])
        return It[e];
      var s;
      if (e === "k256")
        s = new R();
      else if (e === "p224")
        s = new K();
      else if (e === "p192")
        s = new q();
      else if (e === "p25519")
        s = new Rt();
      else
        throw new Error("Unknown prime " + e);
      return It[e] = s, s;
    };
    function O(p) {
      if (typeof p == "string") {
        var e = a._prime(p);
        this.m = e.p, this.prime = e;
      } else
        n(p.gtn(1), "modulus must be greater than 1"), this.m = p, this.prime = null;
    }
    O.prototype._verify1 = function(e) {
      n(e.negative === 0, "red works only with positives"), n(e.red, "red works only with red numbers");
    }, O.prototype._verify2 = function(e, s) {
      n((e.negative | s.negative) === 0, "red works only with positives"), n(
        e.red && e.red === s.red,
        "red works only with red numbers"
      );
    }, O.prototype.imod = function(e) {
      return this.prime ? this.prime.ireduce(e)._forceRed(this) : e.umod(this.m)._forceRed(this);
    }, O.prototype.neg = function(e) {
      return e.isZero() ? e.clone() : this.m.sub(e)._forceRed(this);
    }, O.prototype.add = function(e, s) {
      this._verify2(e, s);
      var h = e.add(s);
      return h.cmp(this.m) >= 0 && h.isub(this.m), h._forceRed(this);
    }, O.prototype.iadd = function(e, s) {
      this._verify2(e, s);
      var h = e.iadd(s);
      return h.cmp(this.m) >= 0 && h.isub(this.m), h;
    }, O.prototype.sub = function(e, s) {
      this._verify2(e, s);
      var h = e.sub(s);
      return h.cmpn(0) < 0 && h.iadd(this.m), h._forceRed(this);
    }, O.prototype.isub = function(e, s) {
      this._verify2(e, s);
      var h = e.isub(s);
      return h.cmpn(0) < 0 && h.iadd(this.m), h;
    }, O.prototype.shl = function(e, s) {
      return this._verify1(e), this.imod(e.ushln(s));
    }, O.prototype.imul = function(e, s) {
      return this._verify2(e, s), this.imod(e.imul(s));
    }, O.prototype.mul = function(e, s) {
      return this._verify2(e, s), this.imod(e.mul(s));
    }, O.prototype.isqr = function(e) {
      return this.imul(e, e.clone());
    }, O.prototype.sqr = function(e) {
      return this.mul(e, e);
    }, O.prototype.sqrt = function(e) {
      if (e.isZero())
        return e.clone();
      var s = this.m.andln(3);
      if (n(s % 2 === 1), s === 3) {
        var h = this.m.add(new a(1)).iushrn(2);
        return this.pow(e, h);
      }
      for (var u = this.m.subn(1), d = 0; !u.isZero() && u.andln(1) === 0; )
        d++, u.iushrn(1);
      n(!u.isZero());
      var v = new a(1).toRed(this), y = v.redNeg(), l = this.m.subn(1).iushrn(1), i = this.m.bitLength();
      for (i = new a(2 * i * i).toRed(this); this.pow(i, l).cmp(y) !== 0; )
        i.redIAdd(y);
      for (var c = this.pow(i, u), S = this.pow(e, u.addn(1).iushrn(1)), x = this.pow(e, u), E = d; x.cmp(v) !== 0; ) {
        for (var A = x, N = 0; A.cmp(v) !== 0; N++)
          A = A.redSqr();
        n(N < E);
        var L = this.pow(c, new a(1).iushln(E - N - 1));
        S = S.redMul(L), c = L.redSqr(), x = x.redMul(c), E = N;
      }
      return S;
    }, O.prototype.invm = function(e) {
      var s = e._invmp(this.m);
      return s.negative !== 0 ? (s.negative = 0, this.imod(s).redNeg()) : this.imod(s);
    }, O.prototype.pow = function(e, s) {
      if (s.isZero())
        return new a(1).toRed(this);
      if (s.cmpn(1) === 0)
        return e.clone();
      var h = 4, u = new Array(1 << h);
      u[0] = new a(1).toRed(this), u[1] = e;
      for (var d = 2; d < u.length; d++)
        u[d] = this.mul(u[d - 1], e);
      var v = u[0], y = 0, l = 0, i = s.bitLength() % 26;
      for (i === 0 && (i = 26), d = s.length - 1; d >= 0; d--) {
        for (var c = s.words[d], S = i - 1; S >= 0; S--) {
          var x = c >> S & 1;
          if (v !== u[0] && (v = this.sqr(v)), x === 0 && y === 0) {
            l = 0;
            continue;
          }
          y <<= 1, y |= x, l++, !(l !== h && (d !== 0 || S !== 0)) && (v = this.mul(v, u[y]), l = 0, y = 0);
        }
        i = 26;
      }
      return v;
    }, O.prototype.convertTo = function(e) {
      var s = e.umod(this.m);
      return s === e ? s.clone() : s;
    }, O.prototype.convertFrom = function(e) {
      var s = e.clone();
      return s.red = null, s;
    }, a.mont = function(e) {
      return new J(e);
    };
    function J(p) {
      O.call(this, p), this.shift = this.m.bitLength(), this.shift % 26 !== 0 && (this.shift += 26 - this.shift % 26), this.r = new a(1).iushln(this.shift), this.r2 = this.imod(this.r.sqr()), this.rinv = this.r._invmp(this.m), this.minv = this.rinv.mul(this.r).isubn(1).div(this.m), this.minv = this.minv.umod(this.r), this.minv = this.r.sub(this.minv);
    }
    f(J, O), J.prototype.convertTo = function(e) {
      return this.imod(e.ushln(this.shift));
    }, J.prototype.convertFrom = function(e) {
      var s = this.imod(e.mul(this.rinv));
      return s.red = null, s;
    }, J.prototype.imul = function(e, s) {
      if (e.isZero() || s.isZero())
        return e.words[0] = 0, e.length = 1, e;
      var h = e.imul(s), u = h.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), d = h.isub(u).iushrn(this.shift), v = d;
      return d.cmp(this.m) >= 0 ? v = d.isub(this.m) : d.cmpn(0) < 0 && (v = d.iadd(this.m)), v._forceRed(this);
    }, J.prototype.mul = function(e, s) {
      if (e.isZero() || s.isZero())
        return new a(0)._forceRed(this);
      var h = e.mul(s), u = h.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), d = h.isub(u).iushrn(this.shift), v = d;
      return d.cmp(this.m) >= 0 ? v = d.isub(this.m) : d.cmpn(0) < 0 && (v = d.iadd(this.m)), v._forceRed(this);
    }, J.prototype.invm = function(e) {
      var s = this.imod(e._invmp(this.m).mul(this.r2));
      return s._forceRed(this);
    };
  })(o, Ci);
})(Qe);
var Jr = Qe.exports, Hr = {}, tr = {}, Ve = { exports: {} };
typeof Object.create == "function" ? Ve.exports = function(t, r) {
  r && (t.super_ = r, t.prototype = Object.create(r.prototype, {
    constructor: {
      value: t,
      enumerable: !1,
      writable: !0,
      configurable: !0
    }
  }));
} : Ve.exports = function(t, r) {
  if (r) {
    t.super_ = r;
    var n = function() {
    };
    n.prototype = r.prototype, t.prototype = new n(), t.prototype.constructor = t;
  }
};
var Vt = Ve.exports, ae = Ur, Jt = ae.Buffer, Ot = {}, Nt;
for (Nt in ae)
  ae.hasOwnProperty(Nt) && (Nt === "SlowBuffer" || Nt === "Buffer" || (Ot[Nt] = ae[Nt]));
var Ht = Ot.Buffer = {};
for (Nt in Jt)
  Jt.hasOwnProperty(Nt) && (Nt === "allocUnsafe" || Nt === "allocUnsafeSlow" || (Ht[Nt] = Jt[Nt]));
Ot.Buffer.prototype = Jt.prototype;
(!Ht.from || Ht.from === Uint8Array.from) && (Ht.from = function(o, t, r) {
  if (typeof o == "number")
    throw new TypeError('The "value" argument must not be of type number. Received type ' + typeof o);
  if (o && typeof o.length > "u")
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof o);
  return Jt(o, t, r);
});
Ht.alloc || (Ht.alloc = function(o, t, r) {
  if (typeof o != "number")
    throw new TypeError('The "size" argument must be of type number. Received type ' + typeof o);
  if (o < 0 || o >= 2 * (1 << 30))
    throw new RangeError('The value "' + o + '" is invalid for option "size"');
  var n = Jt(o);
  return !t || t.length === 0 ? n.fill(0) : typeof r == "string" ? n.fill(t, r) : n.fill(t), n;
});
if (!Ot.kStringMaxLength)
  try {
    Ot.kStringMaxLength = process.binding("buffer").kStringMaxLength;
  } catch {
  }
Ot.constants || (Ot.constants = {
  MAX_LENGTH: Ot.kMaxLength
}, Ot.kStringMaxLength && (Ot.constants.MAX_STRING_LENGTH = Ot.kStringMaxLength));
var er = Ot, ve = {};
const Wi = Vt;
function Ut(o) {
  this._reporterState = {
    obj: null,
    path: [],
    options: o || {},
    errors: []
  };
}
ve.Reporter = Ut;
Ut.prototype.isError = function(t) {
  return t instanceof zt;
};
Ut.prototype.save = function() {
  const t = this._reporterState;
  return { obj: t.obj, pathLen: t.path.length };
};
Ut.prototype.restore = function(t) {
  const r = this._reporterState;
  r.obj = t.obj, r.path = r.path.slice(0, t.pathLen);
};
Ut.prototype.enterKey = function(t) {
  return this._reporterState.path.push(t);
};
Ut.prototype.exitKey = function(t) {
  const r = this._reporterState;
  r.path = r.path.slice(0, t - 1);
};
Ut.prototype.leaveKey = function(t, r, n) {
  const f = this._reporterState;
  this.exitKey(t), f.obj !== null && (f.obj[r] = n);
};
Ut.prototype.path = function() {
  return this._reporterState.path.join("/");
};
Ut.prototype.enterObject = function() {
  const t = this._reporterState, r = t.obj;
  return t.obj = {}, r;
};
Ut.prototype.leaveObject = function(t) {
  const r = this._reporterState, n = r.obj;
  return r.obj = t, n;
};
Ut.prototype.error = function(t) {
  let r;
  const n = this._reporterState, f = t instanceof zt;
  if (f ? r = t : r = new zt(n.path.map(function(a) {
    return "[" + JSON.stringify(a) + "]";
  }).join(""), t.message || t, t.stack), !n.options.partial)
    throw r;
  return f || n.errors.push(r), r;
};
Ut.prototype.wrapResult = function(t) {
  const r = this._reporterState;
  return r.options.partial ? {
    result: this.isError(t) ? null : t,
    errors: r.errors
  } : t;
};
function zt(o, t) {
  this.path = o, this.rethrow(t);
}
Wi(zt, Error);
zt.prototype.rethrow = function(t) {
  if (this.message = t + " at: " + (this.path || "(shallow)"), Error.captureStackTrace && Error.captureStackTrace(this, zt), !this.stack)
    try {
      throw new Error(this.message);
    } catch (r) {
      this.stack = r.stack;
    }
  return this;
};
var qt = {};
const Xi = Vt, ye = ve.Reporter, Yt = er.Buffer;
function Dt(o, t) {
  if (ye.call(this, t), !Yt.isBuffer(o)) {
    this.error("Input not Buffer");
    return;
  }
  this.base = o, this.offset = 0, this.length = o.length;
}
Xi(Dt, ye);
qt.DecoderBuffer = Dt;
Dt.isDecoderBuffer = function(t) {
  return t instanceof Dt ? !0 : typeof t == "object" && Yt.isBuffer(t.base) && t.constructor.name === "DecoderBuffer" && typeof t.offset == "number" && typeof t.length == "number" && typeof t.save == "function" && typeof t.restore == "function" && typeof t.isEmpty == "function" && typeof t.readUInt8 == "function" && typeof t.skip == "function" && typeof t.raw == "function";
};
Dt.prototype.save = function() {
  return { offset: this.offset, reporter: ye.prototype.save.call(this) };
};
Dt.prototype.restore = function(t) {
  const r = new Dt(this.base);
  return r.offset = t.offset, r.length = this.offset, this.offset = t.offset, ye.prototype.restore.call(this, t.reporter), r;
};
Dt.prototype.isEmpty = function() {
  return this.offset === this.length;
};
Dt.prototype.readUInt8 = function(t) {
  return this.offset + 1 <= this.length ? this.base.readUInt8(this.offset++, !0) : this.error(t || "DecoderBuffer overrun");
};
Dt.prototype.skip = function(t, r) {
  if (!(this.offset + t <= this.length))
    return this.error(r || "DecoderBuffer overrun");
  const n = new Dt(this.base);
  return n._reporterState = this._reporterState, n.offset = this.offset, n.length = this.offset + t, this.offset += t, n;
};
Dt.prototype.raw = function(t) {
  return this.base.slice(t ? t.offset : this.offset, this.length);
};
function Zt(o, t) {
  if (Array.isArray(o))
    this.length = 0, this.value = o.map(function(r) {
      return Zt.isEncoderBuffer(r) || (r = new Zt(r, t)), this.length += r.length, r;
    }, this);
  else if (typeof o == "number") {
    if (!(0 <= o && o <= 255))
      return t.error("non-byte EncoderBuffer value");
    this.value = o, this.length = 1;
  } else if (typeof o == "string")
    this.value = o, this.length = Yt.byteLength(o);
  else if (Yt.isBuffer(o))
    this.value = o, this.length = o.length;
  else
    return t.error("Unsupported type: " + typeof o);
}
qt.EncoderBuffer = Zt;
Zt.isEncoderBuffer = function(t) {
  return t instanceof Zt ? !0 : typeof t == "object" && t.constructor.name === "EncoderBuffer" && typeof t.length == "number" && typeof t.join == "function";
};
Zt.prototype.join = function(t, r) {
  return t || (t = Yt.alloc(this.length)), r || (r = 0), this.length === 0 || (Array.isArray(this.value) ? this.value.forEach(function(n) {
    n.join(t, r), r += n.length;
  }) : (typeof this.value == "number" ? t[r] = this.value : typeof this.value == "string" ? t.write(this.value, r) : Yt.isBuffer(this.value) && this.value.copy(t, r), r += this.length)), t;
};
var Qi = zr;
function zr(o, t) {
  if (!o)
    throw new Error(t || "Assertion failed");
}
zr.equal = function(t, r, n) {
  if (t != r)
    throw new Error(n || "Assertion failed: " + t + " != " + r);
};
const tn = ve.Reporter, en = qt.EncoderBuffer, rn = qt.DecoderBuffer, kt = Qi, Yr = [
  "seq",
  "seqof",
  "set",
  "setof",
  "objid",
  "bool",
  "gentime",
  "utctime",
  "null_",
  "enum",
  "int",
  "objDesc",
  "bitstr",
  "bmpstr",
  "charstr",
  "genstr",
  "graphstr",
  "ia5str",
  "iso646str",
  "numstr",
  "octstr",
  "printstr",
  "t61str",
  "unistr",
  "utf8str",
  "videostr"
], nn = [
  "key",
  "obj",
  "use",
  "optional",
  "explicit",
  "implicit",
  "def",
  "choice",
  "any",
  "contains"
].concat(Yr), on = [
  "_peekTag",
  "_decodeTag",
  "_use",
  "_decodeStr",
  "_decodeObjid",
  "_decodeTime",
  "_decodeNull",
  "_decodeInt",
  "_decodeBool",
  "_decodeList",
  "_encodeComposite",
  "_encodeStr",
  "_encodeObjid",
  "_encodeTime",
  "_encodeNull",
  "_encodeInt",
  "_encodeBool"
];
function U(o, t, r) {
  const n = {};
  this._baseState = n, n.name = r, n.enc = o, n.parent = t || null, n.children = null, n.tag = null, n.args = null, n.reverseArgs = null, n.choice = null, n.optional = !1, n.any = !1, n.obj = !1, n.use = null, n.useDecoder = null, n.key = null, n.default = null, n.explicit = null, n.implicit = null, n.contains = null, n.parent || (n.children = [], this._wrap());
}
var rr = U;
const sn = [
  "enc",
  "parent",
  "children",
  "tag",
  "args",
  "reverseArgs",
  "choice",
  "optional",
  "any",
  "obj",
  "use",
  "alteredUse",
  "key",
  "default",
  "explicit",
  "implicit",
  "contains"
];
U.prototype.clone = function() {
  const t = this._baseState, r = {};
  sn.forEach(function(f) {
    r[f] = t[f];
  });
  const n = new this.constructor(r.parent);
  return n._baseState = r, n;
};
U.prototype._wrap = function() {
  const t = this._baseState;
  nn.forEach(function(r) {
    this[r] = function() {
      const f = new this.constructor(this);
      return t.children.push(f), f[r].apply(f, arguments);
    };
  }, this);
};
U.prototype._init = function(t) {
  const r = this._baseState;
  kt(r.parent === null), t.call(this), r.children = r.children.filter(function(n) {
    return n._baseState.parent === this;
  }, this), kt.equal(r.children.length, 1, "Root node can have only one child");
};
U.prototype._useArgs = function(t) {
  const r = this._baseState, n = t.filter(function(f) {
    return f instanceof this.constructor;
  }, this);
  t = t.filter(function(f) {
    return !(f instanceof this.constructor);
  }, this), n.length !== 0 && (kt(r.children === null), r.children = n, n.forEach(function(f) {
    f._baseState.parent = this;
  }, this)), t.length !== 0 && (kt(r.args === null), r.args = t, r.reverseArgs = t.map(function(f) {
    if (typeof f != "object" || f.constructor !== Object)
      return f;
    const a = {};
    return Object.keys(f).forEach(function(m) {
      m == (m | 0) && (m |= 0);
      const g = f[m];
      a[g] = m;
    }), a;
  }));
};
on.forEach(function(o) {
  U.prototype[o] = function() {
    const r = this._baseState;
    throw new Error(o + " not implemented for encoding: " + r.enc);
  };
});
Yr.forEach(function(o) {
  U.prototype[o] = function() {
    const r = this._baseState, n = Array.prototype.slice.call(arguments);
    return kt(r.tag === null), r.tag = o, this._useArgs(n), this;
  };
});
U.prototype.use = function(t) {
  kt(t);
  const r = this._baseState;
  return kt(r.use === null), r.use = t, this;
};
U.prototype.optional = function() {
  const t = this._baseState;
  return t.optional = !0, this;
};
U.prototype.def = function(t) {
  const r = this._baseState;
  return kt(r.default === null), r.default = t, r.optional = !0, this;
};
U.prototype.explicit = function(t) {
  const r = this._baseState;
  return kt(r.explicit === null && r.implicit === null), r.explicit = t, this;
};
U.prototype.implicit = function(t) {
  const r = this._baseState;
  return kt(r.explicit === null && r.implicit === null), r.implicit = t, this;
};
U.prototype.obj = function() {
  const t = this._baseState, r = Array.prototype.slice.call(arguments);
  return t.obj = !0, r.length !== 0 && this._useArgs(r), this;
};
U.prototype.key = function(t) {
  const r = this._baseState;
  return kt(r.key === null), r.key = t, this;
};
U.prototype.any = function() {
  const t = this._baseState;
  return t.any = !0, this;
};
U.prototype.choice = function(t) {
  const r = this._baseState;
  return kt(r.choice === null), r.choice = t, this._useArgs(Object.keys(t).map(function(n) {
    return t[n];
  })), this;
};
U.prototype.contains = function(t) {
  const r = this._baseState;
  return kt(r.use === null), r.contains = t, this;
};
U.prototype._decode = function(t, r) {
  const n = this._baseState;
  if (n.parent === null)
    return t.wrapResult(n.children[0]._decode(t, r));
  let f = n.default, a = !0, m = null;
  if (n.key !== null && (m = t.enterKey(n.key)), n.optional) {
    let w = null;
    if (n.explicit !== null ? w = n.explicit : n.implicit !== null ? w = n.implicit : n.tag !== null && (w = n.tag), w === null && !n.any) {
      const M = t.save();
      try {
        n.choice === null ? this._decodeGeneric(n.tag, t, r) : this._decodeChoice(t, r), a = !0;
      } catch {
        a = !1;
      }
      t.restore(M);
    } else if (a = this._peekTag(t, w, n.any), t.isError(a))
      return a;
  }
  let g;
  if (n.obj && a && (g = t.enterObject()), a) {
    if (n.explicit !== null) {
      const M = this._decodeTag(t, n.explicit);
      if (t.isError(M))
        return M;
      t = M;
    }
    const w = t.offset;
    if (n.use === null && n.choice === null) {
      let M;
      n.any && (M = t.save());
      const b = this._decodeTag(
        t,
        n.implicit !== null ? n.implicit : n.tag,
        n.any
      );
      if (t.isError(b))
        return b;
      n.any ? f = t.raw(M) : t = b;
    }
    if (r && r.track && n.tag !== null && r.track(t.path(), w, t.length, "tagged"), r && r.track && n.tag !== null && r.track(t.path(), t.offset, t.length, "content"), n.any || (n.choice === null ? f = this._decodeGeneric(n.tag, t, r) : f = this._decodeChoice(t, r)), t.isError(f))
      return f;
    if (!n.any && n.choice === null && n.children !== null && n.children.forEach(function(b) {
      b._decode(t, r);
    }), n.contains && (n.tag === "octstr" || n.tag === "bitstr")) {
      const M = new rn(f);
      f = this._getUse(n.contains, t._reporterState.obj)._decode(M, r);
    }
  }
  return n.obj && a && (f = t.leaveObject(g)), n.key !== null && (f !== null || a === !0) ? t.leaveKey(m, n.key, f) : m !== null && t.exitKey(m), f;
};
U.prototype._decodeGeneric = function(t, r, n) {
  const f = this._baseState;
  return t === "seq" || t === "set" ? null : t === "seqof" || t === "setof" ? this._decodeList(r, t, f.args[0], n) : /str$/.test(t) ? this._decodeStr(r, t, n) : t === "objid" && f.args ? this._decodeObjid(r, f.args[0], f.args[1], n) : t === "objid" ? this._decodeObjid(r, null, null, n) : t === "gentime" || t === "utctime" ? this._decodeTime(r, t, n) : t === "null_" ? this._decodeNull(r, n) : t === "bool" ? this._decodeBool(r, n) : t === "objDesc" ? this._decodeStr(r, t, n) : t === "int" || t === "enum" ? this._decodeInt(r, f.args && f.args[0], n) : f.use !== null ? this._getUse(f.use, r._reporterState.obj)._decode(r, n) : r.error("unknown tag: " + t);
};
U.prototype._getUse = function(t, r) {
  const n = this._baseState;
  return n.useDecoder = this._use(t, r), kt(n.useDecoder._baseState.parent === null), n.useDecoder = n.useDecoder._baseState.children[0], n.implicit !== n.useDecoder._baseState.implicit && (n.useDecoder = n.useDecoder.clone(), n.useDecoder._baseState.implicit = n.implicit), n.useDecoder;
};
U.prototype._decodeChoice = function(t, r) {
  const n = this._baseState;
  let f = null, a = !1;
  return Object.keys(n.choice).some(function(m) {
    const g = t.save(), w = n.choice[m];
    try {
      const M = w._decode(t, r);
      if (t.isError(M))
        return !1;
      f = { type: m, value: M }, a = !0;
    } catch {
      return t.restore(g), !1;
    }
    return !0;
  }, this), a ? f : t.error("Choice not matched");
};
U.prototype._createEncoderBuffer = function(t) {
  return new en(t, this.reporter);
};
U.prototype._encode = function(t, r, n) {
  const f = this._baseState;
  if (f.default !== null && f.default === t)
    return;
  const a = this._encodeValue(t, r, n);
  if (a !== void 0 && !this._skipDefault(a, r, n))
    return a;
};
U.prototype._encodeValue = function(t, r, n) {
  const f = this._baseState;
  if (f.parent === null)
    return f.children[0]._encode(t, r || new tn());
  let a = null;
  if (this.reporter = r, f.optional && t === void 0)
    if (f.default !== null)
      t = f.default;
    else
      return;
  let m = null, g = !1;
  if (f.any)
    a = this._createEncoderBuffer(t);
  else if (f.choice)
    a = this._encodeChoice(t, r);
  else if (f.contains)
    m = this._getUse(f.contains, n)._encode(t, r), g = !0;
  else if (f.children)
    m = f.children.map(function(w) {
      if (w._baseState.tag === "null_")
        return w._encode(null, r, t);
      if (w._baseState.key === null)
        return r.error("Child should have a key");
      const M = r.enterKey(w._baseState.key);
      if (typeof t != "object")
        return r.error("Child expected, but input is not object");
      const b = w._encode(t[w._baseState.key], r, t);
      return r.leaveKey(M), b;
    }, this).filter(function(w) {
      return w;
    }), m = this._createEncoderBuffer(m);
  else if (f.tag === "seqof" || f.tag === "setof") {
    if (!(f.args && f.args.length === 1))
      return r.error("Too many args for : " + f.tag);
    if (!Array.isArray(t))
      return r.error("seqof/setof, but data is not Array");
    const w = this.clone();
    w._baseState.implicit = null, m = this._createEncoderBuffer(t.map(function(M) {
      const b = this._baseState;
      return this._getUse(b.args[0], t)._encode(M, r);
    }, w));
  } else
    f.use !== null ? a = this._getUse(f.use, n)._encode(t, r) : (m = this._encodePrimitive(f.tag, t), g = !0);
  if (!f.any && f.choice === null) {
    const w = f.implicit !== null ? f.implicit : f.tag, M = f.implicit === null ? "universal" : "context";
    w === null ? f.use === null && r.error("Tag could be omitted only for .use()") : f.use === null && (a = this._encodeComposite(w, g, M, m));
  }
  return f.explicit !== null && (a = this._encodeComposite(f.explicit, !1, "context", a)), a;
};
U.prototype._encodeChoice = function(t, r) {
  const n = this._baseState, f = n.choice[t.type];
  return f || kt(
    !1,
    t.type + " not found in " + JSON.stringify(Object.keys(n.choice))
  ), f._encode(t.value, r);
};
U.prototype._encodePrimitive = function(t, r) {
  const n = this._baseState;
  if (/str$/.test(t))
    return this._encodeStr(r, t);
  if (t === "objid" && n.args)
    return this._encodeObjid(r, n.reverseArgs[0], n.args[1]);
  if (t === "objid")
    return this._encodeObjid(r, null, null);
  if (t === "gentime" || t === "utctime")
    return this._encodeTime(r, t);
  if (t === "null_")
    return this._encodeNull();
  if (t === "int" || t === "enum")
    return this._encodeInt(r, n.args && n.reverseArgs[0]);
  if (t === "bool")
    return this._encodeBool(r);
  if (t === "objDesc")
    return this._encodeStr(r, t);
  throw new Error("Unsupported tag: " + t);
};
U.prototype._isNumstr = function(t) {
  return /^[0-9 ]*$/.test(t);
};
U.prototype._isPrintstr = function(t) {
  return /^[A-Za-z0-9 '()+,-./:=?]*$/.test(t);
};
var ge = {};
(function(o) {
  function t(r) {
    const n = {};
    return Object.keys(r).forEach(function(f) {
      (f | 0) == f && (f = f | 0);
      const a = r[f];
      n[a] = f;
    }), n;
  }
  o.tagClass = {
    0: "universal",
    1: "application",
    2: "context",
    3: "private"
  }, o.tagClassByName = t(o.tagClass), o.tag = {
    0: "end",
    1: "bool",
    2: "int",
    3: "bitstr",
    4: "octstr",
    5: "null_",
    6: "objid",
    7: "objDesc",
    8: "external",
    9: "real",
    10: "enum",
    11: "embed",
    12: "utf8str",
    13: "relativeOid",
    16: "seq",
    17: "set",
    18: "numstr",
    19: "printstr",
    20: "t61str",
    21: "videostr",
    22: "ia5str",
    23: "utctime",
    24: "gentime",
    25: "graphstr",
    26: "iso646str",
    27: "genstr",
    28: "unistr",
    29: "charstr",
    30: "bmpstr"
  }, o.tagByName = t(o.tag);
})(ge);
const an = Vt, Kt = er.Buffer, Zr = rr, $e = ge;
function Wr(o) {
  this.enc = "der", this.name = o.name, this.entity = o, this.tree = new $t(), this.tree._init(o.body);
}
var Xr = Wr;
Wr.prototype.encode = function(t, r) {
  return this.tree._encode(t, r).join();
};
function $t(o) {
  Zr.call(this, "der", o);
}
an($t, Zr);
$t.prototype._encodeComposite = function(t, r, n, f) {
  const a = fn(t, r, n, this.reporter);
  if (f.length < 128) {
    const w = Kt.alloc(2);
    return w[0] = a, w[1] = f.length, this._createEncoderBuffer([w, f]);
  }
  let m = 1;
  for (let w = f.length; w >= 256; w >>= 8)
    m++;
  const g = Kt.alloc(1 + 1 + m);
  g[0] = a, g[1] = 128 | m;
  for (let w = 1 + m, M = f.length; M > 0; w--, M >>= 8)
    g[w] = M & 255;
  return this._createEncoderBuffer([g, f]);
};
$t.prototype._encodeStr = function(t, r) {
  if (r === "bitstr")
    return this._createEncoderBuffer([t.unused | 0, t.data]);
  if (r === "bmpstr") {
    const n = Kt.alloc(t.length * 2);
    for (let f = 0; f < t.length; f++)
      n.writeUInt16BE(t.charCodeAt(f), f * 2);
    return this._createEncoderBuffer(n);
  } else
    return r === "numstr" ? this._isNumstr(t) ? this._createEncoderBuffer(t) : this.reporter.error("Encoding of string type: numstr supports only digits and space") : r === "printstr" ? this._isPrintstr(t) ? this._createEncoderBuffer(t) : this.reporter.error("Encoding of string type: printstr supports only latin upper and lower case letters, digits, space, apostrophe, left and rigth parenthesis, plus sign, comma, hyphen, dot, slash, colon, equal sign, question mark") : /str$/.test(r) ? this._createEncoderBuffer(t) : r === "objDesc" ? this._createEncoderBuffer(t) : this.reporter.error("Encoding of string type: " + r + " unsupported");
};
$t.prototype._encodeObjid = function(t, r, n) {
  if (typeof t == "string") {
    if (!r)
      return this.reporter.error("string objid given, but no values map found");
    if (!r.hasOwnProperty(t))
      return this.reporter.error("objid not found in values map");
    t = r[t].split(/[\s.]+/g);
    for (let g = 0; g < t.length; g++)
      t[g] |= 0;
  } else if (Array.isArray(t)) {
    t = t.slice();
    for (let g = 0; g < t.length; g++)
      t[g] |= 0;
  }
  if (!Array.isArray(t))
    return this.reporter.error("objid() should be either array or string, got: " + JSON.stringify(t));
  if (!n) {
    if (t[1] >= 40)
      return this.reporter.error("Second objid identifier OOB");
    t.splice(0, 2, t[0] * 40 + t[1]);
  }
  let f = 0;
  for (let g = 0; g < t.length; g++) {
    let w = t[g];
    for (f++; w >= 128; w >>= 7)
      f++;
  }
  const a = Kt.alloc(f);
  let m = a.length - 1;
  for (let g = t.length - 1; g >= 0; g--) {
    let w = t[g];
    for (a[m--] = w & 127; (w >>= 7) > 0; )
      a[m--] = 128 | w & 127;
  }
  return this._createEncoderBuffer(a);
};
function Ct(o) {
  return o < 10 ? "0" + o : o;
}
$t.prototype._encodeTime = function(t, r) {
  let n;
  const f = new Date(t);
  return r === "gentime" ? n = [
    Ct(f.getUTCFullYear()),
    Ct(f.getUTCMonth() + 1),
    Ct(f.getUTCDate()),
    Ct(f.getUTCHours()),
    Ct(f.getUTCMinutes()),
    Ct(f.getUTCSeconds()),
    "Z"
  ].join("") : r === "utctime" ? n = [
    Ct(f.getUTCFullYear() % 100),
    Ct(f.getUTCMonth() + 1),
    Ct(f.getUTCDate()),
    Ct(f.getUTCHours()),
    Ct(f.getUTCMinutes()),
    Ct(f.getUTCSeconds()),
    "Z"
  ].join("") : this.reporter.error("Encoding " + r + " time is not supported yet"), this._encodeStr(n, "octstr");
};
$t.prototype._encodeNull = function() {
  return this._createEncoderBuffer("");
};
$t.prototype._encodeInt = function(t, r) {
  if (typeof t == "string") {
    if (!r)
      return this.reporter.error("String int or enum given, but no values map");
    if (!r.hasOwnProperty(t))
      return this.reporter.error("Values map doesn't contain: " + JSON.stringify(t));
    t = r[t];
  }
  if (typeof t != "number" && !Kt.isBuffer(t)) {
    const a = t.toArray();
    !t.sign && a[0] & 128 && a.unshift(0), t = Kt.from(a);
  }
  if (Kt.isBuffer(t)) {
    let a = t.length;
    t.length === 0 && a++;
    const m = Kt.alloc(a);
    return t.copy(m), t.length === 0 && (m[0] = 0), this._createEncoderBuffer(m);
  }
  if (t < 128)
    return this._createEncoderBuffer(t);
  if (t < 256)
    return this._createEncoderBuffer([0, t]);
  let n = 1;
  for (let a = t; a >= 256; a >>= 8)
    n++;
  const f = new Array(n);
  for (let a = f.length - 1; a >= 0; a--)
    f[a] = t & 255, t >>= 8;
  return f[0] & 128 && f.unshift(0), this._createEncoderBuffer(Kt.from(f));
};
$t.prototype._encodeBool = function(t) {
  return this._createEncoderBuffer(t ? 255 : 0);
};
$t.prototype._use = function(t, r) {
  return typeof t == "function" && (t = t(r)), t._getEncoder("der").tree;
};
$t.prototype._skipDefault = function(t, r, n) {
  const f = this._baseState;
  let a;
  if (f.default === null)
    return !1;
  const m = t.join();
  if (f.defaultBuffer === void 0 && (f.defaultBuffer = this._encodeValue(f.default, r, n).join()), m.length !== f.defaultBuffer.length)
    return !1;
  for (a = 0; a < m.length; a++)
    if (m[a] !== f.defaultBuffer[a])
      return !1;
  return !0;
};
function fn(o, t, r, n) {
  let f;
  if (o === "seqof" ? o = "seq" : o === "setof" && (o = "set"), $e.tagByName.hasOwnProperty(o))
    f = $e.tagByName[o];
  else if (typeof o == "number" && (o | 0) === o)
    f = o;
  else
    return n.error("Unknown tag: " + o);
  return f >= 31 ? n.error("Multi-octet tag encoding unsupported") : (t || (f |= 32), f |= $e.tagClassByName[r || "universal"] << 6, f);
}
const hn = Vt, ir = Xr;
function nr(o) {
  ir.call(this, o), this.enc = "pem";
}
hn(nr, ir);
var un = nr;
nr.prototype.encode = function(t, r) {
  const f = ir.prototype.encode.call(this, t).toString("base64"), a = ["-----BEGIN " + r.label + "-----"];
  for (let m = 0; m < f.length; m += 64)
    a.push(f.slice(m, m + 64));
  return a.push("-----END " + r.label + "-----"), a.join(`
`);
};
(function(o) {
  const t = o;
  t.der = Xr, t.pem = un;
})(tr);
var or = {};
const ln = Vt, cn = Jr, Br = qt.DecoderBuffer, Qr = rr, Ir = ge;
function ti(o) {
  this.enc = "der", this.name = o.name, this.entity = o, this.tree = new Pt(), this.tree._init(o.body);
}
var ei = ti;
ti.prototype.decode = function(t, r) {
  return Br.isDecoderBuffer(t) || (t = new Br(t, r)), this.tree._decode(t, r);
};
function Pt(o) {
  Qr.call(this, "der", o);
}
ln(Pt, Qr);
Pt.prototype._peekTag = function(t, r, n) {
  if (t.isEmpty())
    return !1;
  const f = t.save(), a = sr(t, 'Failed to peek tag: "' + r + '"');
  return t.isError(a) ? a : (t.restore(f), a.tag === r || a.tagStr === r || a.tagStr + "of" === r || n);
};
Pt.prototype._decodeTag = function(t, r, n) {
  const f = sr(
    t,
    'Failed to decode tag of "' + r + '"'
  );
  if (t.isError(f))
    return f;
  let a = ri(
    t,
    f.primitive,
    'Failed to get length of "' + r + '"'
  );
  if (t.isError(a))
    return a;
  if (!n && f.tag !== r && f.tagStr !== r && f.tagStr + "of" !== r)
    return t.error('Failed to match tag: "' + r + '"');
  if (f.primitive || a !== null)
    return t.skip(a, 'Failed to match body of: "' + r + '"');
  const m = t.save(), g = this._skipUntilEnd(
    t,
    'Failed to skip indefinite length body: "' + this.tag + '"'
  );
  return t.isError(g) ? g : (a = t.offset - m.offset, t.restore(m), t.skip(a, 'Failed to match body of: "' + r + '"'));
};
Pt.prototype._skipUntilEnd = function(t, r) {
  for (; ; ) {
    const n = sr(t, r);
    if (t.isError(n))
      return n;
    const f = ri(t, n.primitive, r);
    if (t.isError(f))
      return f;
    let a;
    if (n.primitive || f !== null ? a = t.skip(f) : a = this._skipUntilEnd(t, r), t.isError(a))
      return a;
    if (n.tagStr === "end")
      break;
  }
};
Pt.prototype._decodeList = function(t, r, n, f) {
  const a = [];
  for (; !t.isEmpty(); ) {
    const m = this._peekTag(t, "end");
    if (t.isError(m))
      return m;
    const g = n.decode(t, "der", f);
    if (t.isError(g) && m)
      break;
    a.push(g);
  }
  return a;
};
Pt.prototype._decodeStr = function(t, r) {
  if (r === "bitstr") {
    const n = t.readUInt8();
    return t.isError(n) ? n : { unused: n, data: t.raw() };
  } else if (r === "bmpstr") {
    const n = t.raw();
    if (n.length % 2 === 1)
      return t.error("Decoding of string type: bmpstr length mismatch");
    let f = "";
    for (let a = 0; a < n.length / 2; a++)
      f += String.fromCharCode(n.readUInt16BE(a * 2));
    return f;
  } else if (r === "numstr") {
    const n = t.raw().toString("ascii");
    return this._isNumstr(n) ? n : t.error("Decoding of string type: numstr unsupported characters");
  } else {
    if (r === "octstr")
      return t.raw();
    if (r === "objDesc")
      return t.raw();
    if (r === "printstr") {
      const n = t.raw().toString("ascii");
      return this._isPrintstr(n) ? n : t.error("Decoding of string type: printstr unsupported characters");
    } else
      return /str$/.test(r) ? t.raw().toString() : t.error("Decoding of string type: " + r + " unsupported");
  }
};
Pt.prototype._decodeObjid = function(t, r, n) {
  let f;
  const a = [];
  let m = 0, g = 0;
  for (; !t.isEmpty(); )
    g = t.readUInt8(), m <<= 7, m |= g & 127, g & 128 || (a.push(m), m = 0);
  g & 128 && a.push(m);
  const w = a[0] / 40 | 0, M = a[0] % 40;
  if (n ? f = a : f = [w, M].concat(a.slice(1)), r) {
    let b = r[f.join(" ")];
    b === void 0 && (b = r[f.join(".")]), b !== void 0 && (f = b);
  }
  return f;
};
Pt.prototype._decodeTime = function(t, r) {
  const n = t.raw().toString();
  let f, a, m, g, w, M;
  if (r === "gentime")
    f = n.slice(0, 4) | 0, a = n.slice(4, 6) | 0, m = n.slice(6, 8) | 0, g = n.slice(8, 10) | 0, w = n.slice(10, 12) | 0, M = n.slice(12, 14) | 0;
  else if (r === "utctime")
    f = n.slice(0, 2) | 0, a = n.slice(2, 4) | 0, m = n.slice(4, 6) | 0, g = n.slice(6, 8) | 0, w = n.slice(8, 10) | 0, M = n.slice(10, 12) | 0, f < 70 ? f = 2e3 + f : f = 1900 + f;
  else
    return t.error("Decoding " + r + " time is not supported yet");
  return Date.UTC(f, a - 1, m, g, w, M, 0);
};
Pt.prototype._decodeNull = function() {
  return null;
};
Pt.prototype._decodeBool = function(t) {
  const r = t.readUInt8();
  return t.isError(r) ? r : r !== 0;
};
Pt.prototype._decodeInt = function(t, r) {
  const n = t.raw();
  let f = new cn(n);
  return r && (f = r[f.toString(10)] || f), f;
};
Pt.prototype._use = function(t, r) {
  return typeof t == "function" && (t = t(r)), t._getDecoder("der").tree;
};
function sr(o, t) {
  let r = o.readUInt8(t);
  if (o.isError(r))
    return r;
  const n = Ir.tagClass[r >> 6], f = (r & 32) === 0;
  if ((r & 31) === 31) {
    let m = r;
    for (r = 0; (m & 128) === 128; ) {
      if (m = o.readUInt8(t), o.isError(m))
        return m;
      r <<= 7, r |= m & 127;
    }
  } else
    r &= 31;
  const a = Ir.tag[r];
  return {
    cls: n,
    primitive: f,
    tag: r,
    tagStr: a
  };
}
function ri(o, t, r) {
  let n = o.readUInt8(r);
  if (o.isError(n))
    return n;
  if (!t && n === 128)
    return null;
  if (!(n & 128))
    return n;
  const f = n & 127;
  if (f > 4)
    return o.error("length octect is too long");
  n = 0;
  for (let a = 0; a < f; a++) {
    n <<= 8;
    const m = o.readUInt8(r);
    if (o.isError(m))
      return m;
    n |= m;
  }
  return n;
}
const dn = Vt, pn = er.Buffer, ar = ei;
function fr(o) {
  ar.call(this, o), this.enc = "pem";
}
dn(fr, ar);
var mn = fr;
fr.prototype.decode = function(t, r) {
  const n = t.toString().split(/[\r\n]+/g), f = r.label.toUpperCase(), a = /^-----(BEGIN|END) ([^-]+)-----$/;
  let m = -1, g = -1;
  for (let b = 0; b < n.length; b++) {
    const _ = n[b].match(a);
    if (_ !== null && _[2] === f)
      if (m === -1) {
        if (_[1] !== "BEGIN")
          break;
        m = b;
      } else {
        if (_[1] !== "END")
          break;
        g = b;
        break;
      }
  }
  if (m === -1 || g === -1)
    throw new Error("PEM section not found for: " + f);
  const w = n.slice(m + 1, g).join("");
  w.replace(/[^a-z0-9+/=]+/gi, "");
  const M = pn.from(w, "base64");
  return ar.prototype.decode.call(this, M, r);
};
(function(o) {
  const t = o;
  t.der = ei, t.pem = mn;
})(or);
(function(o) {
  const t = tr, r = or, n = Vt, f = o;
  f.define = function(g, w) {
    return new a(g, w);
  };
  function a(m, g) {
    this.name = m, this.body = g, this.decoders = {}, this.encoders = {};
  }
  a.prototype._createNamed = function(g) {
    const w = this.name;
    function M(b) {
      this._initNamed(b, w);
    }
    return n(M, g), M.prototype._initNamed = function(_, I) {
      g.call(this, _, I);
    }, new M(this);
  }, a.prototype._getDecoder = function(g) {
    return g = g || "der", this.decoders.hasOwnProperty(g) || (this.decoders[g] = this._createNamed(r[g])), this.decoders[g];
  }, a.prototype.decode = function(g, w, M) {
    return this._getDecoder(w).decode(g, M);
  }, a.prototype._getEncoder = function(g) {
    return g = g || "der", this.encoders.hasOwnProperty(g) || (this.encoders[g] = this._createNamed(t[g])), this.encoders[g];
  }, a.prototype.encode = function(g, w, M) {
    return this._getEncoder(w).encode(g, M);
  };
})(Hr);
var ii = {};
(function(o) {
  const t = o;
  t.Reporter = ve.Reporter, t.DecoderBuffer = qt.DecoderBuffer, t.EncoderBuffer = qt.EncoderBuffer, t.Node = rr;
})(ii);
var ni = {};
(function(o) {
  const t = o;
  t._reverse = function(n) {
    const f = {};
    return Object.keys(n).forEach(function(a) {
      (a | 0) == a && (a = a | 0);
      const m = n[a];
      f[m] = a;
    }), f;
  }, t.der = ge;
})(ni);
(function(o) {
  const t = o;
  t.bignum = Jr, t.define = Hr.define, t.base = ii, t.constants = ni, t.decoders = or, t.encoders = tr;
})(Gr);
var Ge = { exports: {} };
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
(function(o, t) {
  var r = Ur, n = r.Buffer;
  function f(m, g) {
    for (var w in m)
      g[w] = m[w];
  }
  n.from && n.alloc && n.allocUnsafe && n.allocUnsafeSlow ? o.exports = r : (f(r, t), t.Buffer = a);
  function a(m, g, w) {
    return n(m, g, w);
  }
  a.prototype = Object.create(n.prototype), f(n, a), a.from = function(m, g, w) {
    if (typeof m == "number")
      throw new TypeError("Argument must not be a number");
    return n(m, g, w);
  }, a.alloc = function(m, g, w) {
    if (typeof m != "number")
      throw new TypeError("Argument must be a number");
    var M = n(m);
    return g !== void 0 ? typeof w == "string" ? M.fill(g, w) : M.fill(g) : M.fill(0), M;
  }, a.allocUnsafe = function(m) {
    if (typeof m != "number")
      throw new TypeError("Argument must be a number");
    return n(m);
  }, a.allocUnsafeSlow = function(m) {
    if (typeof m != "number")
      throw new TypeError("Argument must be a number");
    return r.SlowBuffer(m);
  };
})(Ge, Ge.exports);
var vn = Ge.exports;
function Le(o) {
  var t = (o / 8 | 0) + (o % 8 === 0 ? 0 : 1);
  return t;
}
var yn = {
  ES256: Le(256),
  ES384: Le(384),
  ES512: Le(521)
};
function gn(o) {
  var t = yn[o];
  if (t)
    return t;
  throw new Error('Unknown algorithm "' + o + '"');
}
var wn = gn, he = vn.Buffer, oi = wn, ue = 128, si = 0, Mn = 32, bn = 16, _n = 2, ai = bn | Mn | si << 6, le = _n | si << 6;
function Sn(o) {
  return o.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function fi(o) {
  if (he.isBuffer(o))
    return o;
  if (typeof o == "string")
    return he.from(o, "base64");
  throw new TypeError("ECDSA signature must be a Base64 string or a Buffer");
}
function xn(o, t) {
  o = fi(o);
  var r = oi(t), n = r + 1, f = o.length, a = 0;
  if (o[a++] !== ai)
    throw new Error('Could not find expected "seq"');
  var m = o[a++];
  if (m === (ue | 1) && (m = o[a++]), f - a < m)
    throw new Error('"seq" specified length of "' + m + '", only "' + (f - a) + '" remaining');
  if (o[a++] !== le)
    throw new Error('Could not find expected "int" for "r"');
  var g = o[a++];
  if (f - a - 2 < g)
    throw new Error('"r" specified length of "' + g + '", only "' + (f - a - 2) + '" available');
  if (n < g)
    throw new Error('"r" specified length of "' + g + '", max of "' + n + '" is acceptable');
  var w = a;
  if (a += g, o[a++] !== le)
    throw new Error('Could not find expected "int" for "s"');
  var M = o[a++];
  if (f - a !== M)
    throw new Error('"s" specified length of "' + M + '", expected "' + (f - a) + '"');
  if (n < M)
    throw new Error('"s" specified length of "' + M + '", max of "' + n + '" is acceptable');
  var b = a;
  if (a += M, a !== f)
    throw new Error('Expected to consume entire buffer, but "' + (f - a) + '" bytes remain');
  var _ = r - g, I = r - M, k = he.allocUnsafe(_ + g + I + M);
  for (a = 0; a < _; ++a)
    k[a] = 0;
  o.copy(k, a, w + Math.max(-_, 0), w + g), a = r;
  for (var $ = a; a < $ + I; ++a)
    k[a] = 0;
  return o.copy(k, a, b + Math.max(-I, 0), b + M), k = k.toString("base64"), k = Sn(k), k;
}
function Rr(o, t, r) {
  for (var n = 0; t + n < r && o[t + n] === 0; )
    ++n;
  var f = o[t + n] >= ue;
  return f && --n, n;
}
function En(o, t) {
  o = fi(o);
  var r = oi(t), n = o.length;
  if (n !== r * 2)
    throw new TypeError('"' + t + '" signatures must be "' + r * 2 + '" bytes, saw "' + n + '"');
  var f = Rr(o, 0, r), a = Rr(o, r, o.length), m = r - f, g = r - a, w = 1 + 1 + m + 1 + 1 + g, M = w < ue, b = he.allocUnsafe((M ? 2 : 3) + w), _ = 0;
  return b[_++] = ai, M ? b[_++] = w : (b[_++] = ue | 1, b[_++] = w & 255), b[_++] = le, b[_++] = m, f < 0 ? (b[_++] = 0, _ += o.copy(b, _, 0, r)) : _ += o.copy(b, _, f, r), b[_++] = le, b[_++] = g, a < 0 ? (b[_++] = 0, o.copy(b, _, r)) : o.copy(b, _, r + a), b;
}
var An = {
  derToJose: xn,
  joseToDer: En
};
const hr = Gr, {
  createHmac: hi,
  createVerify: Tn,
  createSign: ui,
  timingSafeEqual: Bn,
  createPublicKey: In,
  constants: {
    RSA_PKCS1_PSS_PADDING: li,
    RSA_PSS_SALTLEN_DIGEST: ci,
    RSA_PKCS1_PADDING: di,
    RSA_PSS_SALTLEN_MAX_SIGN: Rn,
    RSA_PSS_SALTLEN_AUTO: kn
  }
} = re;
let { sign: ce, verify: kr } = re;
const { joseToDer: Pn, derToJose: Cn } = An, pi = Vr, { TokenError: D } = ie, mi = typeof ce == "function", vi = /[=+/]/g, On = { "=": "", "+": "-", "/": "_" }, yi = /^-----BEGIN(?: (RSA|EC|ENCRYPTED))? PRIVATE KEY-----/, gi = /^-----BEGIN( RSA)? PUBLIC KEY-----/, Je = "-----BEGIN CERTIFICATE-----", se = new pi(1e3), je = new pi(1e3), wi = ["HS256", "HS384", "HS512"], Nn = ["ES256", "ES384", "ES512"], Mi = ["RS256", "RS384", "RS512", "PS256", "PS384", "PS512"], Dn = ["EdDSA"], bi = {
  "1.2.840.10045.3.1.7": { bits: "256", names: ["P-256", "prime256v1"] },
  "1.3.132.0.10": { bits: "256", names: ["secp256k1"] },
  "1.3.132.0.34": { bits: "384", names: ["P-384", "secp384r1"] },
  "1.3.132.0.35": { bits: "512", names: ["P-521", "secp521r1"] }
};
mi || (ce = function(o, t, r) {
  if (typeof o > "u")
    throw new D(D.codes.signError, "EdDSA algorithms are not supported by your Node.js version.");
  return ui(o).update(t).sign(r);
});
const Un = hr.define("PrivateKey", function() {
  this.seq().obj(
    this.key("version").int(),
    this.key("algorithm").seq().obj(
      this.key("algorithm").objid(),
      this.key("parameters").optional().objid()
    )
  );
}), $n = hr.define("PublicKey", function() {
  this.seq().obj(
    this.key("algorithm").seq().obj(
      this.key("algorithm").objid(),
      this.key("parameters").optional().objid()
    )
  );
}), Ln = hr.define("ECPrivateKey", function() {
  this.seq().obj(
    this.key("version").int(),
    this.key("privateKey").octstr(),
    this.key("parameters").explicit(0).optional().choice({ namedCurve: this.objid() })
  );
});
function _i(o) {
  return On[o];
}
function te(o, t, r, n) {
  return o.set(t, [r, n]), r || n;
}
function jn(o) {
  if (o.match(gi) || o.includes(Je))
    throw new D(D.codes.invalidKey, "Public keys are not supported for signing.");
  const t = o.trim().match(yi);
  if (!t)
    return "HS256";
  let r, n, f;
  switch (t[1]) {
    case "RSA":
      return "RS256";
    case "EC":
      r = Ln.decode(o, "pem", { label: "EC PRIVATE KEY" }), f = r.parameters.value.join(".");
      break;
    case "ENCRYPTED":
      return "ENCRYPTED";
    default:
      switch (r = Un.decode(o, "pem", { label: "PRIVATE KEY" }), n = r.algorithm.algorithm.join("."), n) {
        case "1.2.840.113549.1.1.1":
          return "RS256";
        case "1.2.840.10045.2.1":
          f = r.algorithm.parameters.join(".");
          break;
        case "1.3.101.112":
        case "1.3.101.113":
          return "EdDSA";
        default:
          throw new D(D.codes.invalidKey, `Unsupported PEM PCKS8 private key with OID ${n}.`);
      }
  }
  const a = bi[f];
  if (!a)
    throw new D(D.codes.invalidKey, `Unsupported EC private key with curve ${f}.`);
  return `ES${a.bits}`;
}
function Kn(o) {
  if (o.match(yi))
    throw new D(D.codes.invalidKey, "Private keys are not supported for verifying.");
  if (!o.match(gi) && !o.includes(Je))
    return wi;
  o.includes(Je) && (o = In(o).export({ type: "spki", format: "pem" }));
  const t = $n.decode(o, "pem", { label: "PUBLIC KEY" }), r = t.algorithm.algorithm.join(".");
  let n;
  switch (r) {
    case "1.2.840.113549.1.1.1":
      return Mi;
    case "1.2.840.10045.2.1":
      n = t.algorithm.parameters.join(".");
      break;
    case "1.3.101.112":
    case "1.3.101.113":
      return ["EdDSA"];
    default:
      throw new D(D.codes.invalidKey, `Unsupported PEM PCKS8 public key with OID ${r}.`);
  }
  const f = bi[n];
  if (!f)
    throw new D(D.codes.invalidKey, `Unsupported EC public key with curve ${n}.`);
  return [`ES${f.bits}`];
}
function Fn(o, t) {
  if (o instanceof Buffer)
    o = o.toString("utf-8");
  else if (typeof o != "string")
    throw new D(D.codes.invalidKey, "The private key must be a string or a buffer.");
  const [r, n] = se.get(o) || [];
  if (r)
    return r;
  if (n)
    throw n;
  try {
    const f = jn(o);
    return f === "ENCRYPTED" ? te(se, o, t) : te(se, o, f);
  } catch (f) {
    throw te(se, o, null, D.wrap(f, D.codes.invalidKey, "Unsupported PEM private key."));
  }
}
function qn(o) {
  if (!o)
    return "none";
  const [t, r] = je.get(o) || [];
  if (t)
    return t;
  if (r)
    throw r;
  try {
    if (o instanceof Buffer)
      o = o.toString("utf-8");
    else if (typeof o != "string")
      throw new D(D.codes.invalidKey, "The public key must be a string or a buffer.");
    return te(je, o, Kn(o));
  } catch (n) {
    throw te(
      je,
      o,
      null,
      D.wrap(n, D.codes.invalidKey, "Unsupported PEM public key.")
    );
  }
}
function Vn(o, t, r) {
  try {
    const n = o.slice(0, 2), f = `sha${o.slice(2)}`;
    let a, m;
    switch (n) {
      case "HS":
        a = hi(f, t).update(r).digest("base64");
        break;
      case "ES":
        a = Cn(ce(f, Buffer.from(r, "utf-8"), t), o).toString("base64");
        break;
      case "RS":
      case "PS":
        m = {
          key: t,
          padding: di,
          saltLength: Rn
        }, n === "PS" && (m.padding = li, m.saltLength = ci), a = ui(f).update(r).sign(m).toString("base64");
        break;
      case "Ed":
        a = ce(void 0, Buffer.from(r, "utf-8"), t).toString("base64");
    }
    return a.replace(vi, _i);
  } catch (n) {
    throw new D(D.codes.signError, "Cannot create the signature.", { originalError: n });
  }
}
function Gn(o, t, r, n) {
  try {
    const f = o.slice(0, 2), a = `SHA${o.slice(2)}`;
    if (n = Buffer.from(n, "base64"), f === "HS")
      try {
        return Bn(
          hi(a, t).update(r).digest(),
          n
        );
      } catch {
        return !1;
      }
    else if (f === "Ed") {
      if (typeof kr == "function")
        return kr(void 0, Buffer.from(r, "utf-8"), t, n);
      throw new D(D.codes.signError, "EdDSA algorithms are not supported by your Node.js version.");
    }
    const m = { key: t, padding: di, saltLength: kn };
    return f === "PS" ? (m.padding = li, m.saltLength = ci) : f === "ES" && (n = Pn(n, o)), Tn("RSA-" + a).update(r).verify(m, n);
  } catch (f) {
    throw new D(D.codes.verifyError, "Cannot verify the signature.", { originalError: f });
  }
}
var Si = {
  useNewCrypto: mi,
  base64UrlMatcher: vi,
  base64UrlReplacer: _i,
  hsAlgorithms: wi,
  rsaAlgorithms: Mi,
  esAlgorithms: Nn,
  edAlgorithms: Dn,
  detectPrivateKeyAlgorithm: Fn,
  detectPublicKeyAlgorithms: qn,
  createSignature: Vn,
  verifySignature: Gn
};
const { createHash: Pr } = re, Jn = /"alg"\s*:\s*"[HERP]S(256|384)"/m, Hn = /"alg"\s*:\s*"EdDSA"/m, zn = /"crv"\s*:\s*"Ed448"/m;
function Yn(o, t, r) {
  const n = o(t, r);
  n && typeof n.then == "function" && n.then((f) => {
    process.nextTick(() => r(null, f));
  }).catch(r);
}
function Zn(o) {
  if (typeof o == "function")
    return [o];
  let t, r;
  const n = new Promise((f, a) => {
    t = f, r = a;
  });
  return [
    function(f, a) {
      return f ? r(f) : t(a);
    },
    n
  ];
}
function Wn(o) {
  const t = o.split(".", 1)[0], r = Buffer.from(t, "base64").toString("utf-8");
  let n = null;
  if (r.match(Hn) && r.match(zn))
    n = Pr("shake256", { outputLength: 114 });
  else {
    const f = r.match(Jn);
    n = Pr(`sha${f ? f[1] : "512"}`);
  }
  return n.update(o).digest("hex");
}
var xi = {
  getAsyncKey: Yn,
  ensurePromiseCallback: Zn,
  hashToken: Wn
};
const { createPublicKey: Xn, createSecretKey: Qn } = re, to = Vr, { useNewCrypto: eo, hsAlgorithms: Ei, verifySignature: ro, detectPublicKeyAlgorithms: Ai } = Si, io = Lr, { TokenError: B } = ie, { getAsyncKey: no, ensurePromiseCallback: oo, hashToken: He } = xi, so = 1e3;
function ao(o, t) {
  return o === t;
}
function Ti(o, t) {
  let r = !1;
  for (const n of o)
    if (r = t.indexOf(n) !== -1, r)
      break;
  if (!r)
    throw new B(
      B.codes.invalidKey,
      `Invalid public key provided for algorithms ${o.join(", ")}.`
    );
}
function Bi(o, t) {
  return typeof o == "string" && (o = Buffer.from(o, "utf-8")), eo && (o = t ? Qn(o) : Xn(o)), o;
}
function Wt(o) {
  return Array.isArray(o) || (o = [o]), o.filter((t) => t).map((t) => t && typeof t.test == "function" ? t : { test: ao.bind(null, t) });
}
function fo(o) {
  const t = parseInt(o === !0 ? so : o, 10);
  return t > 0 ? new to(t) : null;
}
function Gt({
  cache: o,
  token: t,
  cacheTTL: r,
  payload: n,
  ignoreExpiration: f,
  ignoreNotBefore: a,
  maxAge: m,
  clockTimestamp: g,
  clockTolerance: w,
  errorCacheTTL: M
}, b) {
  if (!o)
    return b;
  const _ = [b, 0, 0];
  if (b instanceof B) {
    const $ = typeof M == "function" ? M(b) : M;
    return _[2] = (g || Date.now()) + w + $, o.set(He(t), _), b;
  }
  n && typeof n.iat == "number" && (_[1] = !a && typeof n.nbf == "number" ? n.nbf * 1e3 - w : 0, f || (typeof n.exp == "number" ? _[2] = n.exp * 1e3 + w : m && (_[2] = n.iat * 1e3 + m + w)));
  const k = (g || Date.now()) + w + r;
  return _[2] = _[2] === 0 ? k : Math.min(_[2], k), o.set(He(t), _), b;
}
function ho(o, t, r) {
  if (o instanceof B) {
    if (!t)
      throw o;
    t(o);
  } else {
    if (!t)
      return o;
    t(null, o);
  }
  return r;
}
function uo(o, t, r, n, f) {
  if (!f.includes(t.alg))
    throw new B(B.codes.invalidAlgorithm, "The token algorithm is invalid.");
  if (r && !ro(t.alg, n, o, r))
    throw new B(B.codes.invalidSignature, "The token signature is invalid.");
}
function lo(o, t, r, n) {
  const f = r ? `The ${t} claim must be a ${n} or an array of ${n}s.` : `The ${t} claim must be a ${n}.`;
  if (o.map((a) => typeof a).some((a) => a !== n))
    throw new B(B.codes.invalidClaimType, f);
}
function co(o, t, r, n) {
  const f = n ? `None of ${t} claim values are allowed.` : `The ${t} claim value is not allowed.`;
  if (!o.some((a) => r.some((m) => m.test(a))))
    throw new B(B.codes.invalidClaimValue, f);
}
function po(o, t, r, n, f, a) {
  const m = o * 1e3 + (t || 0);
  if (!(n ? r >= m : r <= m))
    throw new B(B.codes[f], `The token ${a} at ${new Date(m).toISOString()}.`);
}
function Cr(o, { input: t, header: r, payload: n, signature: f }, { validators: a, allowedAlgorithms: m, checkTyp: g, clockTimestamp: w, clockTolerance: M, requiredClaims: b }) {
  const _ = o instanceof Buffer ? o.length : !!o;
  if (_ && !f)
    throw new B(B.codes.missingSignature, "The token signature is missing.");
  if (!_ && f)
    throw new B(B.codes.missingKey, "The key option is missing.");
  if (uo(t, r, f, o, m), g && (typeof r.typ != "string" || g !== r.typ.toLowerCase().replace(/^application\//, "")))
    throw new B(B.codes.invalidType, "Invalid typ.");
  const I = w || Date.now();
  for (const k of a) {
    const { type: $, claim: F, allowed: G, array: Bt, modifier: C, greater: It, errorCode: P, errorVerb: R } = k, K = n[F], q = Array.isArray(K), Rt = q ? K : [K];
    if (!(F in n)) {
      if (b && b.includes(F))
        throw new B(B.codes.missingRequiredClaim, `The ${F} claim is required.`);
      continue;
    }
    lo(Rt, F, Bt, $ === "date" ? "number" : "string"), $ === "date" ? po(K, C, I, It, P, R) : co(Rt, F, G, q);
  }
}
function mo({
  key: o,
  allowedAlgorithms: t,
  complete: r,
  cacheTTL: n,
  checkTyp: f,
  clockTimestamp: a,
  clockTolerance: m,
  ignoreExpiration: g,
  ignoreNotBefore: w,
  maxAge: M,
  isAsync: b,
  validators: _,
  decode: I,
  cache: k,
  requiredClaims: $,
  errorCacheTTL: F
}, G, Bt) {
  const [C, It] = b ? oo(Bt) : [], P = {
    cache: k,
    token: G,
    cacheTTL: n,
    errorCacheTTL: F,
    payload: void 0,
    ignoreExpiration: g,
    ignoreNotBefore: w,
    maxAge: M,
    clockTimestamp: a,
    clockTolerance: m
  };
  if (k) {
    const [J, p, e] = k.get(He(G)) || [void 0, 0, 0], s = a || Date.now();
    if (
      /* istanbul ignore next */
      typeof J < "u" && (p === 0 || s < p && J.code === "FAST_JWT_INACTIVE" || s >= p && J.code !== "FAST_JWT_INACTIVE") && (e === 0 || s <= e)
    )
      return ho(J, C, It);
  }
  let R;
  try {
    R = I(G);
  } catch (J) {
    if (C)
      return C(J), It;
    throw J;
  }
  const { header: K, payload: q, signature: Rt } = R;
  P.payload = q;
  const O = { validators: _, allowedAlgorithms: t, checkTyp: f, clockTimestamp: a, clockTolerance: m, requiredClaims: $ };
  if (!C)
    try {
      return Cr(o, R, O), Gt(P, r ? { header: K, payload: q, signature: Rt } : q);
    } catch (J) {
      throw Gt(P, J);
    }
  return no(o, { header: K, payload: q, signature: Rt }, (J, p) => {
    if (J)
      return C(
        Gt(P, B.wrap(J, B.codes.keyFetchingError, "Cannot fetch key."))
      );
    if (typeof p == "string")
      p = Buffer.from(p, "utf-8");
    else if (!(p instanceof Buffer))
      return C(
        Gt(
          P,
          new B(
            B.codes.keyFetchingError,
            "The key returned from the callback must be a string or a buffer containing a secret or a public key."
          )
        )
      );
    try {
      const e = Ai(p);
      O.allowedAlgorithms.length ? Ti(t, e) : O.allowedAlgorithms = e, p = Bi(p, e[0] === Ei[0]), Cr(p, R, O);
    } catch (e) {
      return C(Gt(P, e));
    }
    C(null, Gt(P, r ? { header: K, payload: q, signature: Rt } : q));
  }), It;
}
var vo = function(t) {
  let {
    key: r,
    algorithms: n,
    complete: f,
    cache: a,
    cacheTTL: m,
    errorCacheTTL: g,
    checkTyp: w,
    clockTimestamp: M,
    clockTolerance: b,
    ignoreExpiration: _,
    ignoreNotBefore: I,
    maxAge: k,
    allowedJti: $,
    allowedAud: F,
    allowedIss: G,
    allowedSub: Bt,
    allowedNonce: C,
    requiredClaims: It
  } = { cacheTTL: 6e5, clockTolerance: 0, errorCacheTTL: -1, ...t };
  Array.isArray(n) || (n = []);
  const P = typeof r;
  if (P !== "string" && P !== "object" && P !== "function")
    throw new B(
      B.codes.INVALID_OPTION,
      "The key option must be a string, a buffer or a function returning the algorithm secret or public key."
    );
  if (r && P !== "function") {
    const O = Ai(r);
    n.length ? Ti(n, O) : n = O, r = Bi(r, O[0] === Ei[0]);
  }
  if (M && (typeof M != "number" || M < 0))
    throw new B(B.codes.invalidOption, "The clockTimestamp option must be a positive number.");
  if (b && (typeof b != "number" || b < 0))
    throw new B(B.codes.invalidOption, "The clockTolerance option must be a positive number.");
  if (m && (typeof m != "number" || m < 0))
    throw new B(B.codes.invalidOption, "The cacheTTL option must be a positive number.");
  if (g && typeof g != "function" && typeof g != "number" || g < -1)
    throw new B(
      B.codes.invalidOption,
      "The errorCacheTTL option must be a number greater than -1 or a function."
    );
  if (It && !Array.isArray(It))
    throw new B(B.codes.invalidOption, "The requiredClaims option must be an array.");
  const R = [];
  I || R.push({
    type: "date",
    claim: "nbf",
    errorCode: "inactive",
    errorVerb: "will be active",
    greater: !0,
    modifier: -b
  }), _ || R.push({
    type: "date",
    claim: "exp",
    errorCode: "expired",
    errorVerb: "has expired",
    modifier: +b
  }), typeof k == "number" && R.push({ type: "date", claim: "iat", errorCode: "expired", errorVerb: "has expired", modifier: k }), $ && R.push({ type: "string", claim: "jti", allowed: Wt($) }), F && R.push({ type: "string", claim: "aud", allowed: Wt(F), array: !0 }), G && R.push({ type: "string", claim: "iss", allowed: Wt(G) }), Bt && R.push({ type: "string", claim: "sub", allowed: Wt(Bt) }), C && R.push({ type: "string", claim: "nonce", allowed: Wt(C) });
  let K = null;
  w && (K = w.toLowerCase().replace(/^application\//, ""));
  const q = {
    key: r,
    allowedAlgorithms: n,
    complete: f,
    cacheTTL: m,
    errorCacheTTL: g,
    checkTyp: K,
    clockTimestamp: M,
    clockTolerance: b,
    ignoreExpiration: _,
    ignoreNotBefore: I,
    maxAge: k,
    isAsync: P === "function",
    validators: R,
    decode: io({ complete: !0 }),
    cache: fo(a),
    requiredClaims: It
  }, Rt = mo.bind(null, q);
  return Rt.cache = q.cache, Rt;
}, ur = {}, yo = /^(-?(?:\d+)?\.?\d+) *(m(?:illiseconds?|s(?:ecs?)?))?(s(?:ec(?:onds?|s)?)?)?(m(?:in(?:utes?|s)?)?)?(h(?:ours?|rs?)?)?(d(?:ays?)?)?(w(?:eeks?|ks?)?)?(y(?:ears?|rs?)?)?$/, de = 1e3, pe = de * 60, me = pe * 60, ee = me * 24, ze = ee * 365.25;
function go(o) {
  var t, r = o.toLowerCase().match(yo);
  if (r != null && (t = parseFloat(r[1])))
    return r[3] != null ? t * de : r[4] != null ? t * pe : r[5] != null ? t * me : r[6] != null ? t * ee : r[7] != null ? t * ee * 7 : r[8] != null ? t * ze : t;
}
function Xt(o, t, r, n) {
  var f = (o | 0) === o ? o : ~~(o + 0.5);
  return t + f + (n ? " " + r + (f != 1 ? "s" : "") : r[0]);
}
function wo(o, t) {
  var r = o < 0 ? "-" : "", n = o < 0 ? -o : o;
  return n < de ? o + (t ? " ms" : "ms") : n < pe ? Xt(n / de, r, "second", t) : n < me ? Xt(n / pe, r, "minute", t) : n < ee ? Xt(n / me, r, "hour", t) : n < ze ? Xt(n / ee, r, "day", t) : Xt(n / ze, r, "year", t);
}
ur.format = wo;
ur.parse = go;
const {
  base64UrlMatcher: Ke,
  base64UrlReplacer: Fe,
  useNewCrypto: Mo,
  hsAlgorithms: bo,
  esAlgorithms: _o,
  rsaAlgorithms: So,
  edAlgorithms: xo,
  detectPrivateKeyAlgorithm: Ii,
  createSignature: Or
} = Si, { TokenError: T } = ie, { getAsyncKey: Eo, ensurePromiseCallback: Ao } = xi, { createPrivateKey: To, createSecretKey: Bo } = re, { parse: Nr } = ur, Ri = /* @__PURE__ */ new Set([...bo, ..._o, ...So, ...xo, "none"]), Io = Array.from(Ri).join(", ");
function ki(o, t) {
  const r = o.slice(0, 2), n = t.slice(0, 2);
  let f = !0;
  if (r === "RS" || r === "PS" ? f = n === "RS" || r === "RS" && t === "ENCRYPTED" : (r === "ES" || r === "Ed") && (f = r === n || r === "ES" && t === "ENCRYPTED"), !f)
    throw new T(T.codes.invalidKey, `Invalid private key provided for algorithm ${o}.`);
}
function Pi(o, t) {
  return typeof o == "string" && (o = Buffer.from(o, "utf-8")), Mo && (o = t[0] === "H" ? Bo(o) : To(o)), o;
}
function Ro({
  key: o,
  algorithm: t,
  noTimestamp: r,
  mutatePayload: n,
  clockTimestamp: f,
  expiresIn: a,
  notBefore: m,
  kid: g,
  typ: w,
  isAsync: M,
  additionalHeader: b,
  fixedPayload: _
}, I, k) {
  const [$, F] = M ? Ao(k) : [];
  if (typeof I != "object")
    throw new T(T.codes.invalidType, "The payload must be an object.");
  if (I.exp && (!Number.isInteger(I.exp) || I.exp < 0))
    throw new T(T.codes.invalidClaimValue, "The exp claim must be a positive integer.");
  const G = {
    alg: t,
    typ: w || "JWT",
    kid: g,
    ...b
  };
  let Bt = "";
  const C = I.iat * 1e3 || f || Date.now(), It = {
    ...I,
    ..._,
    iat: r ? void 0 : Math.floor(C / 1e3),
    exp: I.exp ? I.exp : a ? Math.floor((C + a) / 1e3) : void 0,
    nbf: m ? Math.floor((C + m) / 1e3) : void 0
  };
  if (n && Object.assign(I, It), Bt = Buffer.from(JSON.stringify(It), "utf-8").toString("base64").replace(Ke, Fe), !$) {
    const R = Buffer.from(JSON.stringify(G), "utf-8").toString("base64").replace(Ke, Fe) + "." + Bt, K = t === "none" ? "" : Or(t, o, R);
    return R + "." + K;
  }
  return Eo(o, { header: G, payload: I }, (P, R) => {
    if (P) {
      const q = T.wrap(P, T.codes.keyFetchingError, "Cannot fetch key.");
      return $(q);
    }
    if (typeof R == "string")
      R = Buffer.from(R, "utf-8");
    else if (!(R instanceof Buffer))
      return $(
        new T(
          T.codes.keyFetchingError,
          "The key returned from the callback must be a string or a buffer containing a secret or a private key."
        )
      );
    let K;
    try {
      const q = Ii(R, t);
      t ? ki(t, q) : G.alg = t = q, R = Pi(R, t);
      const O = Buffer.from(JSON.stringify(G), "utf-8").toString("base64").replace(Ke, Fe) + "." + Bt;
      K = O + "." + Or(t, R, O);
    } catch (q) {
      return $(q);
    }
    $(null, K);
  }), F;
}
var ko = function(t) {
  let {
    key: r,
    algorithm: n,
    noTimestamp: f,
    mutatePayload: a,
    clockTimestamp: m,
    expiresIn: g,
    notBefore: w,
    jti: M,
    aud: b,
    iss: _,
    sub: I,
    nonce: k,
    kid: $,
    typ: F,
    header: G
  } = { clockTimestamp: 0, ...t };
  if (n && !Ri.has(n))
    throw new T(
      T.codes.invalidOption,
      `The algorithm option must be one of the following values: ${Io}.`
    );
  const Bt = typeof r, C = Bt === "object" && r && r.key && r.passphrase;
  if (n === "none") {
    if (r)
      throw new T(
        T.codes.invalidOption,
        'The key option must not be provided when the algorithm option is "none".'
      );
  } else {
    if (!r || Bt !== "string" && !(r instanceof Buffer) && Bt !== "function" && !C)
      throw new T(
        T.codes.invalidOption,
        "The key option must be a string, a buffer, an object containing key/passphrase properties or a function returning the algorithm secret or private key."
      );
    if (C && !n)
      throw new T(
        T.codes.invalidAlgorithm,
        "When using password protected key you must provide the algorithm option."
      );
  }
  if (r && Bt !== "function") {
    const K = Ii(C ? r.key : r, n);
    n ? ki(n, K) : n = K, r = Pi(r, n);
  }
  if (g && (typeof g == "string" && (g = Nr(g)), typeof g != "number" || g < 0))
    throw new T(T.codes.invalidOption, "The expiresIn option must be a positive number or a valid string.");
  if (w && (typeof w == "string" && (w = Nr(w)), typeof w != "number" || w < 0))
    throw new T(T.codes.invalidOption, "The notBefore option must be a positive number or a valid string.");
  if (m && (typeof m != "number" || m < 0))
    throw new T(T.codes.invalidOption, "The clockTimestamp option must be a positive number.");
  if (M && typeof M != "string")
    throw new T(T.codes.invalidOption, "The jti option must be a string.");
  if (b && typeof b != "string" && !Array.isArray(b))
    throw new T(T.codes.invalidOption, "The aud option must be a string or an array of strings.");
  if (_ && typeof _ != "string")
    throw new T(T.codes.invalidOption, "The iss option must be a string.");
  if (I && typeof I != "string")
    throw new T(T.codes.invalidOption, "The sub option must be a string.");
  if (k && typeof k != "string")
    throw new T(T.codes.invalidOption, "The nonce option must be a string.");
  if ($ && typeof $ != "string")
    throw new T(T.codes.invalidOption, "The kid option must be a string.");
  if (G && typeof G != "object")
    throw new T(T.codes.invalidOption, "The header option must be a object.");
  const P = Object.entries({ jti: M, aud: b, iss: _, sub: I, nonce: k }).reduce((K, [q, Rt]) => (Rt !== void 0 && (K[q] = Rt), K), {}), R = {
    key: r,
    algorithm: n,
    noTimestamp: f,
    mutatePayload: a,
    clockTimestamp: m,
    expiresIn: g,
    notBefore: w,
    kid: $,
    typ: F,
    isAsync: Bt === "function",
    additionalHeader: G,
    fixedPayload: P
  };
  return Ro.bind(null, R);
};
const { TokenError: Po, TOKEN_ERROR_CODES: Co } = ie, Oo = Lr, No = vo, Do = ko;
var Dr = {
  TokenError: Po,
  TOKEN_ERROR_CODES: Co,
  createDecoder: Oo,
  createVerifier: No,
  createSigner: Do
};
const Fo = () => ({
  users: {
    table_name: "users"
  }
}), qo = () => ({
  JWT_KEY: {}
}), Vo = () => [
  () => [
    {
      statement: `CREATE TABLE users (
						id UUID PRIMARY KEY,
						salt VARCHAR(255),
						hash VARCHAR(255),
						permissions JSONB,
						user_details JSONB,
						subdomain VARCHAR(75) NOT NULL UNIQUE DEFAULT 'root',
						created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					);`,
      data_key: "usersTable",
      values: []
    }
  ]
];
function Uo(o, t, r) {
  return qe.scryptSync(o, t, 32).toString("hex") === r;
}
const Go = {
  paths: {
    "/": {
      post: {
        summary: "Create a server user",
        operationId: "createUser",
        // routeMiddleware: async ({ res, next, runStatement }) => {
        // 	const data = await runStatement({
        // 		statement: `SELECT * FROM users`,
        // 		data_key: "users",
        // 		values: [],
        // 	});
        // 	const users = data.users.rows;
        // 	const isFirstUser = !users || !users.length;
        // 	if (isFirstUser) {
        // 		console.log("No users, no protection");
        // 	} else {
        // 		console.log("Users exist, let's protect.");
        // 		return res
        // 			.status(401)
        // 			.send({ message: "Authentication required." });
        // 	}
        // 	res.locals.isFirstUser = isFirstUser;
        // 	return next();
        // },
        execution: async ({ req: o, res: t }) => {
          const { password: r, subdomain: n } = o.body;
          if (r.length < 15)
            return t.status(400).send({
              message: "Password length too short."
            });
          const f = qe.randomBytes(16).toString("hex"), a = qe.scryptSync(r, f, 32).toString("hex");
          return [
            // Function to pass results from one sync operation to another
            // First will be empty of course
            () => [
              {
                statement: "INSERT INTO users (id, subdomain, hash, salt, permissions, user_details) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)",
                data_key: "newUser",
                values: [n, a, f, {}, {}]
              }
            ]
          ];
        },
        handleReturn: ({ memory: o }) => {
          const { newUser: t } = o;
          return t.rows[0] ? {
            status: 200,
            data: t?.rows[0]
          } : {
            status: 500,
            data: null
          };
        }
      },
      // We don't want to expose this externally kinda
      get: {
        summary: "Fetch all server users",
        operationId: "fetchUsers",
        execution: () => [
          // Function to pass results from one sync operation to another
          // First will be empty of course
          () => [
            {
              statement: "SELECT * FROM users",
              data_key: "allUsers",
              values: []
            }
          ]
        ]
      }
    },
    "/login": {
      post: {
        summary: "Login a user",
        operationId: "loginUser",
        privacy: "PUBLIC",
        execution: async ({ req: o, res: t, secrets: r }) => {
          const { salt: n, hash: f, id: a } = t.locals?._user;
          if (!Uo(
            o.body?.password,
            n,
            f
          ))
            return {
              status: 401,
              data: null,
              message: "Incorrect password."
            };
          const g = {
            // Subject identifier
            sub: a,
            user: { id: a },
            iat: Math.floor(Date.now() / 1e3),
            // Issued At
            exp: Math.floor(Date.now() / 1e3) + 60 * 60
            // Expires in 1 hour
          }, M = Dr.createSigner({
            key: t.locals._server.login_jwt_key
          })(g);
          return t.setHeader(
            "Set-Cookie",
            fe.serialize("XSRF-TOKEN", M, {
              httpOnly: !0,
              sameSite: "Lax",
              path: "/",
              secure: process.env.MODE !== "dev",
              maxAge: 60 * 60 * 24 * 7 * 52
              // 1 year
            })
          ), {
            status: 200,
            data: M
          };
        }
      }
    },
    "/authenticate": {
      get: {
        summary: "Verify the presence of an authentication cookie",
        operationId: "verifyAuthCookie",
        privacy: "PUBLIC",
        execution: async ({ req: o, res: t }) => {
          const r = t.locals._server.login_jwt_key, f = fe.parse(o.headers.cookie || "")["XSRF-TOKEN"];
          try {
            const m = Dr.createVerifier({ key: r, complete: !0 })(f);
            return m ? {
              status: 200,
              data: m
            } : {
              status: 401,
              data: null
            };
          } catch {
            return {
              status: 401,
              data: null
            };
          }
        }
      }
    }
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Unique identifier for the user"
          },
          password: {
            type: "string",
            minLength: 8,
            description: "User password (hashed or encrypted)"
          },
          is_owner: {
            type: "boolean",
            default: !1,
            description: "Indicates if the user is an owner"
          },
          permissions: {
            type: "object",
            description: "User permissions",
            properties: {
              read: {
                type: "boolean",
                default: !1,
                description: "Permission to read"
              },
              write: {
                type: "boolean",
                default: !1,
                description: "Permission to write"
              }
            }
          },
          user_details: {
            type: "object",
            description: "Details about the user",
            properties: {
              full_name: {
                type: "string",
                minLength: 1,
                description: "Full name of the user"
              },
              email: {
                type: "string",
                format: "email",
                description: "Email address of the user"
              }
            }
          },
          created_at: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the user was created"
          }
        },
        required: ["id", "password"]
      }
    }
  }
}, Jo = () => {
};
export {
  Go as endpoints,
  Vo as onInstall,
  Jo as postInstall,
  qo as secrets,
  Fo as tables
};
