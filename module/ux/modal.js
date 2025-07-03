ux.modal = function(e,s){
	let r,a,b,i,content,theme;

	r = new Array;
	
	if(typeof(e) == "string") e = document.querySelectorAll(e);
	else if(e instanceof Node) e = [e];
	else if(e instanceof NodeList) e = e;
	else if(typeof(e) == "object") s = e;

	s = ux.verify({
		"theme": false,
		"open": "function",
		"close": "function",
		"content": false,
		"header": false,
		"footer": false,
		"center": true,
	},s);
	
	// --- создания елемента
	if(typeof(e)=="undefined" || typeof(e.length)=="undefined") e = [ux.create("modal")];

	for(i = 0; i < e.length; i++){
		b = e[i];
		theme = (b.hasAttribute("ux-theme") && !s.theme?b.getAttribute("ux-theme"):s.theme);
		content = b.localName != "modal"?b:s.content;
		// ---
		a = ux.create("div","ux-modal ux-anim "+ux.typeString(theme));
		a.setting = {
			"theme": theme,
			"center": s.center,
			"open": s.open,
			"close": s.close,
			"header": a,
			"footer": a,
			"content": a,
		};
		// --- backdrop
		a.backdrop = ux.backdrop({
			"connected": a,
			"click": function(){
				this.connected.close();
			}
		});
		// --- кнопка
		a.btn = ux.btn("close","ux-modal-close");
		a.btn.ux = a;
		a.btn.onclick = function(){
			this.ux.close();
		}
		// ---
		a.content = function(d){
			ux.create(this.setting.content,0,0,d);
		};
		a.clear = function(){
			this.setting.content.innerHTML = "";
			this.setting.header.appendChild(this.btn);
		};
		a.open = function(){
			let html,width;
			html = window.document.documentElement;
			width = window.innerWidth - document.body.offsetWidth;
			this.setting.header.appendChild(this.btn);
			this.backdrop.open();
			document.body.appendChild(this);
			this.resize();
			// --- выполняем зарегестрировану функцию
			this.setting.open.call(this);
			// --- блокируем скролл
			html.style.paddingRight = width+"px";
			html.style.overflow = "hidden";
			// ---
			setTimeout(function(e){
				e.classList.add("open")
			},30,this);
		};
		a.close = function(){
			if(this.parentNode instanceof Node == false) return false;
			let html = window.document.documentElement;
			this.backdrop.close();
			this.classList.remove("open");
			this.classList.add("close");
			// --- выполняем зарегестрировану функцию
			this.setting.close.call(this);
			// --- розблокируем скролл
			html.style.overflow = "";
			html.style.paddingRight = "";
			// ---
			setTimeout(function(e){
				if(e.parentNode instanceof Node) e.parentNode.removeChild(e);
				e.classList.remove("close");
			},400,this);
		};
		a.resize = function(){
			if(this.setting.center){
				this.style.left = (window.innerWidth - this.offsetWidth) / 2 + "px";
				this.style.top = (window.innerHeight - this.offsetHeight) / 2 + "px";
			}
			if(this.offsetHeight > window.innerHeight){
				if(this.setting.center) this.style.top = "0";
				this.backdrop.appendChild(this);
			}else if(this.parentNode == this.backdrop){
				this.backdrop.parentNode.appendChild(this);
			}
		};
		// ---
		if(s.header !== false){
			b = ux.create("div","ux-modal-header");
			a.appendChild(b);
			ux.create(b,0,0,s.header);
			a.setting.header = b;
			a.setAttribute("header","on");
		}
		if(s.header !== false || s.footer !== false){
			b = ux.create("div","ux-modal-content");
			a.appendChild(b);
			a.setting.content = b;
			a.setAttribute("content","on");
		}
		if(s.footer !== false){
			b = ux.create("div","ux-modal-footer");
			a.appendChild(b);
			ux.create(b,0,0,s.footer);
			a.setting.footer = b;
			a.setAttribute("footer","on");
		}
		// ---
		a.content(content);

		r.push(a);
	}

	return r.length == 1 ? r[0] : r;
};