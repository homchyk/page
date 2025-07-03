var alert = function(icon,title,desc,yes,no,time){
	let o,a;
	o = alert.inline(icon,title,desc,yes,no,time);
	if(o.type == "push") return alert.push(o);
	a = alert.node(o);
	// --- backdrop
	a.backdrop = alert.create("backdrop");
	a.backdrop.connected = a;
	a.backdrop.onclick = function(){this.connected.close()};
	a.backdrop.appendChild(a);
	// --- event
	a.close = function(){
		if(!alert.is(this.backdrop.parentNode,0,true)) return false;
		this.backdrop.classList.remove("open");
		this.backdrop.classList.add("close");
		setTimeout(function(e){
			e.classList.remove("close");
			if(e.parentNode != null) document.body.removeChild(e)
		},400,this.backdrop);
	};
	a.open = function(){
		document.body.appendChild(this.backdrop);
		// --- центрирования по вертикале
		if(this.option.center) this.style.top = (window.innerHeight - this.offsetHeight) / 2 + "px";
		// --- запуск анимации открытия
		setTimeout(function(e){e.classList.add("open")},30,this.backdrop);
		// --- запускаем отсчет для закрытия
		if(this.btn.children.length == 0) setTimeout(function(e){e.close()},this.option.time,this);
		// --- указываем атрибутом что нужно анимировать
		setTimeout(function(e){e.setAttribute("animated","on")},100,this);
	};
	a.open();
};
alert.push = function(icon,title,desc,yes,no,time){
	let a,o;
	o = alert.inline(icon,title,desc,yes,no,time);
	o.type = "push";
	a = alert.node(o);
	// --- event
	a.close = function(){
		if(this.parentNode instanceof Node == false) return false;
		this.classList.remove("open");
		this.classList.add("close");
		setTimeout(function(e){
			e.classList.remove("close");
			let c = document.querySelector('.alert-push-content[pos="'+e.option.pos+'"]');
			if(c instanceof Node){
				e.parentNode.removeChild(e);
				if(c.children.length == 0) c.parentNode.removeChild(c);
			};
		},400,this);
	};
	a.open = function(){
		// --- проверяем сушествования контейнера
		let c = document.querySelector('.alert-push-content[pos="'+this.option.pos+'"]');
		if(c instanceof Node == false){
			c = alert.create("div","alert-push-content");
			c.setAttribute("pos",this.option.pos);
			document.body.appendChild(c);
		}
		c.appendChild(this);
		// --- запуск анимации открытия
		setTimeout(function(e){e.classList.add("open")},30,this);
		// --- запускаем отсчет для закрытия
		if(this.btn.children.length == 0) setTimeout(function(e){e.close()},this.option.time,this);
		// --- указываем атрибутом что нужно анимировать
		setTimeout(function(e){e.setAttribute("animated","on")},100,this);
	};
	a.open();
};
alert.option = {
	pos: 'TR',
	title: null,
	desc: null,
	type: "modal",
	icon: null,
	time: 5000,
	center: true
};
alert.node = function(o){
	let a,g,c,b,is,create;
	is = alert.is;
	create = alert.create;
	c = o.type == "push";
	g = create("div",);
	a = create("alert");
	a.option = {time:o.time,pos:o.pos,center:o.center};
	a.icon = 0;
	a.head = 0;
	a.body = 0;
	// --- icon
	if(is(o.icon,"string")){
		if(is(alert.icon[o.icon])) o.icon = "caution";
		a.icon = create("div","alert-icon alert-icon-"+o.icon,alert.icon[o.icon]);
	}
	// --- title
	if(is(o.title,"string")) a.head =  create("div","alert-head",o.title);
	// --- desc
	if(is(o.desc,"string")) a.body = create("div","alert-body",o.desc);
	// --- btn
	a.btn = create("div","alert-button");
	if(is(o.yes,"function")){
		a.yes = o.yes;
		b = create("button","alert-yes",alert.lang["yes"]);
		b.onclick = function(){
			let a =  this.parentNode.parentNode;
			if(a.localName != "alert") a = a.parentNode;
			a.yes();
			a.close();
		};
		a.btn.appendChild(b);
	}
	if(is(o.no,"function")){
		a.no = o.no;
		b = create("button","alert-no",alert.lang["no"]);
		b.onclick = function(){
			let a =  this.parentNode.parentNode;
			if(a.localName != "alert") a = a.parentNode;
			a.no();
			a.close();
		};
		a.btn.appendChild(b);
	}
	// ---
	if(a.icon!=0) a.appendChild(a.icon);
	if(a.head!=0){
		if(c) g.appendChild(a.head);
		else a.appendChild(a.head);
	}
	if(a.body!=0){
		if(c) g.appendChild(a.body);
		else a.appendChild(a.body);
	}
	if(!is(a.yes) || !is(a.no)){
		if(c) g.appendChild(a.btn);
		else a.appendChild(a.btn);
	}
	if(c) a.appendChild(g);
	// --
	return a;
};
// --- перемешения inline в object
alert.inline = function(icon,title,desc,yes,no,time){
	let is,r,c;
	is = alert.is;
	r = alert.option;
	c = is(icon,"object");
	// --- поиск сокрашеного TIME
	if(!is(time,"number")){
		if(is(no,"number")) time = no;
		else if(is(yes,"number")) time = yes;
		else if(is(desc,"number")) time = desc;
		else if(is(title,"number")) time = title;
	}
	// --- поиск сокрашеного NO
	if(!is(no,"function")){
		if(is(yes,"function")) no = yes;
		else if(is(desc,"function")) no = desc;
		else if(is(title,"function")) no = title;
	}
	// --- поиск сокрашеного YES
	if(!is(yes,"function") || yes == no){
		if(is(desc,"function") && desc != no) yes = desc;
		else if(is(title,"function")) yes = title;
	}
	// --- корекция
	if(yes == no) no = false;
	
	return {
		pos: (c && is(icon.pos,"string")?icon.pos:r.pos),
		title: (c && is(icon.title,"string")?icon.title:(is(title,"string")?title:r.title)),
		desc: (c && is(icon.desc,"string")?icon.desc:(is(desc,"string")?desc:r.desc)),
		type: (c && is(icon.type,"string")?icon.type:r.type),
		icon: (c && is(icon.icon,"string")?icon.icon:(is(icon,"string")?icon:r.icon)),
		time: (c && is(icon.time,"number")?icon.time:(is(time,"number")?time:r.time)),
		yes: (c && is(icon.yes,"function")?icon.yes:yes),
		no: (c && is(icon.no,"function")?icon.no:no),
		center: (c && is(icon.center,"boolean")?icon.center:r.center),
	}
};
// --- спомогательные функции
alert.is = function(e,c,a){
	if(typeof(c)=="undefined") c = "undefined";
	if(typeof(c)=="string") c = alert.is.type.indexOf(c)!=-1?alert.is.type.indexOf(c):c;
	return a==true?e instanceof alert.is.instance[c]:typeof(e)==alert.is.type[c];
};
alert.is.type = ["undefined","string","object","number","function","boolean"];
alert.is.instance = [Node,Object,Array];
alert.create = function(e,c,h){
	if(alert.is(e,"string")) e = document.createElement(e);
	else if(!alert.is(e,0,true)) return false;
	if(alert.is(c,"string")) e.className = c;
	if(alert.is(h,"string")) e.innerHTML = h;
	else if(alert.is(h,0,true)) e.appendChild(h);
	return e;
};
// --- 
alert.lang = {
	"yes" : "Так",
	"no" : "Ні"
};
alert.icon = {
	comp: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  x="0px" y="0px" width="222.887px" height="222.892px" viewBox="0 0 222.887 222.892" enable-background="new 0 0 222.887 222.892" xml:space="preserve"><polyline fill-rule="evenodd" clip-rule="evenodd" fill="none" stroke="#61BC34" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="76.429,112.893 98.029,133.893 146.829,86.292 "/><path fill="none" stroke="#61BC34" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M111.443,6.5C53.577,6.5,6.5,53.576,6.5,111.443c0,57.87,47.077,104.948,104.943,104.948s104.944-47.078,104.944-104.944 S169.31,6.5,111.443,6.5z"/></svg>',
	caution: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="222.887px" height="222.893px" viewBox="0 0 222.887 222.893" enable-background="new 0 0 222.887 222.893" xml:space="preserve"><path fill="none" stroke="#FDBE00" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M213.426,171.655L127.439,29.054c-3.386-5.618-9.565-9.107-16.125-9.107s-12.74,3.49-16.128,9.108L9.2,171.655 c-3.501,5.806-3.605,13.081-0.271,18.982c3.335,5.906,9.618,9.573,16.398,9.573h171.97c6.778,0,13.064-3.668,16.397-9.573 C217.031,184.736,216.926,177.459,213.426,171.655z"/><line fill="none" stroke="#FDBE00" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="111.188" y1="83.69" x2="111.188" y2="140.728"/><line fill="none" stroke="#FDBE00" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="111.36" y1="160.89" x2="111.36" y2="162.267"/></svg>',
	error: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="222.887px" height="222.892px" viewBox="0 0 222.887 222.892" enable-background="new 0 0 222.887 222.892" xml:space="preserve"><line fill-rule="evenodd" clip-rule="evenodd" fill="none" stroke="#DC000C" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="85.229" y1="136.693" x2="137.629" y2="85.293"/><line fill-rule="evenodd" clip-rule="evenodd" fill="none" stroke="#DC000C" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="137.629" y1="136.693" x2="85.229" y2="85.293"/><path fill="none" stroke="#DC000C" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M111.443,6.5C53.577,6.5,6.5,53.577,6.5,111.443c0,57.871,47.077,104.948,104.943,104.948 c57.867,0,104.944-47.077,104.944-104.943S169.31,6.5,111.443,6.5z"/></svg>',
	info: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="222.887px" height="222.892px" viewBox="0 0 222.887 222.892" enable-background="new 0 0 222.887 222.892" xml:space="preserve"><path fill="none" stroke="#3775C1" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M111.443,6.5C53.577,6.5,6.5,53.576,6.5,111.443c0,57.87,47.077,104.948,104.943,104.948s104.944-47.078,104.944-104.944 S169.31,6.5,111.443,6.5z"/><line fill-rule="evenodd" clip-rule="evenodd" fill="none" stroke="#3775C1" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="111.663" y1="155.125" x2="111.663" y2="88.926"/><line fill-rule="evenodd" clip-rule="evenodd" fill="none" stroke="#3775C1" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="111.462" y1="64.525" x2="111.462" y2="62.926"/></svg>'
};