var prefs = new _IG_Prefs, spt = document.createElement("script");
spt.src = "http://www.google.com/translate_a/l?client=ig&hl="
		+ prefs.getMsg("default_hl") + "&cb=updateLanguage";
document.getElementsByTagName("head")[0].appendChild(spt);
var source_languages = [], target_languages = [], SOURCE_SELECT = _gel("_source"), TARGET_SELECT = _gel("_target"), langmsg = {};
function bringQueryFromOneBox(e, f) {
	if (f = f.getString("default_text")) {
		e = _gel("dictQuery" + e);
		e.value = f;
		e.style.color = "#000"
	}
}
function swap(e, f) {
	var j = e.value;
	if (j != "auto")
		if (j != f.value) {
			e.value = f.value.substring(0, 2) == "zh" ? "zh-CN" : f.value;
			if (j == "zh-CN") {
				f.value = "zh-CN";
				if (prefs.getMsg("default_hl") == "zh-TW")
					f.value = "zh-TW"
			} else
				f.value = j;
			prefs.set("sl", e.value);
			prefs.set("tl", f.value)
		}
}
window.updateLanguage = function(e) {
	var f = [], j = [], m = _gel("_source1"), o = _gel("_target1"), q = prefs
			.getString("sl"), r = prefs.getString("tl"), l = 0;
	for ( var k in e.sl) {
		source_languages.push( [ k, e.sl[k] ]);
		langmsg[k] = e.sl[k];
		f.push(new Option(langmsg[k], k, prefs.getMsg("default_source") == k));
		if (m) {
			m.options[l] = new Option(source_languages[l][1],
					source_languages[l][0]);
			if (source_languages[l][0] == q)
				m.selectedIndex = l
		}
		++l
	}
	l = 0;
	for (k in e.tl) {
		target_languages.push( [ k, e.tl[k] ]);
		langmsg[k] = e.tl[k];
		j.push(new Option(langmsg[k], k, prefs.getMsg("default_hl") == k));
		if (o) {
			o.options[l] = new Option(target_languages[l][1],
					target_languages[l][0]);
			if (target_languages[l][0] == r)
				o.selectedIndex = l
		}
		++l
	}
	setSelect("_source", "sl", f);
	setSelect("_target", "tl", j);
	if (q != "")
		SOURCE_SELECT.value = prefs.getString("sl");
	if (r != "")
		TARGET_SELECT.value = prefs.getString("tl")
};
function setSelect(e, f, j) {
	e = _gel(e);
	for (f = 0; f < j.length; f++)
		window.ActiveXObject ? e.add(j[f]) : e.appendChild(j[f])
}
function createTranslateURL(e, f, j) {
	var m = [], o = document.charset || document.characterSet;
	m.push("http://www.google.com/translate_a/t?", "ie=" + o
			+ "&oe=UTF8&client=ig&text=", _esc(e), "&sl=" + f + "&tl=" + j,
			"&hl=" + prefs.getMsg("default_hl"));
	return m.join("")
}
function createWebUrl(e, f, j) {
	var m = [], o = document.charset || document.characterSet;
	m.push("http://translate.google.com/translate?ie=" + o + "&oe=UTF&u=",
			_esc(e) + "&sl=", f + "&tl=" + j, "&hl="
					+ prefs.getMsg("default_hl"));
	
	return m.join("")
}
(function() {
	var e = "com", f = {
		en : "0",
		fr : "4",
		de : "5",
		it : "7",
		ko : "9",
		es : "14",
		"zh-TW" : "69",
		"zh-CN" : "16",
		zh : "16",
		ru : "13"
	}, j = {
		"1" : prefs.getMsg("noun"),
		"2" : prefs.getMsg("verb"),
		"3" : prefs.getMsg("adj"),
		"4" : prefs.getMsg("adv"),
		"5" : prefs.getMsg("prep"),
		"6" : prefs.getMsg("abbr"),
		"7" : prefs.getMsg("conj"),
		"8" : prefs.getMsg("pron"),
		"9" : prefs.getMsg("intr"),
		"10" : prefs.getMsg("phrase"),
		"11" : prefs.getMsg("prefix"),
		"12" : prefs.getMsg("suffix"),
		"13" : prefs.getMsg("article"),
		"14" : prefs.getMsg("combining")
	}, m = /\{([^\}]+)\}/g, o = new RegExp(
			"^[\\s\\u0020-\\u0040\\u005B-\\u0060\\u007B-\\u007E\\u1100-\\u11FF\\u3040-\\u30FF\\u3130-\\u318F\\u31F0-\\u31FF\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uAC00-\\uD7A3\\uF900-\\uFAFF\\uFF65-\\uFFDC]+$"), q = new RegExp(
			"^[\\s\\u0020-\\u007E]+$"), r = {
		ko : 1,
		ja : 1,
		"zh-TW" : 1,
		"zh-CN" : 1,
		zh : 1
	};
	function l(a) {
		return o.test(a)
	}
	function k(a) {
		return q.test(a)
	}
	function t(a) {
		return r[a]
	}
	function u(a) {
		return a == "en"
	}
	function y(a) {
		if (a.value == a.defaultValue)
			a.value = "";
		a.className = a.className.replace("TS", "")
	}
	function z(a, b) {
		prefs.set(a, b.value)
	}
	function A() {
		swap(SOURCE_SELECT, TARGET_SELECT)
	}
	function B() {
		if (prefs.getMsg("default_source") == "en"
				&& prefs.getMsg("default_hl") == "zh-TW")
			_gel("_inputText").innerHTML = '<textarea id="dictQuery" type="text" style="width: 99%;" class="input1TS" name="word" rows="3" onFocus="_startInput(this)" onkeydown="_detectEnter(event)">'
					+ _hesc(prefs.getMsg("input_hint")) + "</textarea>";
		_gel("dict_hpl").href = "http://www.google." + e + "/dictionary?hl="
				+ prefs.getMsg("default_hl")
	}
	function C() {
		var a = _args().parent, b = a.match(/google\.([a-z\.]+)/i);
		if (b)
			e = b[1];
		else if (a.indexOf(".cn/"))
			e = "cn";
		B();
		window._toggleDisplay = D;
		window._change = z;
		window._swap = A;
		window._startInput = y;
		window._detectEnter = E;
		window._showAvailable = F;
		document._dictionary.onsubmit = v;
		bringQueryFromOneBox("", prefs);
		_IG_AdjustIFrameHeight()
	}
	function E(a) {
		var b;
		if (window.event)
			b = a.keyCode;
		else if (a.which)
			b = a.which;
		b == 13 && v()
	}
	function G(a) {
		var b = /^(https?:\/\/)?([\w-]+\.)+[\w-]+$/;
		if (b.test(a))
			return true;
		return false
	}
	function s(a, b, c) {
		b = b + _esc("|") + c;
		c = [];
		c.push("http://www.google.com/dictionary/feeds?",
				"client=ig&restrict=pr,al&langpair=", b + "&q=" + _esc(a),
				"&hl=" + prefs.getMsg("default_hl"));
		
		//alert(c.join(""));
		return c.join("")
	}
	function H(a) {
		if (window.ActiveXObject) {
			var b = new ActiveXObject("Microsoft.XMLDOM");
			b.async = "false";
			b.loadXML(a)
		} else {
			b = new DOMParser;
			b = b.parseFromString(a, "text/xml")
		}
		return b
	}
	var g = {
		hasRichContent : false,
		termsCount : 0,
		termsGroup : {},
		available : [],
		nodeHandlers : {
			text : I,
			Example : J,
			PronunciationGroup : K
		},
		addTerm : L,
		getContent : M,
		parse : N,
		showIPA : O
	};
	function I(a, b) {
		b = b.firstChild.nodeValue;
		b = b.replace(m, "&nbsp;<font color=gray>$1</font>&nbsp;");
		a.text += b
	}
	function J(a, b) {
		b = b.childNodes;
		for ( var c = {}, d = 0; d < b.length; d++) {
			var h = b.item(d);
			if (h.nodeName == "text" && h.firstChild != null) {
				c.text = b.item(d).firstChild.nodeValue;
				c.translate = []
			} else if (b.item(d).nodeName == "Translated") {
				h = h.childNodes;
				for ( var i = 0; i < h.length; i++) {
					var n = h.item(i);
					n.nodeName == "text" && n.firstChild != null
							&& c.translate.push(n.firstChild.nodeValue)
				}
				a.examples.push(c)
			}
		}
		if (a.examples.length > 0)
			g.hasRichContent = true
	}
	function K(a, b) {
		var c = {
			"1" : prefs.getMsg("phonetic_us"),
			"2" : prefs.getMsg("phonetic_uk"),
			"3" : prefs.getMsg("phonetic_zhuyin"),
			"4" : prefs.getMsg("phonetic_pinyin")
		}, d = {};
		d.type = c[b.getAttribute("type")];
		d.text = "";
		for (c = 0; c < b.childNodes.length; c++)
			if (b.childNodes.item(c).nodeName == "text") {
				d.text = b.childNodes.item(c).firstChild.nodeValue;
				break
			}
		a.ipa.push(d)
	}
	function L(a) {
		var b = {
			examples : [],
			ipa : [],
			pos : "",
			text : ""
		}, c = a.getAttribute("part_of_speech");
		b.pos = c != null & typeof [ j[c] ] != "undefined" ? j[c] : "";
		a = a.childNodes;
		for (c = 0; c < a.length; c++) {
			var d = a.item(c), h = g.nodeHandlers[d.nodeName];
			typeof h != "undefined" && h(b, d)
		}
		a = g.termsGroup[b.pos];
		if (typeof a != "undefined")
			a.push(b);
		else
			g.termsGroup[b.pos] = [ b ];
		g.termsCount++
	}
	function M() {
		var a = "";
		for ( var b in g.termsGroup) {
			if (g.termsGroup[b].length == 1)
				if (g.termsGroup[b][0].ipa.length != 0)
					continue;
			var c = 1;
			if (g.hasRichContent)
				a += '<div class="explanation hide"><div class="meta"><a href="javascript: void(0)" class="toggle" onclick="_toggleDisplay(this)" title='
						+ _hesc(prefs.getMsg("show_hide_examples"))
						+ ">&nbsp;</a>";
			if (b != "")
				a += '<span class="word_type">' + b + ":</span>";
			if (g.hasRichContent)
				a += "</div>";
			a += '<ol class="meanings">';
			for ( var d = g.termsGroup[b], h = 0; h < d.length; h++) {
				var i = d[h];
				a += '<li><span class="number">' + c
						+ '.</span><span class="definition">' + i.text
						+ "</span>";
				if (g.hasRichContent)
					for ( var n = 0; n < i.examples.length; n++) {
						var p = i.examples[n].text + "&nbsp;"
								+ i.examples[n].translate.join("&nbsp;");
						a += '&nbsp;<span class="example">' + p + "</span>"
					}
				else
					a += "<br>";
				a += "</li>";
				c++
			}
			a += "</ol>";
			if (g.hasRichContent)
				a += "</div>"
		}
		return a
	}
	function N(a) {
		g.hasRichContent = false;
		g.termsCount = 0;
		g.termsGroup = {};
		g.available = [];
		a = a.getElementsByTagName("primary");
		var b = SOURCE_SELECT.value, c = TARGET_SELECT.value;
		b = [ b, c ];
		if (!(b.length < 2 || typeof f[b[0]] == "undefined" || typeof f[b[1]] == "undefined")) {
			b = f[b[1]];
			for (c = 0; c < a.length; c++)
				for ( var d = a[c].childNodes, h = 0; h < d.length; h++) {
					var i = d.item(h);
					if (i.nodeName == "term"
							&& (i.getAttribute("language") == b || i
									.getElementsByTagName("PronunciationGroup").length != 0))
						g.addTerm(i)
				}
		}
	}
	function O() {
		for ( var a in g.termsGroup) {
			var b = g.termsGroup[a];
			for ( var c in b) {
				var d = b[c];
				if (d.ipa && d.ipa.length > 0) {
					a = [];
					a.push('<div id="phonetic_symbol">');
					for (b = 0; b < d.ipa.length; b++) {
						a.push(d.ipa[b].type, ": [", d.ipa[b].text, "]");
						b != d.ipa.length - 1 && a.push("&nbsp;")
					}
					a.push("</div>");
					return a.join("")
				}
			}
		}
		return ""
	}
	function F(a) {
		var b = {
			German : "de",
			French : "fr",
			Italian : "it",
			Korean : "ko",
			Spanish : "es"
		}, c = SOURCE_SELECT.value;
		if (b[a] != null) {
			document._dictionary._target.value = b[a];
			document._dictionary.onsubmit()
		}
	}
	function D(a) {
		a = a.parentNode.parentNode;
		a.className = a.className != "explanation hide" ? "explanation hide"
				: "explanation show";
		_IG_AdjustIFrameHeight();
		return true
	}
	function w(a, b) {
		a = H(a);
		var c = false;
		if (a.getElementsByTagName("term").length > 0) {
			g.parse(a);
			if (g.termsCount > 0) {
				//alert(g.getContent());
				_gel("dict_links").style.display = "none";
				_gel("dict_content").innerHTML = g.showIPA();
				_gel("dict_content").innerHTML += g.getContent()
						+ '<div class="more_link"><a href="'
						+ b.replace("/feeds", "").replace(".com", "." + e)
								.replace("client=ig&restrict=pr,al&", "")
						+ '"target="_blank">'
						+ _hesc(prefs.getMsg("more_text")) + "</a></div>";
				_gel("dict_content").scrollTop = 0;
				if (g.available != "")
					_gel("dict_content").innerHTML += g.available;
				c = true
			}
		}
		document._dictionary.word.focus();
		return c
	}
	function x(a) {
		_IG_FetchContent(a, function(b) {
			var c, d;
			try {
				d = eval("(" + b + ")")
			} catch (h) {
			}
			if (d)
				if (typeof d == "object")
					if (d.length == 1)
						c = _hesc(prefs.getMsg("no_definition"));
					else {
						if (d.length >= 2)
							c = langmsg[d[1]] ? "<i style=color:grey>"
									+ _hesc(langmsg[d[1]]) + " - "
									+ _hesc(langmsg[TARGET_SELECT.value])
									+ "</i><br>" + _hesc(d[0]) : _hesc(d[0])
					}
				else
					c = _hesc(d);
			if (c == document._dictionary.word.value)
				c = _hesc(prefs.getMsg("no_definition"));
			_gel("dict_content").innerHTML = c;
			_IG_AdjustIFrameHeight()
		})
	}
	function v() {
		var a = document._dictionary.word.value, b = SOURCE_SELECT.value, c = TARGET_SELECT.value;
		if (G(a)) {
			b = source_languages[SOURCE_SELECT.selectedIndex][0];
			c = target_languages[TARGET_SELECT.selectedIndex][0];
			a = createWebUrl(a, b, c);
			window.open(a, "GoogleTranslateGadgetPopup");
			return false
		}
		if (a.length > 300) {
			_gel("dict_content").innerHTML = "<font color=red>"
					+ _hesc(prefs.getMsg("input_too_long"))
					+ "</font>&nbsp;<a href="
					+ _hesc(prefs.getMsg("title_url")) + ' target="_blank">'
					+ _hesc(prefs.getMsg("google_translation")) + "</a>";
			_IG_AdjustIFrameHeight();
			return false
		}
		if (t(b) && u(c) && k(a) || u(b) && t(c) && l(a)) {
			swap(SOURCE_SELECT, TARGET_SELECT);
			b = SOURCE_SELECT.value;
			c = TARGET_SELECT.value
		}
		b = [ b, c ];
		var d = createTranslateURL(a, b[0], b[1]), h, i;
		if (b[0] == "zh") {
			c = "zh-CN";
			var n = "zh-TW";
			if (prefs.getMsg("default_hl") == "zh-TW") {
				c = "zh-TW";
				n = "zh-CN"
			}
			h = s(a, c, b[1]);
			i = s(a, n, b[1])
		} else {
			h = s(a, b[0], b[1]);
			i = ""
		}
		var p = false;
		_IG_FetchContent(h, function(P) {
			alert(P);
			p = w(P, h);
			if (!p && i != "")
				_IG_FetchContent(i, function(Q) {
					if (!w(Q, i)) {
						_gel("dict_links").style.display = "none";
						x(d)
					}
					_IG_AdjustIFrameHeight()
				});
			else if (!p) {
				_gel("dict_links").style.display = "none";
				x(d)
			}
			_IG_AdjustIFrameHeight()
		});
		a.value = "";
		return false
	}
	_IG_RegisterOnloadHandler(C)
})();