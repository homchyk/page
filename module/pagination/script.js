!function(){for(var n=0,i=["ms","moz","webkit","o"],e=0;e<i.length&&!window.requestAnimationFrame;++e)window.requestAnimationFrame=window[i[e]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[i[e]+"CancelAnimationFrame"]||window[i[e]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(i,e){var a=(new Date).getTime(),o=Math.max(0,16-(a-n)),t=window.setTimeout(function(){i(a+o)},o);return n=a+o,t}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(n){clearTimeout(n)})}();
// ---
// --- для данных которые изменяться в нутри таблици нужно будет заного обновлять данные отдельной функцией
// ---
var pagination = function(el,option){
	if(typeof el == "object" && el instanceof Node == false){
		option = el;
		el = false;
	}
	if(typeof(el) == "string") el = document.querySelector(el);
	if(el != false && el instanceof Node == false) return false;
	if(typeof(option) != "object") option = {};
	let k,w,v,u,view,data,sample,content,name,icon,mobile;
	// --- имена для елементов
	name = pagination.key;
	icon = pagination.icon;
	// --- сверка перевода
	if(typeof option.language == "object"){
		for(k in pagination.language){
			if(typeof(option.language[k]) != "string") option.language[k] = pagination.language[k];
		}
	}
	// --- проверка что это телефон
	u = window.navigator.userAgent.toLowerCase();
	mobile = u.indexOf("mobile") != -1 || u.indexOf("iphone") != -1 || u.indexOf("phone") != -1;
	// --- назначаем параметры для мобильного устройства
	if(mobile){
		if(typeof option.mobile == "object"){
			for(k in option.mobile) option[k] = option.mobile[k];
		}
	}
	// --- сверка view
	view = [10,25,50,100];
	if(option.view instanceof Array){
		view = option.view;
		option.view = view[0];
	}
	// ---
	option = {
		// --- дополнительный css class
		theme: typeof option.theme == "string" ? option.theme :false,
		// --- сколько показывать
		view: typeof option.view == "number" || typeof option.view == "boolean" ? option.view : 25,
		// --- показывать / не показывать поиск
		search: typeof option.search == "boolean" ? option.search : true,
		// --- какую колонку использовать для поиска
		column: typeof option.column != "undefined" ? option.column : false,
		// --- мтроки для перевода
		language: typeof option.language == "object" ? option.language : pagination.language,
		// --- стиль отображения
		style: ["table","card","line","castom"].indexOf(option.style) != -1?option.style:"table",
		// --- сортировка по полю
		sort: typeof option.sort != "undefined" ? option.sort :false,
		// --- указывает названия в шапке
		label: typeof option.label == "object" ? option.label :false, 	
		// --- задае розмеры для table, line
		size: typeof option.size != "undefined" ? option.size :false,
		// --- данные для отображения в line, card, table
		data: typeof option.data == "object" ? option.data :false,
		// --- шаблон как отрисовать карточку
		template: ["string","function"].indexOf(typeof(option.template)) != -1 ? option.template : false,
		// --- события для каждого елемента созданого через line, card
		event: typeof(option.event) == "function" ? option.event : false,
		// --- указывает куда нужно установить елемент
		append: typeof option.append != "undefined" ? option.append :false,
		// --- возмождость загрузки ajax, указываеться сылка куда нужно обрашаться с параметрами
		ajax: typeof option.ajax == "string" ? option.ajax :false,
		// --- подержка мобильных параметров, переназначает параметры если это мобильное устройство
		mobile: mobile,
		// --- фиксировать стовпчик в table, line 
		fixed: ["string","number","object"].indexOf(typeof(option.fixed)) != -1 ? option.fixed : false,
		// --- минимальный розмер ячейки для line, table
		min: typeof option.min == "number" ? option.min :100,
		// --- минимально количество кнопок после которых идет сокрашения
		btn: typeof option.btn == "number" ? option.btn :8,
		// --- ячейки которые нужно скрыть
		hidden: ["number","string","object"].indexOf(typeof(option.hidden)) != -1 ? option.hidden : false,
	};
	// --- поиск append
	if(typeof option.append == "string") option.append = document.querySelector(option.append);
	// --- корекция style
	if(el instanceof Node) option.style=option.style=="table"&&el.localName!="table"?"castom":option.style;
	else option.style=option.style=="castom"?"table":option.style;
	// --- создания оболочки
	sample = pagination.create("div",name.sample+(typeof(option.theme) == "string"?" "+option.theme:""));
	// --- если это мобильное то казываем что это мобильный стиль
	if(mobile) sample.setAttribute("mobile","on");
	sample.index = new Object(); // --- хранить индекс ключа
	sample.raw  = new Object(); // --- список данных в формате Object
	sample.node = new Object(); // --- список Node для поиска
	sample.text = new Object(); // --- список Текста для поиска
	sample.list = new Array; 	// --- список ключей Node которые подходят по поиску
	sample.body = null;		 	// --- хранить ссылку на родтеля для table,castom
	sample.label = null;	 	// --- хранить ссылку на блок с label для table,line
	sample.param = {
		column: 'all',
		view: option.view,
		page: 1,
		start: 0,
		end: 0,
		total: 0,
		// --- розмере для table или line
		size: false,
		max: 0,
		min: 0,
	};
	// --- определяем колонки
	if(typeof option.column != "boolean"){
		sample.param.column = option.column;
		option.column = true;
	}
	// --- информация
	sample.info = pagination.create("span",name.info);
	// --- шапка
	sample.head = pagination.create("div",name.head);
	sample.head.view = pagination.create("div",name.view,false,'<p>'+option.language["view"]+'</p>',function(){
		if(!this.list.classList.contains("open")) this.list.open();
		else this.list.close();
	});
	sample.head.view.list = pagination.select(function(k){
		this.parentNode.parentNode.parentNode.view(parseInt(k));
	});
	sample.head.view.appendChild(sample.head.view.list);
	// ---
	sample.head.search = pagination.create("div",name.search,false,{
		0: icon.search,
		1: pagination.create("p",0,0,option.language["search"]),
		2: pagination.create("input",0,{"type":"text"},false,{oninput:function(){
			this.parentNode.parentNode.parentNode.search(this.value)
		}})
	});
	sample.head.search.onclick = function(e){
		if(!this.list.classList.contains("open")) this.list.open();
		else this.list.close();
	};
	sample.head.search.list = pagination.select(function(k){
		this.parentNode.parentNode.parentNode.param.column = k;
	});
	sample.head.search.update = function(){
		let sample,section,label,k,i,column,values,keys;
		sample = this.parentNode.parentNode;
		section = this.children[1];
		this.setAttribute("select","no");
		if(section.localName != "p") this.removeChild(section);
		if(sample.option.search !== false && sample.option.column == true){
			// --- создания списка
			label = new Object();
			label['all'] = sample.option.language["all"];
			if(sample.option.label == false){
				section = Object.keys(sample.node);
				i = 0;
				if(section.length > 0){
					section = sample.text[section[0]];
					for(k in section){
						label[k] = i;
						i++;
					}
				}
			}else{
				section = sample.option.label;
				for(k in section){
					if(section[k] == "") continue;
					label[k] = section[k];
				}
			}
			column = sample.param.column;
			// --- определяем ключ
			if(typeof label[column] == "undefined"){
				values = Object.values(label);
				keys = Object.keys(label);
				if(values.indexOf(column) != -1) column = keys[values.indexOf(column)];
				else if(typeof column == "number" && typeof keys[column+1] != "undefined") column = keys[column+1];
				sample.param.column = column;
			}
			this.setAttribute("select","on");
			this.list.update(label,column);
			this.insertBefore(this.list,this.children[1]);
		}
		return true;
	};
	// ---
	pagination.create(sample.head,0,0,{
		0: sample.head.view,
		1: sample.head.search
	});
	// --- контент
	sample.content = pagination.create("div",name.content);
	// --- подвал
	sample.footer = pagination.create("div",name.footer);
	sample.footer.info = pagination.create("p",0,0,option.language["info"]);
	// --- paginate
	sample.paginate = pagination.create("div",name.group);
	sample.paginate.prev = pagination.create("a",name.btn,{"page":0},icon.prev+'<p>'+option.language["prev"]+'</p>');
	sample.paginate.next = pagination.create("a",name.btn,{"page":0},'<p>'+option.language["next"]+'</p>'+icon.next);
	sample.paginate.update = function(){
		let pages,i,el,parent,start,end,sample,page,view,max,list,s,e;
		sample = this.parentNode.parentNode;
		max = sample.option.btn;
		page = sample.param.page;
		view = sample.param.view;
		view = (typeof view == "boolean"?sample.list.length:view);
		pages = Math.ceil(sample.param.total/view);
		parent = document.createDocumentFragment();
		list = new Array;
		for(i = 0; i<pages;i++){
			el = pagination.create("a",pagination.key.btn,{"page":i+1},i+1);
			if(page == i+1) el.setAttribute("active","on");
			list.push(el);
		}
		this.prev.setAttribute("page",page-1);
		this.next.setAttribute("page",page+1);
		
		if(pages > max){
			max = max-2;
			start = list[0];
			end = list[pages-1];
			// ---
			s = page - Math.ceil(max/2);
			e = page + Math.ceil(max/2);
			
			if(s < 1){
				e += Math.abs(s);
				s = 1;
			}
			if(e > pages){
				e = pages;
				s = e - max;
			}
			// ---
			parent.appendChild(start);
			if(page > 2) parent.appendChild(pagination.create("p",pagination.key.btn,0,'...'));
			for(i = s; i < e; i++) parent.appendChild(list[i]);
			if(list.length-2 > page) parent.appendChild(pagination.create("p",pagination.key.btn,0,'...'));
			parent.appendChild(end);
			
		}else{
			for(i = 0; i < list.length;i++){
				parent.appendChild(list[i]);
			}
		}
		this.children[1].innerHTML = "";
		this.children[1].appendChild(parent);
		
		// --- назначения событий для кнопок
		[].forEach.call(this.querySelectorAll('a'),function(el){
			el.onclick = function(){
				let a,p;
				p = this.parentNode.parentNode.parentNode;
				if(!p.classList.contains(pagination.key.sample)) p = p.parentNode;
				a = parseInt(this.getAttribute("page"));
				if(a < 1) a = 1;
				else if(a > pages) a = pages;
				p.param.page = a;
				if(p.option.ajax == false) p.update();
				else p.ajax();
			}
		});
	};
	pagination.create(sample.footer,0,0,{
		0: sample.footer.info,
		1: pagination.create(sample.paginate,0,0,[sample.paginate.prev,pagination.create("div"),sample.paginate.next])
	});
	// --- шапка и подвал
	sample.appendChild(sample.head);
	sample.appendChild(sample.content);
	sample.appendChild(sample.footer);
	// --- функции
	sample.demand = function(str){
		let e,c;
		c = pagination.key.demand;
		e = this.content.querySelector("."+c);
		if(e instanceof Node == false) e = pagination.create("span",c);
		if(typeof(str)=="string"){
			e.innerHTML = str;
			this.content.appendChild(e);
		}else if(e.parentNode != null){
			e.parentNode.removeChild(e);
		}
	};
	sample.ajax = function(param){
		let xhr,data,search,sort,asc,sample;
		sample = this;
		sort = sample.option.sort;
		if(typeof sort == "boolean") sort = sort?"on":"no";
		asc = sort[0] == "-"?"on":"no";
		sort = sort[0] == "-"?sort.slice(1):sort;
		search = sample.head.search.children[2].value;
		
		if(typeof param != "object") param = new Object();
		
		param = {
			asc: typeof param.asc != "undefined" ? param.asc : asc,
			sort: typeof param.sort != "undefined" ? param.sort : sort,
			search: typeof param.search == "string" ? param.search :search,
			page: typeof param.page == "number" ? param.page : sample.param.page,
			view: typeof param.view == "number" ? param.view : sample.param.view
		};
		
		data = new FormData();
		data.append("asc", param.asc);
		data.append("sort",param.sort);
		data.append("search",param.search);
		data.append("page",param.page);
		data.append("view",param.view);
		// --- очистка
		this.clear(false);
		// ---
		xhr = new XMLHttpRequest();
		xhr.open("POST", sample.option.ajax, true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4){
				try{data = JSON.parse(xhr.responseText)}catch(c){data = {"total": 0,"page": 0,"start": 0,"end": 0,"list": new Array}}
				if(typeof data.total == "number" && typeof data.list == "object"){
					sample.param.total = data.total;
					sample.param.page = data.page;
					sample.param.start = data.start;
					sample.param.end = data.end;
					sample.update(data.list);
				}
		  	}
		}
		xhr.send(data);
	};
	sample.add = function(d,id,raw){
		let i,key;
		// --- если это масив перебираем его как масив
		if(id === true){
			key = Object.keys(d);
			for(i=0;i<key.length;i++) this.add(d[key[i]],key[i]);
			return true;
		}
		// --- сверка id
		if(typeof this.node[id] != "undefined" && raw != true){
			key = Object.keys(this.node);
			id = key[key.length-1]+1;
		}
		// --- записываем в raw
		this.raw[id] = d;
		// --- оброботка данных
		if(d instanceof Node == false && (d instanceof Object || typeof d == "string")){
			// --- пытаемся создать Node и оброботать его
			d = pagination.item(d,{
				style: this.option.style,
				label: this.option.label,
				event: this.option.event,
				template: this.option.template,
				// --- розмеры
				size: this.param.size,
				max: this.param.max,
				min: this.param.min,
			},this.index);
		}
		// --- добавляем node 
		if(d instanceof Node){
			d.setAttribute(pagination.key.id,id);
			// --- очистка от фишки с parse
			d.style.display = "";
			this.node[id] = d;
			// --- индексация текста
			this.indexed(d,id);
		}
		return true;
	};
	sample.del = function(id){
		if(typeof this.node[id] == "undefined") return false;
		delete(this.node[id]);
		delete(this.raw[id]);
		delete(this.text[id]);
		if(this.list.indexOf(id) != -1) this.list.splice(this.list.indexOf(id),1);
		return true;
	};
	sample.get = function(id,raw){
		if(typeof id == "string" || typeof id == "number") return raw!=true?this.node[id]:this.raw[id];
		else if(typeof id == "boolean" || this.option.ajax !== false) return raw!=true?this.node:this.raw;
		let i,list,key;
		list = new Object();
		for(i = this.param.start-1; i < this.param.end; i++){
			key = this.list[i];
			list[key] = (raw!=true?this.node[key]:this.raw[key]);
		}
		return list;
	};
	sample.set = function(id,obj){
		if(typeof this.raw[id] == "undefined" || typeof obj != "object") return false;
		this.add(obj,id,true);
		return true;
	};
	sample.sort = function(sort,asc){
		let column,k,i,data,e,isN,isS,isD;
		data = new Array;
		if(typeof asc != "boolean") asc = false;
		if(typeof sort == "undefined") sort = this.option.sort;
		if(typeof sort == "boolean") this.option.sort = sort;
		if(typeof sort != "boolean"){
			sort = sort+"";
			if(sort[0] == "-"){
				asc = true;
				sort = sort.slice(1);
			}
			this.option.sort = (asc?"-":"")+sort;
		}
		if(typeof this.option.sort != "boolean"){
			// --- проверка на число
			if(!isNaN(parseInt(sort))) sort = parseInt(sort);
			// --- компиляция текста
			for(i = 0; i < this.list.length; i++){
				k = this.list[i];
				data.push([this.text[k][sort],k]);
			}
		}
		if(data.length > 0){
			e = data[0][0];
			isD = e.indexOf("/") != -1 || e.indexOf("-") != -1 || e.indexOf(":") != -1 || e.indexOf(".",e.indexOf(".")+1) != -1;
			isN = !isD && !isNaN(parseFloat(e));
			isS = !isN && !isD;
			data = data.sort(function(a,b,r,a1,b1){
				if(isN) r = parseFloat(a[0]) < parseFloat(b[0]);
				else if(isS) r = a[0].toLowerCase() < b[0].toLowerCase();
				else if(isD) r = new Date(a[0]).getTime() < new Date(b[0]).getTime();
				// ---
				r = asc?!r:r;
				return r?1:-1;
			});
			this.list = new Array;
			for(k in data) this.list.push(data[k][1]);
		}

		if(this.option.ajax == false) this.update();
		else this.ajax();
	};
	sample.search = function(value){
		value = (typeof value != "string"?"":value);
		this.list = new Array;
		let k,column,text,hidden;
		this.param.page = 1;
		// --- если колонок нет 
		column = this.option.column == false?'all':this.param.column;
		if(column == "all"){
			for(k in this.node){
				text = Object.values(this.text[k]).join(" ");
				if(new RegExp(value,"gi").test(text) || value == "") this.list.push(k);
			}
		}else{
			// --- опреденяем ключ
			for(k in this.node){
				text = this.text[k][column];
				if(new RegExp(value,"gi").test(text) || value == "") this.list.push(k);
			}
		}
		
		if(this.option.ajax == false) this.sort();
		else this.ajax();
	};
	sample.clear = function(update){
		this.raw  = new Object();
		this.node = new Object();
		this.text = new Object();
		this.list = new Array;
		this.param.total = 0;
		if(update != false) this.update();
	};
	sample.update = function(data){
		if(typeof data == "object"){
			this.add(data,true);
			// --- если это не ajax ишем и сортируем данные
			if(this.option.ajax == false){
				this.search(this.head.search.children[1].value);
				return true;
			}
		}
		let content,body,i,isview,ajax,view,key;
		// --- коректировка
		ajax = this.option.ajax;
		isview = !(typeof this.param.view == "boolean");
		view = (isview?this.param.view:this.list.length);
		// --- трохи запутано посмотреть как будет с ajax
		if(view >= this.list.length && ajax == false) this.param.page = 1;
		// --- обновления param если это не ajax
		if(ajax == false){
			this.param.total = this.list.length;
			this.param.end = this.param.page * view;
			this.param.start = this.param.end - view + 1;
			if(this.param.start < 0) this.param.start = 0;
			if(this.param.end > this.param.total) this.param.end = this.param.total;
		}
		// --- обновления paginate
		this.paginate.update();
		// --- обновления label сортировку
		this.label.update();
		// --- обновления елементов
		content = document.createDocumentFragment();
		body = this.body == null?this.content:this.body;
		body.innerHTML = "";
		if(ajax == false){
			// --- если это не ajax выводим только указанные елементы
			for(i=this.param.start-1;i<this.param.end;i++) content.appendChild(this.node[this.list[i]]);
		}else{
			// --- выводим все елементы которые получили
			key = Object.keys(this.node);
			for(i=0;i<key.length;i++) content.appendChild(this.node[key[i]]);
		}
		body.appendChild(content);
		// *** похожий код будет в resize
		// --- позиционирования по розмерам для карточок
		if(this.option.style == "card") pagination.position(body,this.option);
		// --- позиционирования для фиксированных елементов
		if(this.option.style == "line" || this.option.style == "table"){
			this.content.fixed = false;
			pagination.fixed(this);
		}
		// ***
		// --- информирования
		this.footer.info.innerHTML = pagination.template(this.option.language["info"],{
			"TOTAL": this.param.total,
			"START": this.param.start,
			"END": this.param.end,
		});
		this.demand(this.param.total==0?this.option.language["zero"]:0);
		// --- обновления шапки и подвала 
		this.head.setAttribute("view",isview?"on":"no");
		this.head.setAttribute("search",this.option.search?"on":"no");
		this.setAttribute("head",!isview && !option.search?"no":"on");
		this.setAttribute("footer",(view >= this.param.total && !ajax)?"no":"on");
		this.setAttribute("sort",this.option.sort===false?"no":"on");
	};
	sample.view = function(view){
		if(typeof view != "number" && typeof view != "boolean") return false;
		// ---
		// попытаться определить страницу но данным
		// ---
		this.param.view = view;
		this.page(this.param.page);
		if(typeof view == "number") this.head.view.children[1].children[0].textContent = view;
		return true;
	};
	sample.page = function(page){
		if(typeof page != "number") return false;
		let a,z;
		z = this;
		a = Math.ceil(z.param.total/(typeof(z.param.view)!="number"?z.list.length:z.param.view));
		this.param.page = page>a?a:page;
		this.update();
		return true;
	};
	sample.hide = function(list,update){
		if(["undefined","boolean"].indexOf(typeof(list)) != -1) list = [];
		else if(["number","string","object"].indexOf(typeof(list)) == -1) return false;
		let index,k,i,keys,values,hidden,label;
		// --- корекция hidden
		if(typeof list != "object") list = [list];
		// --- дотягиваем масив до обекта на основе index
		index = this.index;
		hidden = new Object();
		keys = Object.keys(index);
		values = Object.values(index);
		for(i = 0; i < list.length; i++){
			k = list[i];
			if(typeof index[k] == "undefined" && values.indexOf(k) != -1) k = keys[values.indexOf(k)];
			hidden[k] = list[i];
		}
		// --- преврашаем в обычный масив с правильными ключами для index
		hidden = Object.keys(hidden);
		hidden = hidden.length>0?hidden:false;
		this.option.hidden = hidden;
		// --- обновляем node
		list = this.node;
		label = this.label;
		if(label != null && this.option.style == "table") label = label.children[0];
		// --- скрытия
		if(hidden != false){
			// --- заголовки
			if(label != null){
				requestAnimationFrame(function(){
					for(k in index) label.children[index[k]].style.display = hidden.indexOf(k) != -1 ? "none" : "";
				});
			}
			// --- контент
			requestAnimationFrame(function(){
				for(i in list){
					for(k in index) list[i].children[index[k]].style.display = hidden.indexOf(k) != -1 ? "none" : "";
				}
			});
		}else{
			if(label != null) requestAnimationFrame(function(){for(k in index) label.children[index[k]].style.display = ""});
			requestAnimationFrame(function(){for(i in list){for(k in index) list[i].children[index[k]].style.display = ""}});
		}
		// --- обновляем розмеры в таблице
		if(update != false) this.resize();
		return true;
	};
	// ---
	sample.resize = function(){
		let param,option,list,keys,index,label,k;
		// --- определения розмера
		this.size();
		param = this.param;
		option = this.option;
		list = this.node;
		index = this.index;
		// --- заново назначаем размеры для label
		if(option.style == "line" && typeof param.size != "boolean" && this.label != null){
			label = this.label;
			keys = label.children;
			// --- количество ячеек
			k = keys.length;
			if(option.hidden != false) k -= option.hidden.length;
			label.setAttribute("count",k);
			// ---
			requestAnimationFrame(function(){
				for(k in param.size) keys[index[k]].style.width = param.size[k];
				label.style.width = Math.max(param.max,param.min)+"px";
			});
		}
		// --- розмер для table
		if(option.style == "table" && typeof param.size != "boolean"){
			this.body.parentNode.style.width = Math.max(param.max,param.min)+"px";
		}
		// --- назначения розмеров для node
		if((option.style == "table" || option.style == "line") && typeof param.size != "boolean"){
			requestAnimationFrame(function(){
				for(i in list){
					keys = list[i].children;
					for(k in param.size) keys[index[k]].style.width = param.size[k];
					list[i].style.width = Math.max(param.max,param.min)+"px";
				}
			});
		}
		// --- изменения который есть и в update
		this.content.fixed = false;
		if(option.style == "card") pagination.position(this.body == null?this.content:this.body,option);
		else if(option.style == "line" || option.style == "table") pagination.fixed(this);
		// ---
		return true;
	};
	sample.size = function(){
		if(this.option.size == false) return false;
		let width,size,option,count,keys;
		option = this.option;
		size = window.getComputedStyle(this.body != null ? this.body : this.content);	
		if(size.boxSizing != "border-box") width = parseFloat(size.width);
		else width = parseFloat(size.width)-(parseFloat(size.paddingLeft)+parseFloat(size.paddingRight));
		// --- количество ячеек
		count = 0;
		if(option.data instanceof Object){
			keys = Object.keys(option.data);
			if(keys.length > 0){
				keys = option.data[keys[0]];
				count = keys instanceof Node?keys.children.length:Object.keys(keys).length;
			}
		}
		// --- коректирования розмеров для line и table
		size = false
		if(option.size instanceof Array) size = option.size.concat();
		else if(option.size instanceof Object) size = Object.assign({},option.size);
		size = pagination.size(size,count,width,option.min,option.hidden);
		if(typeof size == "boolean"){
			size = {
				size: size,
				max: width,
				min: width,
			}
		}

		this.param.size = size.size;
		this.param.max = size.max;
		this.param.min = size.min;
		
		return size;
	};
	sample.build = function(){
		if(this.option.style == "castom") return false;
		let option,content,data,raw;
		option = this.option;
		content = this.content;
		// --- определяем первоначальные данные
		raw = Object.keys(this.raw).length != 0?this.raw:this.option.data;
		// --- очистка старых данных
		this.clear(false);
		content.innerHTML = "";
		// --- параметры для content
		content.setAttribute("item",option.style);
		// --- генерация новых body и label
		data = pagination.build({style: option.style,label: option.label});
		
		this.label = data.head != false?data.head:null;
		this.body = data.body != false?data.body:null;
		
		if(option.style != "table" && this.label != null) content.appendChild(this.label);
		
		if(option.style == "table") content.appendChild(data.table);
		else if(data.body != false) content.appendChild(this.body);
		// --- добавляем елементы
		if(typeof raw == "object") this.add(raw,true);
		return true;
	};
	// --- индексирует данные
	sample.indexed = function(el,id){
		if(typeof el != "undefined"){
			// --- индексация елемента
			id = typeof id == "undefined" ? el.getAttribute(pagination.key.id) : id;
			if(typeof id == "undefined") return false;
			let raw,i;
			el = el.children;
			raw = new Object();
			for(i = 0; i < el.length; i++) raw[(typeof el[i].key != "undefined"?el[i].key:i)] = el[i].textContent;
			this.text[id] = raw;
			return true;
		};
		// --- если это template индексация не нужна (возможно поже сделаю по другому)
		if(this.option.template != false) return false;
		// --- индексация идет по label если ее нет тогда по data (body)
		let data,keys,list,k,a,i;
		data = this.option.data;
		list = this.option.label;
		if(list == false && data != false){
			a = Object.keys(data);
			list = data[a[0]];
		}
		// --- {ключ : индекс}
		keys = new Object();
		i = 0;
		if(typeof list == "object"){
			for(k in list){
				keys[k] = i;
				i++;
			}
		}
		
		this.index = keys;
		// --- для стиля card нужно будет придумать другое
		return true;
	};
	// --- определения контента
	content = sample.content;
	content.setAttribute("item",option.style);
	// --- назначаем scroll
	content.onscroll = function(){pagination.fixed(this.parentNode)};
	// --- оброботка
	if(el instanceof Node){
		if(option.style == "castom") sample.body = el;
		if(option.style == "table"){
			if(el.children[0].localName == "thead") sample.label = el.children[0];
			if(el.children[0].localName == "tbody") sample.body = el.children[0];
			else if(el.children[1].localName == "tbody") sample.body = el.children[1];
		}
		// --- перемешения перед елементом
		if(el.parentNode instanceof Node) el.parentNode.insertBefore(sample, el);
		// --- парсинг данных
		data = pagination.parse(el);
		// --- совмешения опций
		if(option.size === true) option.size = data.size;
		if(option.label == false) option.label = data.label;
		if(option.data == false) option.data = data.list;
		// --- вставка контейнера
		if(option.style == "table" || option.style == "castom") content.appendChild(el);
		else if(el.parentNode instanceof Node) el.parentNode.removeChild(el);
	}
	if(option.append instanceof Node) option.append.appendChild(sample);
	// --- дотягиваем масив розмеров до обекта
	if(option.label instanceof Object && !(option.label instanceof Array) && option.size instanceof Array){
		u = 0;
		v = new Object();
		for(k in option.label){
			v[k] = typeof option.size[u] != "undefined"?option.size[u]:0;
			u++;
		}
		option.size = v;
	}
	// --- записываем коректные опции
	sample.option = option;
	// --- индексация
	sample.indexed();
	// --- первое определяем розмер контейнера
	sample.size();
	// --- генерация sample.body, более коректно передать Node елементы
	if(el instanceof Node) sample.add(sample.body != null ? sample.body.children : option.data,true);
	else el = null;
	// --- стиль отображения
	if((option.style=="table" && el==null) || option.style=="line" || option.style=="card") sample.build();
	// --- скрытия колонок
	sample.hide(option.hidden,false);
	// --- назначения розмера
	sample.resize();
	// --- назначаем параметры для сортировки
	if(sample.label == null) sample.label = pagination.create("div");
	sample.label.connected = sample;
	sample.label.update = function(){
		let i,list,sample,name,sort,asc,before;
		sample = this.connected;
		name = pagination.key;
		list = this.localName != "thead"?this.children:this.children[0].children;
		// --- поиск по ключу
		if(sample.option.sort === false) return false;
		sort = (typeof sample.option.sort != "boolean"?sample.option.sort+"":"");
		if(asc = (sort[0] == "-")) sort = sort.slice(1);
		// --- назначаем события
		for(i=0;i<list.length;i++){
			if(typeof list[i].asc != "undefined") continue;
			list[i].asc = false;
			if(list[i].hasAttribute(name.key) == false) list[i].setAttribute(name.key,i);
			if(list[i].getAttribute(name.key) == sort) sort = list[i];
			list[i].onclick = function(){sample.label.switch(this)};
		}
		// --- поиск елемента
		if(sort instanceof Node == false) sort = this.querySelector('['+name.key+'="'+sort+'"]');
		// --- убераем предыдушие стрелки
		before = this.querySelector("."+name.sort);
		if(before != null) before.parentNode.removeChild(before);
		if(sort instanceof Node){
			sort.asc = asc;
			pagination.create(sort,0,0,pagination.create("div",name.sort,0,(sort.asc?icon.asc:icon.desc)));
		}
		return true;
	};
	sample.label.switch = function(sort){
		if(sort instanceof Node == false) return false;
		this.connected.sort(sort.getAttribute(name.key),!sort.asc);
	};
	// --- параметры view
	sample.head.view.list.update(view,option.view,true);
	// --- параметры search
	sample.head.search.update();
	// --- поиск данных
	sample.search();
	// --- назначения событий один раз
	if(pagination.initial != "on"){
		pagination.initial = "on";
		// --- открытия/закрытия выбора
		window.addEventListener("click", function(e){
			let select = "."+pagination.key.select;
			if(e.target.closest(select) == null){
				[].forEach.call(document.querySelectorAll(select),function(a){a.close()});
		    }
		    select = undefined;
		});
		// --- изменения розмера елемента
		window.addEventListener("resize", function(){
			
			[].forEach.call(document.querySelectorAll("."+pagination.key.sample),function(a){a.resize()});
		});
	}
	return sample;
};
pagination.build = function(option){
	let r,k,e,c,name,label,style,key;
	r = {head:false,body:false,table:false};
	style = typeof option.style == "string" ? option.style : false;
	label = typeof option.label != "undefined" ? option.label : false;
	name = pagination.key;
	if(typeof label == "object" && ["line","table"].indexOf(style) != -1){
		c = Object.keys(label).length;
		if(style == "line") r.head = pagination.create("div",name.item,{"label":"on","view":"line","count":c});
		else r.head = pagination.create("tr");
		for(k in label){
			e = pagination.create((style == "line"?"div":"td"),0,0,label[k]);
			e.setAttribute(name.key,k);
			e.key = k;
			r.head.appendChild(e);
		}
		r.body = pagination.create("div");
	}
	if(style == "table"){
		if(r.head != false) r.head = pagination.create("thead",0,0,r.head);
		r.body = pagination.create("tbody");
		r.table = pagination.create("table",0,0,{
			0: !r.head?false:r.head,
			1: r.body
		});
	}
	return r;
};
pagination.item = function(data,option,index){
	option = {
		style: typeof option.style == "string" ? option.style : false,
		label: typeof option.label == "object" ? option.label : false,
		event: typeof option.event == "function" ? option.event : false,
		template: typeof option.template == "undefined" || option.template == ""? false : option.template,
		// --- розмеры
		size: typeof option.size != "undefined" ? option.size : false,
		max: typeof option.max != "undefined" ? option.max : false,
		min: typeof option.min != "undefined" ? option.min : false,
	};
	let e,i,c,k,v,name,style,nodes,keys;
	e = pagination.create("div");
	style = option.style;
	name = pagination.key;
	nodes = new Object();
	if(typeof data == "object"){
		c = Object.keys(option.label!=false?option.label:data).length;
		if(style == "table"){
			e = pagination.create("tr");
			for(k in data){
				nodes[k] = data[k] instanceof Node?data[k]:pagination.create("td",0,0,data[k]);
				e.appendChild(nodes[k]);
			}
		}
		if(style == "line"){
			e = pagination.create("div",name.item,{"view":"line","count":c});
			for(k in data){
				nodes[k] = data[k] instanceof Node?data[k]:pagination.create("div",0,0,data[k]);
				e.appendChild(nodes[k]);
			}
		}
		if(style == "card"){
			e = pagination.create("div",name.item,{"view":"card"});
			if(option.template == false){
				c = 0;
				for(k in data){
					if(option.label != false) keys = typeof option.label[k] != "undefined"?option.label[k]:option.label[c];
					nodes[k] = (data[k] instanceof Node?data[k]:pagination.create("div",0,0,data[k]));
					pagination.create(e,0,{"template":(!option.label?"no":"column")},{
						0: (!option.label || typeof keys == "undefined"?false:pagination.create("p",0,0,keys)),
						1: nodes[k]
					});
					c++;
				}
			}else{
				if(typeof option.template == "function") option.template = option.template(data);
				if(typeof option.template == "string") option.template = pagination.template(option.template,data);
				pagination.create(e,0,{"template":"on"},option.template);
			}
		}
	}
	if(typeof data == "string"){
		pagination.create(e,0,0,data);
		if(e.children.length == 1) e = e.children[0];
		e.classList.add(name.item);
		for(i = 0; i < e.children.length; i++) nodes[i] = e.children[i];
	}
	// --- назначаем розмеры для ячеек
	if((style == "table" || style == "line") && typeof option.size != "boolean" ){
		keys = Object.keys(nodes);
		// --- сокрашенный вариант розмера через index
		for(k in option.size) e.children[index[k]].style.width = option.size[k];
		/*
		for(k in keys){
			// --- тут можно переделать прямой вызов к node через index
			v = typeof option.size[k] != "undefined"?option.size[k]:option.size[keys[k]];
			if(typeof v != "undefined") nodes[keys[k]].style.width = v;
		}
		*/
		if(typeof option.max == "number") e.style.width = Math.max(option.max,option.min)+"px";
	}
	// --- назначаем ключи, используеться в .add() для поиска по тексту
	for(k in nodes){
		nodes[k].setAttribute(name.key,k);
		nodes[k].key = k;
	}
	// --- назначаем евенты через обявленую функцию
	if(typeof option.event == "function") option.event(e);
	
	return e;
};
// --- при изменении розмера заного росчитывать
pagination.fixed = function(sample){
	if(sample.option.fixed === false) return false;
	let x,m,w,s,e,v,p,k,i,j,item,child,fixed,body,label,bound,style,position,start,end,border;
	body = sample.body != null ? sample.body : sample.content;
	label = sample.label != null ? sample.label : null;
	if(body.children.length == 0) return false;

	if(typeof sample.content.fixed != "object"){
		w = sample.content.offsetWidth;
		fixed = sample.option.fixed;
		child = body.children[0].children;
		item = new Array;
		position = new Object();
		start = new Object();
		end = new Object();
		if(typeof fixed != "object") fixed = [fixed];
		// --- получения стилей
		style = window.getComputedStyle(sample.content);
		// --- начало смешения
		s = parseFloat(style.paddingLeft);
		// --- конец смешения
		e = parseFloat(style.paddingRight);
		// --- ширина border
		border = parseFloat(window.getComputedStyle(body.children[0]).borderLeftWidth);
		// --- определения елементов для фиксации
		for(j = 0; j < child.length; j++){
			for(i = 0; i < fixed.length; i++){
				if(typeof fixed[i] == "string" && child[j].getAttribute(pagination.key.key) == fixed[i]) item.push(j);
				else if(fixed[i] < 0 && (child.length-Math.abs(fixed[i])) == j) item.push(j);
				else if(fixed[i] >= 0 && fixed[i] == j) item.push(j);
			}
		}
		// ---
		p = sample.content.getBoundingClientRect().left;
		// --- item смешения для елементов если они не вмешаються в области, считать от последнего елемента
		m = 0;
		for(i=item.length-1; i >=0; i--){
			k = item[i];
			bound = child[k].getBoundingClientRect();
			// --- те которые в видемой области
			x = 0;
			// --- те которые не попали в видимую область нужно сместыть в минус
			start[k] = s+border;
			end[k] = 0;
			if((bound.left-p)+bound.width > w){
				m += bound.width;
				x = 0-(bound.left-p)+(w-m);
				// ---
				start[k] = 0;
				end[k] = e+border;
			}
			position[k] = x;
		}
		sample.content.fixed = {item: item, position: position, start: start, end: end, border: border};
		// --- назначить всем атрибут
		if(label != null){
			child = sample.option.style == "line"?label.children:label.children[0].children;
			for(i=0; i < item.length; i++) child[item[i]].setAttribute("fixed","on");
		}
		for(k in sample.node){
			child = sample.node[k].children;
			for(i=0; i < item.length; i++) child[item[i]].setAttribute("fixed","on");
		}
	}

	s = sample.content.scrollWidth;
	x = sample.content.scrollLeft;
	w = sample.content.offsetWidth;

	fixed = sample.content.fixed;
	item = fixed.item;
	position = fixed.position;
	start = fixed.start;
	end = fixed.end;
	
	requestAnimationFrame(function(){
		if(label != null){
			child = sample.option.style == "line"?label.children:label.children[0].children;
			for(k in item){
				k = item[k];
				pagination.fixed.set(child[k],position[k],start[k],end[k],x,w,s);
			}
		}
		for(i = 0; i < body.children.length; i++){
			child = body.children[i].children;
			for(k in item){
				k = item[k];
				pagination.fixed.set(child[k],position[k],start[k],end[k],x,w,s);
			}
		}
	});
};
pagination.fixed.set = function(item,position,start,end,x,w,s,v){
	v = (position+x)-start;
	if(start != 0 && v < 0) v = 0;
	else if(end != 0 && s != w && s-(w+x) < end) v = 0;
	item.style.left = v+"px";
};
pagination.position = function(body,option){
	let list,width,line,column,i,c,e,t,w,ml,mr,style,fragment;
	
	width = window.getComputedStyle(body);	
	if(width.boxSizing != "border-box") width = parseFloat(width.width);
	else width = parseFloat(width.width)-(parseFloat(width.paddingLeft)+parseFloat(width.paddingRight));
	
	list = body.children;
	column = new Array;
	line = new Array;
	c = list.length;
	
	if(option.mobile == false){
		requestAnimationFrame(function(){
			// --- сначала нужно вернуть всем розмеры
			for(i = 0; i < list.length; i++){
				list[i].style.marginLeft = "";
				list[i].style.marginRight = "";
				list[i].style.marginTop = "";
				list[i].style.marginBottom = "";
			}
			t = 0;
			for(i = 0; i < c; i++){
				style = window.getComputedStyle(list[i]);
				w = parseFloat(style.width);
				ml = parseFloat(style.marginLeft);
				mr = parseFloat(style.marginRight);
				// --- позиция ячейки
				t += w + (i>0?ml:0)+mr;
				// --- проверка что вмешаеться
				if(t > width && (t-mr) > width){
					// --- записываем линию
					line.push(column);
					// --- создания нового набора колонок
					column = new Array;
					// --- назначаем стартовую позицию
					t = w+mr;
				}
				// --- вставка колонки
				column.push(list[i]);
				// --- если это последний елемент то записываем в линию
				if(i == c-1) line.push(column);
			}
			// --- назначаем margin
			if(line.length > 0){
				for(i=0;i<line.length;i++){
					c = line[i].length;
					if(c > 0) line[i][0].style.marginLeft = "0px";
					if(c > 1) line[i][c-1].style.marginRight = "0px";
				}
				for(i=0;i<line[0].length;i++) line[0][i].style.marginTop="0px";
				for(i=0;i<line[line.length-1].length;i++)line[line.length-1][i].style.marginBottom="0px";
			}
		});
	}else{
		// --- если это мобильное устройство то карточки делаем в линию
		requestAnimationFrame(function(){
			width = 0;
			for(i=0;i<c;i++){
				style = window.getComputedStyle(list[i]);
				width += parseFloat(style.width);
				
				if(i != 0) width += parseFloat(style.marginLeft);
				else list[i].style.marginLeft = "0px";
				if(i < c-1) width += parseFloat(style.marginRight);
				else list[i].style.marginRight = "0px";
				
				list[i].style.marginTop = "0px";
				list[i].style.marginBottom = "0px";
			}
			fragment = document.createDocumentFragment();
			while(list.length > 0){fragment.appendChild(list[0])}
			e = pagination.create("div",pagination.key.line,{"style":"width:"+width+"px"});
			pagination.create(body,false,false,e);
			e.appendChild(fragment);
		});
	}
};
pagination.size = function(size,count,width,min,hidden){
	// --- пересчет запутан и сложный !!!
	// --- width - минимальный розмер до которого нужно дотянуть
	if(!(size instanceof Object)) return false;
	let r,i,k,v,c,px,p,b,all,key,round;
	r = {"size":new Object(),"min":width,"max":width};
	c = count;
	key = Object.keys(size);
	// --- если нужных данных нет прекрашаем оброботку
	if(key.length == 0 || c == 0) return false;
	if(typeof min != "number") min = 100;
	if(typeof hidden != "object") hidden = false;
	// --- исключаю скрытые колонки (возможные проблемы с масивом)
	if(hidden != false){
		for(k in hidden){
			if(typeof size[hidden[k]] != "undefined") delete(size[hidden[k]]);
		}
		c -= hidden.length;
	}
	s = 0;
	o = 0;
	all = 0;
	p = new Array;

	for(k in size){
		if(typeof size[k] == "string"){
			if(size[k].indexOf("%") != -1) {p.push(k); s += parseFloat(size[k])}
			else if(size[k].indexOf("px") != -1){size[k] = parseFloat(size[k])}
			else if(size[k].indexOf("vw") != -1){size[k] = (parseFloat(size[k])*window.innerWidth/100)}
		}
		if(typeof size[k] == "number") all += size[k];
	}
	// --- если все розмеры одинаковые нечего не меняем
	round = pagination.round;
	if(all/c == size[key[0]] || round(s/c,4) == round(parseFloat(size[key[0]]),4)) return true;
	// --- дотягуем до 100 
	c = p.length;
	s = c > 0 ? (100-s)/c:0;
	b = p.concat();
	for(k in b){
		v = parseFloat(size[b[k]])+s;
		// --- проверка процента на минимальное значения
		if((v/100*width)-(all/c) < min){
			// --- записываем его значения для роспределения с другими
			o += v;
			// --- записываем минимальное значения
			v = min;
			// --- добавляем его до обших пикселей
			all += v;
			// --- убираем из списка процентов
			p.splice(p.indexOf(b[k]),1);
		}
		size[b[k]] = v;
	}
	// --- повторная проверка процентов
	c = p.length;
	s = c > 0 ? o/c:0;
	for(k in p){
		size[p[k]] = size[p[k]]+s;
		if(size[p[k]] > 100) size[p[k]] = 100;
	}
	// --- поиск розмера для линии
	v = 0;
	for(k in size){
		px = (size[k]/100*width);
		if(p.indexOf(k) == -1) v += size[k];
		else if(px - (all/c) > 0) v += px - (all/c);
		else v += min;
	}
	r["max"] = v;
	if(width < v) r["max"] = v+2; // --- 2px это бордер
	// --- если елемента с процентами нет находим найбольшее число и делаем с него проценты
	if(c == 0){
		v = 0;
		i = 0;
		for(k in size){
			 if(size[k] > v){ i = k; v = size[k]}
		}
		// --- конвертируем в проценты (просто указываем что это процент)
		all -= v;
		size[i] = 100;
		p.push(i);
		c = 1;
	}
	// --- записываем значения
	for(k in size){
		if(p.indexOf(k) == -1) r["size"][k] = size[k]+"px";
		else r["size"][k] = "calc("+size[k]+"% - "+(all/c)+"px)";
	}
	return r;
};
pagination.round = function(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
};
pagination.parse = function(el){
	if(el instanceof Node == false) return false;
	let r,i,j,w,td,obj,body,head,size;
	r = {label:false,size:false,list:false};
	body = el.children;
	head = null;
	// --- определяем правильный body
	if(el.localName == "table"){
		if(el.children.length == 0) return r;
		if(el.children[0].localName == "thead") head = el.children[0];
		if(el.children[0].localName == "tbody") body = el.children[0].children;
		else if(el.children[1].localName == "tbody") body = el.children[1].children;
	}
	// --- определяем head
	if(head != null){
		if(head.children[0] instanceof Node) head = head.children[0].children;
		if(typeof head.length != "undefined"){
			r.label = new Array;
			for(i=0;i<head.length;i++) r.label.push(head[i].textContent);
		}
	}
	// --- оброботка body
	
	if(body.length > 0){
		// --- поиск елементов
		r.list = new Array;
		for(i=0;i<body.length;i++){
			td = body[i].children;
			obj = new Array;
			for(j=0;j<td.length;j++) obj.push(td[j]);
			r.list.push(obj);
			// --- фишка для быстрого определения розмера (связано с розмером)
			if(i>0) body[i].style.display = "none";
		}
		// --- определения розмеров
		w = body[0].offsetWidth;
		r.size = new Array;
		td = body[0].children;
		for(i = 0; i < td.length; i++){
			size = false;
			if(td[i].hasAttribute("width")) size = td[i].getAttribute("width");
			if(td[i].style.width != "") size = td[i].style.width;
			if(size == false){
				size = window.getComputedStyle(td[i]);
				if(size.boxSizing == "border-box") size = size.width;
				else size = parseFloat(size.width)+parseFloat(size.paddingLeft)+parseFloat(size.paddingRight)+"px";
				// --- конвертируем в проценты (желательно конвертировать)
				size = (parseInt(size)/w*100)+"%";
			} 
			r.size.push(size);
		}
	}

	return r;
};
pagination.select = function(callback){
	let sample = pagination.create("section",pagination.key.select);
	sample.head = pagination.create("p");
	sample.body = pagination.create("div");
	sample.open = function(){
		this.classList.add("open");
	};
	sample.close = function(){
		this.classList.remove("open");
	};
	sample.callback = typeof callback == "function" ? callback : function(){};
	sample.select = function(key,value){
		this.head.innerText = value;
		this.callback(key);
	};
	sample.update = function(data,view,n){
		if(typeof data != "object") return false;
		let div,k;
		div = this.body;
		div.innerHTML = "";
		for(k in data){
			div.appendChild(pagination.create("p",0,{"key":(n===true?data[k]:k)},data[k],function(){
				this.parentNode.parentNode.select(this.getAttribute("key"),this.innerText);
			}));
		}
		
		if(typeof data[view] != "undefined") view = data[view];

		this.head.innerText = view;
		return true;
	};
	return pagination.create(sample,0,0,[sample.head,sample.body]);
}
pagination.template = function(r,k,v,i){
	if(typeof r != "string") return r;
	if(typeof k == "string") r.replace(k, v);
	if(typeof(k)=="object"){
		for(i in k) r = r.replace("{"+i+"}", (k[i] instanceof Node)?k[i].textContent:k[i]);
	}
	return r;
};
pagination.create = function(e,n,t,f,i,o){
	var r,s;if("string"!=typeof e&&e instanceof Node==!1)return!1;if("string"==typeof e&&(e=document.createElement(e)),"string"==typeof n&&(e.className=n),"object"==typeof t)for(r=0,s=Object.keys(t);r<s.length;r++)e.setAttribute(s[r],t[s[r]]);if(void 0!==f&&null!=f){if("function"==typeof f&&(f=f()),-1!=["string","number"].indexOf(typeof f))"INPUT"==e.nodeName?e.value=f:e.innerHTML=f;else if(f instanceof Node)e.appendChild(f);else if("object"==typeof f)for(r=0,s=Object.keys(f);r<s.length;r++)"function"==typeof f[s[r]]&&(f[s[r]]=f[s[r]]()),-1!=["string","number"].indexOf(typeof f[s[r]])?e.innerHTML+=f[s[r]]:f[s[r]]instanceof Node&&e.appendChild(f[s[r]])}if("function"==typeof i)e.onclick=i;else if("object"==typeof i)for(r=0,s=Object.keys(i);r<s.length;r++)e[s[r]]=i[s[r]];return"function"==typeof o&&o(e),e
};
pagination.key = {
	"sample": "pagination",
	"demand": "pagination-demand",
	"info": "pagination-info",
	"head": "pagination-head",
	"search": "pagination-search",
	"view": "pagination-view",
	"content": "pagination-content",
	"footer": "pagination-footer",
	"group": "pagination-group-btn",
	"btn": "pagination-btn",
	"item": "pagination-item",
	"line": "pagination-line",
	"sort": "pagination-sort",
	"key": "pagination-key",
	"id": "pagination-id",
	"select": "pagination-select"
};
pagination.icon = {
	prev: '<svg viewBox="0 0 9 14" ><polygon points="0.387,6.999 6.82,13.436 8.384,11.871 3.515,6.999 8.384,2.127 6.82,0.563"/></svg>',
	next: '<svg viewBox="0 0 9 14" ><polygon points="1.951,0.563 0.387,2.127 5.257,6.999 0.387,11.871 1.951,13.436 8.385,6.999"/></svg>',
	search: '<svg viewBox="0 0 9.8 9.8" ><path d="M6,6C5.5,6.5,4.9,6.8,4.1,6.8S2.8,6.5,2.3,6S1.5,4.9,1.5,4.1s0.3-1.3,0.8-1.9s1.1-0.8,1.9-0.8S5.5,1.8,6,2.3 s0.8,1.1,0.8,1.9S6.5,5.5,6,6z M9.6,8.5l-2-2C8,5.8,8.3,5,8.3,4.1C8.3,3.6,8.2,3,8,2.5C7.7,2,7.5,1.6,7.1,1.2S6.3,0.5,5.8,0.3 S4.7,0,4.1,0S3,0.1,2.5,0.3s-1,0.5-1.3,0.9S0.5,2,0.3,2.5S0,3.6,0,4.1s0.1,1.1,0.3,1.6s0.5,1,0.9,1.3S2,7.7,2.5,8 c0.5,0.2,1,0.3,1.6,0.3C5,8.3,5.8,8,6.5,7.6l2,2C8.7,9.7,8.8,9.8,9,9.8c0.2,0,0.4-0.1,0.5-0.2C9.7,9.4,9.8,9.3,9.8,9 C9.8,8.8,9.7,8.7,9.6,8.5z"/></svg>',
	desc: '<svg viewBox="0 0 19.6 11" ><path d="M19.2,0.4C19,0.1,18.7,0,18.3,0H1.2C0.9,0,0.6,0.1,0.4,0.4S0,0.9,0,1.2s0.1,0.6,0.4,0.9l8.6,8.6 C9.2,10.9,9.4,11,9.8,11s0.6-0.1,0.9-0.4l8.6-8.6c0.2-0.2,0.4-0.5,0.4-0.9S19.4,0.6,19.2,0.4z"/></svg>',
	asc: '<svg viewBox="0 0 19.6 11" ><path d="M19.6,9.8c0-0.3-0.1-0.6-0.4-0.9l-8.6-8.6C10.4,0.1,10.1,0,9.8,0S9.2,0.1,8.9,0.4L0.4,8.9 C0.1,9.2,0,9.4,0,9.8s0.1,0.6,0.4,0.9C0.6,10.9,0.9,11,1.2,11h17.1c0.3,0,0.6-0.1,0.9-0.4C19.4,10.4,19.6,10.1,19.6,9.8z"/></svg>'
};
pagination.language = {
	"search": "Пошук:",
	"all": "Всі",
	"view": "Показать записи",
	"info": "Записи з {START} по {END} із {TOTAL}",
	"empty": "В таблиці відсутні данні",
	"zero": "Записи відсутні.",
	"prev": "Попередння",
	"next": "Наступна"
};