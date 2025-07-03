var ux = new Object(null);
// --- создае кнопку
ux.btn = function(n,c){
	if(typeof this.btn[n] == "string"){
		if(typeof c != "string") c = "ux-btn-"+n;
		n = this.btn[n];
	}
	return ux.create("a",'ux-btn '+c,0,n);
};
ux.btn.set = function(name,value){
	ux.btn[name] = value;
};
ux.btn.get = function(name,def){
	if(typeof ux.btn[name] != "undefined") def = ux.btn[name];
	else if(typeof def != "string") def = "";
	return def;
};
ux.btn.arrow = '<svg viewBox="0 0 30 30"><line x1="6" y1="10.5" x2="15" y2="19.5"></line><line x1="24" y1="10.5" x2="15" y2="19.5"></line></svg>';
ux.btn.minus = '<svg viewBox="0 0 30 30"><line x1="9" y1="15" x2="21" y2="15"/></svg>';
ux.btn.plus = '<svg viewBox="0 0 30 30"><line x1="15" y1="9" x2="15" y2="21"/><line x1="9" y1="15" x2="21" y2="15"/></svg>';
ux.btn.add = '<svg viewBox="0 0 30 30"><line x1="15" y1="9" x2="15" y2="21"/><line x1="9" y1="15" x2="21" y2="15"/></svg>';
ux.btn.del = '<svg viewBox="0 0 30 30"><line x1="10.5" y1="10.5" x2="19.5" y2="19.5"></line><line x1="10.5" y1="19.5" x2="19.5" y2="10.5"></line></svg>';
ux.btn.close = '<svg viewBox="0 0 18 18" ><line x1="16.5" y1="16.5" x2="1.5" y2="1.5"/><line x1="16.5" y1="1.5" x2="1.5" y2="16.5"/></svg>';
// --- показывает содержимое
ux.view = function(e,s){
	let r,a,b,i,theme,content;
	r = new Array;
	
	if(typeof(e) == "string") e = document.querySelectorAll(e);
	else if(e instanceof Node) e = [e];
	else if(e instanceof NodeList) e = e;
	else if(typeof(e) == "object") s = e;
	
	s = ux.verify({
		"parent": null,
		"body": null,
		"arrow": false,
		"width": false,
		"height": false,
		"content": false,
		"backdrop": true,
		"theme": "",
		"position": "down",
		"open": "function",
		"close": "function",
	},s);
	
	// --- создания елемента
	if(typeof(e)=="undefined" || typeof(e.length)=="undefined") e = [ux.create("view")];
	
	if(typeof s.parent == "string") s.parent = document.querySelector(s.parent);
	
	for(i = 0; i < e.length; i++){
		b = e[i];
		theme = (b.hasAttribute("ux-theme") && !s.theme?b.getAttribute("ux-theme"):s.theme);
		content = b.localName != "view"?b:s.content;
		
		a = ux.create("div","ux-view"+(typeof s.theme == "string"?" "+s.theme:""));
		a.setting = {
			"arrow": s.arrow,
			"width": s.width,
			"height": s.height,
			"position": s.position,
			"open": s.open,
			"close": s.close,
			"backdrop": s.backdrop
		};
		a.arrow = s.arrow!=false?ux.create("div","ux-arrow"):false;
		a.body = s.body instanceof Node?s.body:document.body;
		a.parent = s.parent instanceof Node?s.parent:a.body;
		a.position = s.position;
		a.opened = false;
		a.content = function(d){
			this.innerHTML = "";
			ux.create(this,0,0,d);
			if(this.arrow instanceof Node){
				this.arrow.innerHTML = '<svg viewBox="0 0 20 10" ><polygon  points="0,10 20,10 10,0 "/><line x1="0" y1="10" x2="10" y2="0"/><line x1="20" y1="10" x2="10" y2="0"/></svg>';
				this.appendChild(this.arrow);
			}
		};
		a.resize = function(){
			// --- определяем позицию
			let x,y,ax,ay,w,h,pw,ph,ww,wh,t,l,p,a,bound,body,is,parent;
			parent = this.parent.getBoundingClientRect();
			body = this.body.getBoundingClientRect();
			// --- коректировка относительно body
			bound = {
				x: parent.left - body.left,
				y: parent.top - body.top,
				top: parent.top - body.top,
				left: parent.left - body.left,
				right: parent.left - body.left + parent.width,
				bottom: parent.top - body.top + parent.height
			};
			// ---
			t = this.body.scrollTop;
			l = this.body.scrollLeft;
			a = (this.arrow!=false?20:0);
			p = this.setting.position;
			x = bound.x;
			y = bound.y;
			w = this.offsetWidth;
			h = this.offsetHeight;
			ax = x;
			ay = y;
			pw = this.parent.offsetWidth;
			ph = this.parent.offsetHeight;
			ww = this.body.offsetWidth;
			wh = window.innerHeight;
			// --- коректировка относительно body
			if(this.body.offsetHeight < wh) wh = this.body.offsetHeight;
			// --- проверка в видемой области
			if(this.body == document.body){
				t = t || window.scrollY || document.documentElement.scrollTop;
				l = l || window.scrollX || document.documentElement.scrollLeft;
			}
			// ---
			is = {
				up: parent.top-(h+a)>0,
				left: parent.left-(w+a)>0,
				right: ww-(parent.right+w+a)>0,
				down: wh-(parent.bottom+h+a)>0
			};
			// ---
			if(p == "down" && !is.down) p = "up";
			else if(p == "up" && !is.up) p = "down";
			else if(p == "left" && !is.left) p = "right";
			else if(p == "right" && !is.right) p = "left";

			if(p == "down" || p == "up"){
				if(p == "down") y = bound.bottom+(a/2);
				else y = bound.top-(h+a/2);
				// --- центровка блока
				x = x - ((w/2)-(pw/2));
				// --- корекция по X
				if(x+w>ww) x = ww-w;
				else if(x < 0) x = 0;
				// --- смешения стрелочки
				if(this.arrow != false){
					ax = ax - x + pw/2-a/2;
					if(ax < 0) ax = 0;
					else if(ax>w-(a/2)) ax = w-(a/2);
					this.arrow.style.left = ax+"px";
				}
			}
			else if(p == "left" || p == "right"){
				if(p == "right") x = bound.right+(a/2);
				else x = bound.left-(w+a/2);
				// --- центровка блока
				y = bound.top - ((h/2)-(ph/2)) - t;
				// --- проверка по Y
				if(y+h>wh) y = wh-h;
				else if(y < 0) y = 0;
				// --- добавляем scrollTop
				y = y + t;
				// --- смешения стрелочки
				if(this.arrow != false){
					ay = ay - y + (ph/2-a/2);
					if(ay < 0) ay = 0;
					else if(ay>h-(a/2)) ay = h-(a/2);
					this.arrow.style.top = ay+"px";
				}
			}
			// --- блок
			this.setAttribute("position",p);
			//ux.sa(this,"position",p);

			this.style.left = x+"px";
			this.style.top = y+"px";
			this.position = p;
		};
		a.open = function(){
			let width,height;
			// --- фишка чтобы не удаляло только что созданые елемент
			this.setAttribute("continue","on");
			//ux.sa(this,"continue","on");
			setTimeout(function(a){a.removeAttribute("continue")},50,this);
			// --- задаем розмери
			if(this.setting.width === true) width = this.parent.offsetWidth+"px";
			else if(typeof this.setting.width == "number") width = this.setting.width+"px";
			else if(typeof this.setting.width == "string") width = this.setting.width;

			if(this.setting.height === true) height = this.parent.offsetHeight+"px";
			else if(typeof this.setting.height == "number") height = this.setting.height+"px";
			else if(typeof this.setting.height == "string") height = this.setting.height;
			
			if(typeof width != "undefined")  this.style.width = width;
			if(typeof height != "undefined")  this.style.height = height;
			// ---
			this.body.appendChild(this);
			this.opened = true;
			this.resize();
			// ---
			this.parent.setAttribute("position",this.position);
			//ux.sa(this.parent,"position",this.position);
			// ---
			this.setting.open.call(this);
			// ---
			if(this.setting.backdrop === true){
				this.backdrop.open();
			}
			
			return true;
		};
		a.close = function(){
			if(this.parentNode == null) return false;
			this.opened = false;
			// ---
			//ux.ra(this.parent,"position");
			this.parent.removeAttribute("position");
			// ---
			this.setting.close.call(this);
			this.parentNode.removeChild(this);
			
			// ---
			if(this.setting.backdrop === true){
				this.backdrop.close();
			}
			return true;
		};
		// ---
		a.content(content);
		
		
		// --- backdrop
		a.backdrop = ux.backdrop({
			"connected": a,
			"click": function(){
				this.connected.close();
			},
			"open": function(){
				a.parentNode.insertBefore(this,a);
			}
		});
		a.backdrop.classList.add("transparent");
		// ---
		r.push(a);	
	}
	
	return r.length == 1 ? r[0] : r;
};
// --- подложка
ux.backdrop = function(s){
	let a = ux.create("div","ux-backdrop ux-anim");
	
	s = ux.verify({
		"open": "function",
		"close": "function",
		"click": "function",
		"connected": false,
		"time": 300,
	},s);
	
	a.time = s.time;
	a.onopen = s.open;
	a.onclose = s.close;
	a.callback = s.click;
	a.connected = s.connected;
	a.onclick = function(e){
		if(e.target == this) this.callback(e);
	}
	a.open = function(){
		document.body.appendChild(this);
		setTimeout(function(e){e.classList.add("open")},30,this);
		this.onopen();
	};
	a.close = function(){
		this.classList.remove("open");
		this.classList.add("close");
		setTimeout(function(e){
			if(e.parentNode instanceof Node) e.parentNode.removeChild(e);
			e.classList.remove("close");
		},this.time,this);
		this.onclose();
	};
	return a;
};
// --- create
ux.create = function(e,c,a,d,o,f){
	if(typeof e != "string" && e instanceof Node == false) return false;
	
	var i,k;

	if(typeof e == "string") e = document.createElement(e);
	
	if(typeof c == "string") e.className = c;

	if(typeof a == "object"){
		k = Object.keys(a);
		for(i=0;i<k.length;i++) e.setAttribute(k[i],a[k[i]]); 
	} 

	if(typeof d != "undefined" && d != null){
		if(typeof d == "function") d = d();
		if(["string","number"].indexOf(typeof d) != -1){
			if(e.nodeName == "INPUT") e.value = d;
			else e.innerHTML = d;
		}
		else if(d instanceof Node){
			e.appendChild(d);
		}
		else if(typeof d == "object"){
			k = Object.keys(d);
			for(i=0;i<k.length;i++){
				if(typeof d[k[i]] == "function") d[k[i]] = d[k[i]]();
				if(["string","number"].indexOf(typeof d[k[i]]) != -1) e.innerHTML += d[k[i]];
				else if(d[k[i]] instanceof Node) e.appendChild(d[k[i]]);
			}
		}
	}

	if(typeof o == "function") e.onclick = o;
	
	if(typeof o == "object"){
		k = Object.keys(o);
		for(i=0;i<k.length;i++){
			e[k[i]] = o[k[i]];
		}
	} 

	if(typeof(f) == "function") f(e);
	
	return e;
}
// --- верификация
ux.verify = function(a,b){
	let r,k;
	r = new Object(null);
	if(b instanceof Object == false) b = new Object();
	for(k in a){
		if(typeof(b[k]) == "undefined" && ["Array","Object","function","boolean"].indexOf(a[k]) == -1){
			r[k] = a[k];
		}
		else if(a[k] instanceof Object && b[k] instanceof Object && a[k] instanceof Node == false){
			r[k] = this.verify(a[k],b[k]);
		}
		else if(a[k] instanceof Array && b[k] instanceof Array && a[k] instanceof Node == false){
			r[k] = this.verify(a[k],b[k]);
		}
		else if(typeof a[k] == "string" && a[k] == "Object"){
			if(b[k] instanceof Object) r[k] = b[k];
			else r[k] = [];
		}
		else if(typeof a[k] == "string" && a[k] == "Array"){
			if(b[k] instanceof Array) r[k] = b[k];
			else r[k] = [];
		} 
		else if(typeof a[k] == "string" && a[k] == "function"){
			if(typeof b[k] == "function") r[k] = b[k];
			else r[k] = function(){};
		}
		else if(typeof a[k] == "string" && a[k] == "boolean"){
			if(typeof b[k] == "boolean") r[k] = b[k];
			else r[k] = false;
		} 
		else{
			r[k] = b[k];
		}
	}
	return r;
};
// --- функции
ux.inArray = function(v, a){
	console.log("in_array");
	if(a instanceof Array == false && typeof(a) == "object") a = Object.keys(a);
    for(let i=0; i<a.length; i++){
        if(v == a[i]) return true;
    }
    return false;
};
ux.isNumeric = function(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
};
ux.isString = function(n) {
	return typeof(n) == "string";
};
ux.typeString = function(n) {
	return ux.isString(n) ? n : "";
};
ux.round = function(v, d) {
    return Number(Math.round(v+'e'+d)+'e-'+d);
};
ux.angle = function(x,y){
	let v;
	v = (Math.atan2(y,x) * 180 / Math.PI) + 90;
	return v < 0 ? v + 360: v
};
ux.size = function(v){
	let r,a;
    r = 0;
    v = parseFloat(v);
    a = [{"UNIT":"TB","VALUE":Math.pow(1024,4)},{"UNIT":"GB","VALUE":Math.pow(1024,3)},{"UNIT":"MB","VALUE":Math.pow(1024,2)},{"UNIT":"KB","VALUE":1024},{"UNIT":"B","VALUE":1}];
	
	for(k in a){
        if(v >= a[k]["VALUE"]){
            r = ux.round(v/a[k]["VALUE"],2)+"";
            r = r.replace(".",",")+" "+a[k]["UNIT"];
            break;
        }
    }
    return r;
};
// --- собития
ux.eventlistener = {
	focus: null,
	list: {
		"start": {},
		"move": {},
		"end": {},
		"click": {},
		"inserted": {},
	},
	add: function(n,h,k){
		if(typeof(this.list[n])=="undefined" || typeof(h)!="function") return false;
		if(typeof(k)=="undefined") k = "#"+Object.keys(this.list[n]).length;
		this.list[n][k] = h;
		return k;
	},
	correct: function(e,a) {
		if(a === true) return (e.type.search('touch') !== -1) ? e.changedTouches : e;
		else return (e.type.search('touch') !== -1) ? e.changedTouches[0] : e;
	},
	remove: function(n,k){
		try{delete(this.list[n][k])}catch(e){}
	},
	clear: function(n){
		if(typeof(this.list[n])!="undefined") delete(this.list[n]);
	},
	execute: function(n,e,k){
		if(typeof(this.list[n])=="undefined") return false;
		if(typeof(k)!="undefined") this.list[n][k](e);
		else for(let i in this.list[n]) this.list[n][i].call(this,e,this);
		return true;
	},
};
window.addEventListener('mousedown', function(e){ux.eventlistener.execute("start",e)});
window.addEventListener('mousemove', function(e){ux.eventlistener.execute("move",e)});
window.addEventListener('mouseup', function(e){ux.eventlistener.execute("end",e);ux.eventlistener.focus=null});
window.addEventListener('touchstart', function(e){ux.eventlistener.execute("start",e)});
window.addEventListener('touchmove', function(e){ux.eventlistener.execute("move",e)});
window.addEventListener('touchend', function(e){ux.eventlistener.execute("end",e);ux.eventlistener.focus=null});
window.addEventListener('click', function(e){ux.eventlistener.execute("click",e)});
window.addEventListener('DOMNodeInserted', function(e){ux.eventlistener.execute("inserted",e)});
// ---
ux.eventlistener.add("click",function(e){
	let a = (e.target.classList.contains('ux-view')?e.target:e.target.closest('.ux-view'));
	// --- пошук дочерніх ux
	if(a != null && a.parentNode != null && a.parentNode.closest('.ux-view') != null){
		return true;
	}

	[].forEach.call(document.querySelectorAll(".ux-view:not([continue])"),function(b){
		if(b!=a) b.close();
	});
},'ux-view');