// --- app
var app = new Object();
app.body = document.body;
app.selected = null;
app.street = [];
app.verify = function(data){
	return verify({
		"key": "",
		"name": "",
		"street": "",
		"house": "",
		"number": 0,
		// ---
		"pension": 0,
		"over": 0,
		"subsidy": 0,
		"insurance": 0,
		"privilege": 0,
		// --- debt
		"debt-pension": 0,
		"debt-subsidy": 0,
		"debt-insurance": 0,
		"debt-privilege": 0,
		// ---
		"appointed": 0,
		"status": ""
	},data);
};
// --- ініціалізація
app.init = function(data){
	app.page.body = app.body;
	app.menu = app.menu();
	app.bar = app.bar();

	document.body.appendChild(app.menu);
	
	memory.load();
	app.load(memory.get("selected"));
	
	app.switch('home');
	
	// --- натиск на кнопки
	window.addEventListener('touchstart', function(e){
		let check = false,el = e.target;
		
		if(el instanceof Node == false) return false;
		
		if(["button"].indexOf(el.localName) != -1) check = true;
		else if(el.hasAttribute("press")) check = true;
		else if(el.classList.contains("btn")) check = true;
		else if(el.classList.contains("pagination-btn")) check = true;
		
		if(!check) return false;
	
		el.classList.add("press");
		clearInterval(el.touchpress);
		el.touchpress = setTimeout(function(e){
			e.classList.remove("press");
		},250,el);
	});

};
app.switch = function(name,option){
	let sample = app.page({
		"uniq": name,
		"name": name,
	});
	// ---
	app.menu.switch(name);
	// ---
	app.bar.hide(function(){
		if(typeof sample.bar != "undefined"){
			app.bar.content(sample.bar);
			app.bar.show();
		}
	});
	
	if(name == "home"){
		sample.update();
	}
	
	if(name == "select" && typeof option != "undefined"){
		sample.update(option);
	}
};
// --- завантаження данних
app.load = function(name){
	let k;
	if(["stanislav","myrolyubovka"].indexOf(name) == -1) return false;
	app.selected = name;
	database.load(app.selected);
	memory.set(app.selected,"selected");
	// --- Переключажмо всі данні
	for(k in app.page.ready){
		if(typeof app.page.ready[k]["update"] == "function"){
			app.page.ready[k]["update"]();
		}
	}
};
// --- поділитися файлом 
app.share = function(data,title){
	let obj,check,isFile = data instanceof File;
	
	if(typeof title != "string") title = "";
	if(!navigator.share) return false;
	
	obj = new Object();

	if(isFile){
		obj = {title: data.name,text: data.name,files: [data]}
	}else if(typeof data == "string" && data.indexOf("http") != -1){
		obj = {title: title,url: data}
	}else{
		obj = {title: title,text: data}
	}

	try {
		navigator.share(obj);
		check = true;
	} catch (err) {
		check = false;
		console.error('Помилка:', err);
	}
	
	return check;
};
// --- Меню
app.menu = function(){
	let sample;

	sample = create("nav");
	sample.item = function(name,title,icon,handler){
		return create("a","item",{"name":name},{
			0: icon != null ? create("i",icon): icon,
			1: create("span",0,0,title)
		},handler);
	};
	sample.switch = function(name){
		[].forEach.call(this.querySelectorAll('.active'),function(a){
			a.classList.remove("active");
		});
		if(typeof this.btn[name] != "undefined") this.btn[name].classList.add("active");
	};
	sample.more = function(){
		let view = ux.view(create("div","datatable-option",0,{
			0: create("a","",{"press":"on"},[create("font","fa-download"),create("p",0,0,app.lang("Імпортувати"))],function(){
				create("input",0,{"type":"file","accept":"application/json"},"",{
					"onchange": function(e){
						if(this.files.length === 1) app.import(this.files[0]);
					}
				}).click();
				view.close();
			}),
			1: create("a","",{"press":"on"},[create("font","fa-upload"),create("p",0,0,app.lang("Експортувати"))],function(){
				app.export();
				view.close();
			}),
			2: create("a","",{"press":"on"},[create("font","fa-trash-o"),create("p",0,0,app.lang("Очистити"))],function(){
				alert("info",app.lang("Очищення"),app.lang("- Назначений день, <br>- Статус"),function(){
					app.clear();
					view.close();
				},function(){
					
				})
			}),
			3: create("line"),
			4: create("a",(app.selected=="stanislav"?"active":""),{"press":"on"},[create("font","fa-database"),create("p",0,0,app.lang("Станіслав"))],function(){
				app.load("stanislav");
				view.close();
			}),
			5: create("a",(app.selected=="myrolyubovka"?"active":""),{"press":"on"},[create("font","fa-database"),create("p",0,0,app.lang("Миролюбівка"))],function(){
				app.load("myrolyubovka");
				view.close();
			}),
		}),{
			"parent": this.btn["more"],
			"position": "up",
			"arrow": true,
			"open": function(){
				overflow()
			},
			"close": function(){
				overflow(true)
			}
		});
		view.open();
	}
	sample.btn = {
		"more": sample.item("more",app.lang("Більше"),"fa-navicon",function(){
			sample.more();
		}),
		"home": sample.item("home",app.lang("Головна"),"fa-home",function(){
			app.switch("home");
		}),
		"clients": sample.item("clients",app.lang("Клієнти"),"fa-users",function(){
			app.switch("clients");
		}),
		"calculator": sample.item("calculator",app.lang("Калькулятор"),"fa-calculator",function(){
			app.switch("calculator");
		}),
		"select": sample.item("select",app.lang("Загально"),"fa-pie-chart",function(){
			app.switch("select");
		}),
	};
	
	create(sample,0,0,{
		0: sample.btn["more"],
		1: sample.btn["clients"],
		2: sample.btn["home"],
		3: sample.btn["calculator"],
		4: sample.btn["select"],
	});
	
	return sample;
};
// --- Бар
app.bar = function(){
	let sample;

	sample = create("bar");
	sample.content = function(el){
		this.innerHTML = "";
		create(this,0,0,el);
	};
	sample.show = function(handler){
		document.body.appendChild(this);
		setTimeout(function(){
			document.documentElement.classList.add("bar-show");
			setTimeout(function(){
				if(typeof handler == "function"){
					handler();
				}
			},200);
		},50);
	}
	sample.hide = function(handler){
		document.documentElement.classList.remove("bar-show");
		setTimeout(function(el){
			if(el.parentNode != null){
				el.parentNode.removeChild(el);
			}
			if(typeof handler == "function"){
				handler();
			}
		},200,this);
	}
	
	return sample;
};
// --- Сторінки
app.page = function(param){
	let sample;
	
	if(typeof this.page.ready != "object"){
		this.page.ready = new Object();
	}

	// --- Поверає сторінку по назві
	if(typeof param == "string"){
		if(this.page.ready[param] instanceof Node){
			return this.page.ready[param];
		}
		return null;
	}

	param = verify({
		"window": null, // --- null, modal, arrow, window, true
		"uniq": null,
		"name": null,
		"theme": "",
		"label": "",
		"option": null,
		"content": null,
		// --- arrow
		"parent": null,
		"position": "right",
		"body": null,
		// --- window
		"backdrop": false,
		"width" : null,
		"height" : null,
		"resized" : false,
		"button" : {
			"reload" : false,
			"hide" : true,
			"full" : true,
			"close" : true,
		},
	},param);

	// --- Проверка
	if(typeof this.page[param.name] == "undefined" && param.content == null) return false;
	// --- Проверка наличия
	if(typeof param.uniq == "string" && typeof this.page.ready[param.uniq] != "undefined"){
		sample = this.page.ready[param.uniq];
		if(["modal","window","arrow",true].indexOf(param.window) != -1){
			sample.focus();
			if(typeof sample.hide == "function"){
				if(sample.hide() == true) sample.hide(false);
			}
			sample.open();
		}else if(param.window == null || param.window == false){
			if(this.page.body.current instanceof Node){
				if(typeof this.page.body.current._close == "function"){
					this.page.body.current._close();
				}
				this.page.body.removeChild(this.page.body.current);
			}
			this.page.body.active = param.name;
			this.page.body.current = sample;
			this.page.body.appendChild(sample);
			if(typeof this.page.body.current._open == "function"){
				this.page.body.current._open();
			}
		}
		// ---
		return sample;
	}
	// --- Содания оболочки
	if(param.window == "modal"){
		sample = ux.modal({
			"theme": param.theme,
			"open": function(){
				if(typeof param.content._open == "function"){
					param.content._open();
				}
			},
			"close": function(){
				if(typeof param.content._close == "function"){
					param.content._close();
				}
			}
		});
	}
	else if(param.window == "arrow"){
		sample = ux.view(sample,{
			"theme": param.theme,
			"parent": param.parent,
			"position": param.position,
			"body": param.body,
			"arrow": true,
			"open": function(){
				if(typeof param.content._open == "function"){
					param.content._open();
				}
			},
			"close": function(){
				if(typeof param.content._close == "function"){
					param.content._close();
				}
			}
		});
	}
	else if(param.window == "window" || param.window == true){
		sample = windows({
			"label" : param.label,
			"theme" : param.theme,
			"width" : param.width,
			"height" : param.height,
			"resized" : param.resized,
			"backdrop" : param.backdrop,
			"button" : param.button,
			"open": function(){
				if(typeof param.content._open == "function"){
					param.content._open();
				}
			},
			"close": function(){
				// --- Удаляем с памяти
				if(typeof param.uniq == "string" && typeof app.page.ready[param.uniq] != "undefined"){
					delete(app.page.ready[param.uniq]);
				}
				// ---
				if(typeof param.content._close == "function"){
					param.content._close();
				}
			}
		})
	}
	// --- Создания контента
	if(param.content == null) param.content = this.page[param.name](param.option,sample);
	// --- Вставка контента
	if(param.window == "modal") sample.content(param.content);
	else if(param.window == "arrow") sample.content(param.content);
	else if(param.window == "window" || param.window == true) sample.content(param.content);
	else sample = param.content;
	// --- Назначення події
	if(typeof sample._open == "function"){
		// --- назначить при відкриті
	}
	if(typeof sample._close == "function"){
		// --- назначить при закриті
	}
	// --- Открытия контента
	if(["modal","window","arrow",true].indexOf(param.window) != -1){
		sample.open();
	}else if(param.window == null || param.window == false){
		if(this.page.body.current instanceof Node){
			if(typeof this.page.body.current._close == "function"){
				this.page.body.current._close();
			}
			this.page.body.removeChild(this.page.body.current);
		}
		this.page.body.active = param.name;
		this.page.body.current = sample;
		this.page.body.appendChild(sample);
		if(typeof this.page.body.current._open == "function"){
			this.page.body.current._open();
		}
	}
	// --- Вызываем инициазиданию после показа 
	if(typeof sample._build == "function") sample._build();
	// --- Запоминаем уникальность
	if(typeof param.uniq == "string"){
		this.page.ready[param.uniq] = sample;
	}
	// --- Возврашаем екземпляр
	return sample;
};
// --- Мова
app.lang = function(key,rep){
	if(typeof this.lang.db == "undefined") this.lang.db = new Object();
	key = typeof this.lang.db[key] != "undefined" ? this.lang.db[key] : key;
	if(typeof rep == "string" || typeof rep == "number"){
		key = key.replace("{@}",rep);
	}else if(rep instanceof Object){
		for(let k in rep){
			key = key.replace("{"+k+"}",rep[k]);
		}
	}
	return key;
};
// ---
app.clipboard = function(value,bool){
	let input = document.createElement('textarea');
	input.value = value; 
	document.body.appendChild(input);
	input.select();
	document.execCommand('copy');
	document.body.removeChild(input);
	
	if(bool == true){
		alert.push("comp",app.lang("copied"));
	}
	return true;
};
// --- UX
app.ux = function(name,option){
	if(typeof this.ux[name] != "undefined") return  this.ux[name](option);
	return null;
};
app.ux.search = function(option){
	let sample;
	
	option = verify({
		"handler": null,
		"select": null,
		"find": null,
		"theme": "",
		"placeholder": app.lang("Пошук")
	},option);
	
	sample = create("form","search",0,{
		0: create("input",0,{"type":"text","name":"text","placeholder":option["placeholder"]},""),
		1: create("a","btn fa-search",0,"",function(){
			if(this.classList.contains("clear")) sample.clear();
			else sample.search();
		}),
	},{
		"onsubmit": function(e){
			e.preventDefault();
			this.handler(this.elements.text.value);
		},
		"oninput": function(){
			let btn,value = this.elements.text.value;

			if(value != "") btn = "btn clear fa-remove";
			else btn = "btn fa-search";

			if(this.children[1].className != btn) this.children[1].className = btn;
			
			this.find.search(value);
			this.handler(value);
		}
	});
	sample.search = function(){
		this.handler(this.elements.text.value);
	};
	sample.clear = function(){
		this.elements.text.value = "";
		this.children[1].className = "btn fa-search";
	};
	sample.handler = typeof option.handler == "function" ? option.handler : function(){};
	sample.select = typeof option.select == "function" ? option.select : function(){};
	sample.find = this.find({
		"data": option.find,
		"theme": option.theme,
		"parent": sample,
		"select": function(key){
			sample.select(key);
		}
	});

	return sample;
};
app.ux.find = function(option){
	let sample;
	
	option = verify({
		"select": "function",
		"data": null,
		"parent": null,
		"theme": ""
	},option);
	
	sample = create("div","find");
	sample.list = new Object();
	sample.select = option.select;
	sample.search = function(value){
		let k,list,max = 5;
		value = value.toLocaleLowerCase();
		list = document.createDocumentFragment();
		for(k in this.list){
			if(this.list[k].text.indexOf(value) == -1) continue;
			list.appendChild(this.list[k]);
			max--;
			if(max <= 0) break;
		}
		
		this.innerHTML = "";
		this.appendChild(list);

		if(this.children.length > 0) this.view.open();
		else this.view.close(); 
	};
	sample.update = function(data){
		let k,item;
		if(typeof option.data != "object") return;
		this.list = new Object();
		for(k in data){
			item = create("div","item",0,data[k],function(){
				sample.select(this.key,this);
				sample.view.close();
			});
			item.key = k;
			item.text = item.textContent.toLocaleLowerCase();
			this.list[k] = item;
		}
	};
	sample.view = ux.view(sample,{
		"theme": option.theme,
		"parent": option.parent,
		"position": "up",
		"arrow": true
	});
	
	
	sample.update(option.data);

	return sample;
};
// --- карточка
app.card = function(data,type){
	let item = create("div","panel card",0,{
		0: create("span","street"),
		1: create("span","name"),
		2: create("div","group"),
		3: create("span","suma"),		
	});
	item.data = null;
	item.info = function(){
		app.page.info(this.data);
	};
	item.update = function(data){
		let i,group,total;
		total = 0;

		data = app.verify(typeof data != "undefined" ? data : this.data);
		
		this.data = data;
		
		group = document.createDocumentFragment();
		["pension","over","subsidy","insurance","privilege"].forEach(function(k){
			if(data[k] > 0){
				total += data[k];
				group.appendChild(create("span","plug",{"type":k},round(data[k],2)));
			}
		});
		["debt-pension","debt-subsidy","debt-insurance","debt-privilege"].forEach(function(k){
			if(data[k] > 0){
				total += data[k];
				group.appendChild(create("span","plug",{"type":k,"debt":"on"},round(data[k],2)));
			}
		});

		this.setAttribute("status",data.status);

		this.children[0].innerHTML = data.street+" <b>"+data.house+"</b>",
		this.children[1].innerText = data.name,
		
		this.children[2].innerHTML = "";
		this.children[2].appendChild(group);
		
		this.children[3].innerHTML = round(total,2)+" ₴"

	};

	item.update(data);

	return item;
};
app.card.info = function(data){
	let hide,key,debt,total = 0;
	
	data = app.verify(data);
	debt = [create("p","label",0,app.lang("debt"))];
	
	["pension","over","subsidy","insurance","privilege"].forEach(function(k){
		key = k;
		if(typeof data[k] == "number" && isNaN(data[k]) == false) total += data[k];
		// --- debt
		k = "debt-"+k;
		if(typeof data[k] == "number" && isNaN(data[k]) == false && data[k] > 0){
			total += data[k];
			debt.push(create("div",0,0,[create("p",0,0,app.lang(key)),create("span",0,0,NumberToText(data[k])+" ₴")]));
		}
	});

	data.pension = NumberToText(data.pension)+" ₴";
	data.over = NumberToText(data.over)+" ₴";
	data.subsidy = NumberToText(data.subsidy)+" ₴";
	data.insurance = NumberToText(data.insurance)+" ₴";
	data.privilege = NumberToText(data.privilege)+" ₴";

	data.total = NumberToText(round(total,2))+" ₴";
	
	hide = debt.length == 0;
	
	return create("div","card-info",0,create("section",0,0,{
		0: create("span","street",0,data.street+" <b>"+data.house+"</b>"),
		1: create("span","name",0,data.name),
		2: create("div","group",0,{
			0: create("div",0,0,[create("p",0,0,app.lang("pension")),create("span",0,0,data.pension)]),
			1: create("div",0,0,[create("p",0,0,app.lang("privilege")),create("span",0,0,data.privilege)]),
			2: create("div",0,0,[create("p",0,0,app.lang("over")),create("span",0,0,data.over)]),
			3: create("div",0,0,[create("p",0,0,app.lang("subsidy")),create("span",0,0,data.subsidy)]),
			4: create("div",0,0,[create("p",0,0,app.lang("insurance")),create("span",0,0,data.insurance)]),
		}),
		3: create("div","group",{"hide":(hide?"no":"on")},debt),
		4: create("span","total",0,data.total),		
	}));
};
// --- очистка
app.clear = function(){
	let k;
	for(k in database.table["client"]){
		database.table["client"][k]["status"] = "";
		database.table["client"][k]["appointed"] = 0;
		database.table["client"][k]["debt-pension"] = 0;
		database.table["client"][k]["debt-subsidy"] = 0;
		database.table["client"][k]["debt-insurance"] = 0;
		database.table["client"][k]["debt-privilege"] = 0;
	}
	database.save();
};
// --- імпорт данних
app.import = function(file){
	database.import(file);
	database.save();
	alert.push("comp",app.lang("Імпортовано"));
};
// --- експорт данних
app.export = function(){
	database.export();
	alert.push("comp",app.lang("Експортовано"));
};
// --- сторінки
app.page.home = function(){
	let i,day,sample;
	
	day = new Date().getDate();
	
	sample = create("div","page-home");
	sample.days = create("div","page-days",0,"",function(e){
		sample.day = e.target.innerText;
		sample.update();
		this.closest(".ux-view").close();
	});
	sample.bar = create("div","bar-home",0,{
		0: create("a","btn fa-map-marker",0,"",function(){
			sample.day = day;
			sample.update();
		}),
		1: create("a","btn day fa-calendar",{"day":day},"",function(){
			ux.view(sample.days,{
				"parent": this,
				"arrow": true
			}).open();
		}),
		2: create("a","btn print fa-print",0,"",function(){
			sample.print();
		}),
		3: create("a","btn select fa-pie-chart",0,"",{
			"ontouchstart": function(){
				let btn = this;
				btn.select = "paid";
				this.long = setTimeout(function(){
					btn.select = true;
					if(navigator.vibrate){
					    navigator.vibrate(100);
					}
				},500);
			},
			"ontouchend": function(){
				clearTimeout(this.long);
				sample.select(this.select);
			},
			"onclick": function(){
				//sample.select(this.select);
			}
		})
	});
	sample.day = day;
	sample.item = function(data){
		let item = app.card(data);
		item.setAttribute("key",item.data.key);
		item.appendChild(create("a","btn check fa-check",0,"",function(e){
			item.comp();
			e.preventDefault();
			e.stopPropagation();
		}));
		item.onclick = function(){
			this.info();
		}
		item.comp = function(){
			this.data.status = "paid";
			database.update({
				"key": this.data.key,
				"status": this.data.status,
			},"client");
			database.save();

			this.update();
		}
		return item;
	};
	sample.print = function(){
		let list = [];
		[].forEach.call(this.querySelectorAll(".card"),function(a){
			list.push(a.data.key);
		});
		app.page.print(list);
	};
	sample.select = function(status){
		let list = [];
		[].forEach.call(this.querySelectorAll(".card"),function(a){
			if(status == true || a.data.status == status){
				list.push(a.data.key);
			}
		});
		app.switch("select",list);
	};
	sample.update = function(){
		this.bar.children[1].setAttribute("day",this.day);
		
		let k,where,data;
		
		where = {
			"number": this.day
		};
		
		if(app.selected == "stanislav"){
			where = {
				"appointed": this.day
			};
		}
		

		data = database.select(where,"client");
		this.innerHTML = "";
		for(k in data){
			this.appendChild(this.item(data[k]));
		}
	};

	//sample.update();
	
	for(i = 1; i < 32; i++){
		sample.days.appendChild(create("a",0,{"press":"on"},i));
	}
	sample.days.appendChild(create("a",0,0,""));
	
	return sample;
};
app.page.clients = function(){
	let sample;
	
	sample = create("div","page-clients");
	sample.bar = create("div","bar-clients",0,{
		0: create("a","btn add fa-plus",0,"",function(){
			app.page.client(null,function(data){
				sample.table.add(sample.item(data));
				sample.table.search();
				this.closest(".ux-modal").close();
			});
		}),
		1: create("a","btn print fa-print",0,"",function(){
			sample.print();
		}),
		2: create("form","search",0,{
			0: create("input",0,{"type":"text","name":"text","placeholder":app.lang("Пошук")},""),
			1: create("a","btn fa-search",0,"",function(){
				sample.table.search(this.parentNode.elements.text.value);
			}),
		},{
			"onsubmit": function(e){
				e.preventDefault();
				sample.table.search(this.elements.text.value);
			},
			"oninput": function(){
				sample.table.search(this.elements.text.value);
				// ---
				if(typeof this.timeout != "undefined"){
					clearTimeout(this.timeout);
				}
				this.timeout = setTimeout(function(){
					// --- Повераємо сторінку до верху
					document.documentElement.scrollTop = 0;
				},100);
			}
		}),
	});
	sample.table = new pagination(create("div",""),{
		search : false,
		view: 15,
		style: "castom",
		btn: 5
	});
	sample.print = function(){
		let k,list = [];
		data = database.select({},"client");
		for(k in data){
			list.push(data[k]["key"]);
			
		}
		app.page.print(list);
	};
	sample.item = function(data){
		let item = app.card(data);
		
		item.classList.add("item");
		item.appendChild(create("a","btn option fa-ellipsis-v",0,"",function(e){
			item.option();
			e.preventDefault();
			e.stopPropagation();
		}));

		item.onclick = function(){
			this.edit();
		}
		item.option = function(parent){
			let list = create("div","datatable-option",0,{
				0: create("a","",{"press":"on"},[create("font","fa-eye"),create("p",0,0,app.lang("Переглянути"))],function(){
					item.info();
				}),
				1: create("a","",{"press":"on"},[create("font","fa-pencil"),create("p",0,0,app.lang("Редагувати"))],function(){
					item.edit();
				}),
				2: create("a","",{"press":"on"},[create("font","fa-remove"),create("p",0,0,app.lang("Видалити"))],function(){
					item.del();
				}),
			});
			
			ux.view(list,{
				"parent": this.querySelector(".option"),
				"arrow": true
			}).open();
		};
		item.info = function(){
			app.page.info(this.data);
		};
		item.edit = function(){
			app.page.client(this.data,function(data,el){
				item.update(data);
				this.closest(".ux-modal").close();
			});
		};
		item.del = function(){
			alert("caution",app.lang("Видалити?"),"",function(){
				database.del(item.data.key,"client");
				database.save();
				alert.push("comp",app.lang("Видалено"));
				if(item.parentNode != null){
					item.parentNode.removeChild(item);
				}
			},function(){
				
			});
		};

		return item;
	};
	sample.update = function(){
		let k,data = new Object();
		this.table.clear();
		
		data = database.select({},"client");

		for(k in data){
			this.table.add(this.item(data[k]),k);
		}
		this.table.search();
	};
	
	sample.appendChild(sample.table);

	sample.update();
	
	return sample;
};
app.page.calculator = function(){
	let sample;
	
	sample = create("div","page-calculator");
	sample.result = create("div","result")
	sample.total = create("div","total",0,{
		0: create("p"),
		1: create("span")
	});
	sample.select = create("div","select",0,create("section",0,0,{
		1: create("button","general fa-info",0,"",function(){sample.info()}),
		2: create("button",0,0,app.lang("pension"),function(){sample.switch("pension")}),
		3: create("button",0,0,app.lang("privilege"),function(){sample.switch("privilege")}),
		4: create("button",0,0,app.lang("over"),function(){sample.switch("over")}),
		5: create("button",0,0,app.lang("subsidy"),function(){sample.switch("subsidy")}),
		6: create("button",0,0,app.lang("insurance"),function(){sample.switch("insurance")}),
		7: create("button",0,0,app.lang("tovar"),function(){sample.switch("tovar")}),
		8: create("button",0,0,app.lang("other"),function(){sample.switch("other")}),
	}));
	sample.numpad = create("div","numpad",0,[
		create("a",0,{"press":"on"},"7"),
		create("a",0,{"press":"on"},"8"),
		create("a",0,{"press":"on"},"9"),
		create("a",0,{"press":"on"},"c",{
			"ontouchstart": function(){
				this.long = setTimeout(function(){
					alert("info",app.lang("Очистити"),function(){
						sample.data[sample.key] = new Object();
						sample.switch(sample.key);
					},function(){})
				},500);
			},
			"ontouchend": function(){
				clearTimeout(this.long);
			},
		}),
		create("a",0,{"press":"on"},"4"),
		create("a",0,{"press":"on"},"5"),
		create("a",0,{"press":"on"},"6"),
		create("a",0,{"press":"on"},"x2"),
		create("a",0,{"press":"on"},"1"),
		create("a",0,{"press":"on"},"2"),
		create("a",0,{"press":"on"},"3"),
		create("a",0,{"press":"on"},"x3"),
		create("a",0,{"press":"on"},"0"),
		create("a",0,{"press":"on"},","),
		create("a",0,{"press":"on"},"+"),
		create("a",0,{"press":"on"},"-"),
	],function(e){
		sample.action(e.target.innerText);
	});
	sample.data = {
		"pension": {},
		"over": {},
		"subsidy": {},
		"privilege": {},
		"insurance": {},
		"tovar": {},
		"other": {},
	};
	sample.key = null;
	sample.current = null;
	sample.calc = function(){
		let k,val,total = 0,count = 0;
		for(k in this.data[this.key]){
			val = toFloat(this.data[this.key][k])
			total += val;
			count++;
		}
		// ---
		this.total.setAttribute("count",count);
		this.total.children[1].innerText = NumberToText(round(total,2))+" ₴";
		// --- Запоминаємо глобально результат
		memory.set(Object.assign({},this.data),"calculator",app.selected);
	};
	sample.scroll = function(){
		this.result.scrollTop = this.result.scrollHeight;
	}
	sample.action = function(code){
		let type,item,numb = parseInt(code);
		
		// --- 
		/*
		if(navigator.vibrate) {
		    navigator.vibrate(50);
		}
		*/
		
		item = this.current;
		
		if(!isNaN(numb)){
			if(item == null){
				item = this.item("");
				this.result.appendChild(item);
				this.scroll();
			}
			item.add(code);
		}else if(code == "+"){
			item = this.item("");
			this.result.appendChild(item);
			this.scroll();
		}else if(code == "-"){
			item = this.item("-");
			this.result.appendChild(item);
			this.scroll();
		}else if(item instanceof Node){
			if(code == "c"){
				item.del();
			}else if(code == ","){
				item.add(",");
			}else if(code == "x2"){
				item.set(item.value.replace(",",".")*2);
			}else if(code == "x3"){
				item.set(item.value.replace(",",".")*3);
			}
		}

		// ---
		if(this.current instanceof Node){
			this.current.classList.remove("active");
		}
		this.current = item;
		if(this.current instanceof Node){
			this.current.classList.add("active");
		}
		
	};
	sample.item = function(value,key){
		let item,minus;
		
		if(typeof key == "undefined"){
			key = new Date().getTime();
		}

		value += "";
		minus = value.indexOf("-") != -1;
		value = value.replace("-","");
		
		item = create("div","item",{"minus":minus?"on":"no"},{
			0: create("span",0,0,value),
			1: create("a","del fa-remove",0,"",function(){
				item.delete();
			})
		},function(e){
			if(e.target.localName == "a") return;
			
			if(sample.current instanceof Node){
				sample.current.classList.remove("active");
			}
			sample.current = this;
			sample.current.classList.add("active");
		});
		item.key = key;
		item.minus = minus;
		item.value = value;
		item.add = function(value){
			value = this.value+""+value;
			this.set(value);
		};
		item.del = function(){
			value = this.value+"";
			value = value.slice(0,value.length-1);
			this.set(value);
		};
		item.delete = function(){
			if(this.parentNode != null) this.parentNode.removeChild(this);
			delete(sample["data"][sample.key][this.key]);
			sample.calc();
		};
		item.set = function(value){
			value = value+"";
			value = value.replace(".",",");
			this.children[0].innerText = NumberToText(value);
			// ---
			this.value = value;
			// --- зміна значення в базі
			value = this.minus ? "-"+value : value;
			sample["data"][sample.key][this.key] = value;
			sample.calc();
		}

		return item;
	};
	sample.switch = function(key){
		let k,total = 0,label = "";
		
		label = app.lang(key);

		// ---
		this.result.innerHTML = "";
		for(k in this.data[key]){
			this.result.appendChild(this.item(this.data[key][k],k));
		}
		this.scroll();
		// --- 
		this.key = key;
		this.current = this.result.querySelector(".item:last-child");
		if(this.current instanceof Node){
			this.current.classList.remove("active");
		}

		this.total.children[0].innerText = label;
		
		this.calc();
	}
	sample.clear = function(){
		let k;
		for(k in this.data){
			this.data[k] = new Object();
		}
	};
	sample.update = function(){
		let k,data;
		this.clear();

		data = memory.get("calculator",app.selected);
		if(data != null){
			for(k in this.data){
				if(typeof data[k] != "undefined" && data[k] instanceof Object){
					this.data[k] = data[k];
				}
			}
		}

		this.switch("pension");
	};
	sample.info = function(){
		let k,key,item,list,val,total = 0;
		
		list = [];
		for(key in this.data){
			val = 0;
			for(k in this.data[key]){
				val += toFloat(this.data[key][k]);
			}
			total += val;
			// ---
			val = NumberToText(round(val,2))+" ₴";
			list.push(create("div",0,{"name":key},"<p>"+app.lang(key)+"</p><span>"+val+"</span>"));
		}

		total = NumberToText(round(total,2))+" ₴";
		ux.modal({"content":create("div","page-calculator-info",0,{
			0: create("div","result",0,list),
			1: create("span","total",0,total)
		}),"theme":"modal-auto"}).open();
	};
	
	create(sample,0,0,{
		0: sample.result,
		1: sample.total,
		2: sample.select,
		3: sample.numpad
	})
	
	sample.update();

	return sample;
};
app.page.select = function(){
	let sample;

	sample = create("div","page-select");
	sample.total =  create("div","total",0,[create("p",0,0,app.lang("Загально")),create("span")]),
	sample.body = create("section","");
	sample.result = create("div","result",0,{
		0: create("div",0,{"name":"pension"},[create("p",0,0,app.lang("pension")),create("span")]),
		1: create("div",0,{"name":"privilege"},[create("p",0,0,app.lang("privilege")),create("span")]),
		2: create("div",0,{"name":"over"},[create("p",0,0,app.lang("over")),create("span")]),
		3: create("div",0,{"name":"subsidy"},[create("p",0,0,app.lang("subsidy")),create("span")]),
		4: create("div",0,{"name":"insurance"},[create("p",0,0,app.lang("insurance")),create("span")]),
	});
	sample.bar = create("div","bar-select",0,{
		0: create("a","btn clear fa-trash",0,"",function(){
			sample.clear();
		})
	});
	sample.search = app.ux.search({
		"select": function(key){
			if(sample.list.indexOf(key) == -1){
				sample.list.push(key);
				sample.add(key);
			}
		},
		"clear": true,
		"find": null,
		"theme": "find-select",
		"placeholder": app.lang("Додати")
	});
	sample.list = [];
	sample.data = {
		"pension": 0,
		"privilege": 0,
		"over": 0,
		"subsidy": 0,
		"insurance": 0,
		"total": 0,
	};
	sample.item = function(data){
		let item = app.card(data);
		item.setAttribute("key",item.data.key);
		item.onclick = function(){this.info()};
		item.appendChild(create("a","btn del fa-remove",0,"",function(e){
			sample.del(item.data.key);
		}));
		return item;
	};
	sample.calc = function(){
		let item,i,val,debt,total,data,count = new Object();
		
		["pension","privilege","over","subsidy","insurance","total"].forEach(function(k){
			count[k] = 0;
			sample.data[k] = 0;
		});
		
		for(i = 0; i < this.list.length; i++){
			data = database.get(this.list[i],"client");
			if(typeof data == "undefined") continue;

			val = 0;
			total = 0;
			
			["pension","privilege","over","subsidy","insurance"].forEach(function(k){
				val = data[k]+"";
				val = val.replace(",",".");
				val = parseFloat(val);
				if(isNaN(val)) val = 0;
				// --- debt
				debt = data["debt-"+k];
				if(typeof debt != "undefined"){
					debt = debt+"";
					debt = debt.replace(",",".");
					debt = parseFloat(debt);
					if(isNaN(debt)) debt = 0;
					// ---
					val += debt;					
				}
				// ---
				total += val;
				sample.data[k] += val;
				if(val > 0) count[k]++;
			});
			
			count["total"]++;
			sample.data["total"] += total;
		}
		
		["pension","privilege","over","subsidy","insurance"].forEach(function(k){
			item = sample.result.querySelector('[name="'+k+'"]');
			if(item instanceof Node){
				item.setAttribute("count",count[k]);
				item.children[1].innerText = NumberToText(round(sample.data[k],2))+" ₴";
			}

		});
		
		this.total.setAttribute("count",count["total"]);
		this.total.children[1].innerText = NumberToText(round(this.data["total"],2))+" ₴";
	};
	sample.add = function(key){
		let data = database.get(key,"client");
		if(typeof data == "undefined") return false;
		this.body.appendChild(this.item(data));
		this.calc();
	};
	sample.del = function(key){
		let item = this.querySelector('.card[key="'+key+'"]');
		key = this.list.indexOf(key)
		if(key != -1){
			this.list.splice(key,1)
		}
		if(item instanceof Node){
			item.parentNode.removeChild(item);
		}
		this.calc();
	}
	sample.clear = function(){
		this.body.innerHTML = "";
		this.list = [];
		this.calc();
	};
	sample.update = function(list){
		let i;
		if(list instanceof Array == false) list = [];
		this.clear();
		this.updateFind();
		for(i = 0; i < list.length; i++){
			if(this.list.indexOf(list[i]) == -1){
				this.list.push(list[i]);
				this.add(list[i]);
			}
		}
		this.calc();
	};
	// ---
	sample.updateFind = function(){
		let k,data,list;
		data = database.select({},"client");
		list = new Object();
		for(k in data){
			list[k] = create("div",0,0,{
				0: create("span",0,0,data[k]["name"]),
				1: create("p",0,0,data[k]["street"]+" <b>"+data[k]["house"]+"</b>"),
			});
		}
		this.search.find.update(list);
	};
	
	create(sample,0,0,{
		0: sample.result,
		1: sample.total,
		2: sample.body
	});
	
	sample.bar.appendChild(sample.search);
	
	sample.update();
	
	return sample;
};
// ---
app.page.info = function(data){
	let name,sample;
	
	name = data.name;
	if(typeof name == "undefined") name = "card";
	
	sample = create("div","page-info",0,{
		0: app.card.info(data),
		9: create("button","save",0,app.lang("Поділитися"),function(){
			sample.send();
		})
	});
	sample.send = function(){
		html2canvas(this.children[0]).then( ( canvas ) => {
			canvas.toBlob(function(blob){
				sample.share(blob);
			},'image/png');
		});
	};
	sample.save = function(blob){
		saveAs(blob, name+".png");
	};
	sample.share = function(blob){
		if(app.share(new File([blob], name+".png", {type: 'image/png'})) == false){
			this.save(blob);
		}
	}
	
	ux.modal({"content":sample,"theme":"modal-auto"}).open();
};
app.page.print = function(list){
	let sample,name;
	if(list instanceof Array == false) list = [];
	
	if(list.length == 0){
		alert.push("info",app.lang("Друк"),app.lang("Список порожній"));
		return;
	}
	
	name = app.lang('Карточки');
	
	sample = create("div","page-print preloader",0,'<div><i class="fa-spin fa-spinner"></i></div>');
	sample.btn = create("button",0,0,app.lang("Поділития"),function(){
		sample.share();
		sample.close();
	});
	sample.block = create("div","page-print-block");
	sample.count = 0;
	sample.paint = function(list){
		let i,data,item,parent,check;
		parent = null;
		for(i = 0; i < list.length; i++){
			data = database.get(list[i],"client");
			if(typeof data == "undefined") continue;
			item = app.card.info(data);
			
			check = true;
			if(parent instanceof Node){
				parent.appendChild(item);
				check = !(parent.scrollHeight > parent.offsetHeight);
			}

			if(parent == null || check == false){
				parent = create("div","page-print-item");
				this.block.appendChild(parent);
			}
			parent.appendChild(item);
		}
		// ---
		this.count = this.block.children.length;
		for(i = 0; i < this.block.children.length; i++){
			html2canvas(this.block.children[i]).then(function(canvas){
				sample.page(canvas.toDataURL("image/png"));
			});
		}
	};
	sample.pdf = new window.jspdf.jsPDF({
		 orientation: 'portrait',
		 unit: 'mm',
		 format: 'a4',
		 compress: true
	});
	sample.page = function(img){
		let size;
		this.count--;
		
		size = this.pdf.internal.pageSize.getWidth();
		this.pdf.addImage(img, 'png', 0, 0, size, size * 1.414,undefined,'FAST');
		
		if(this.count > 0){
			this.pdf.addPage();
			return;
		}

		this.appendChild(this.btn);
	};
	sample.save = function(){
		this.pdf.save(name,{ compression: 'FAST' });
	};
	sample.share = function(){
		if(app.share(new File([this.pdf.output("blob")],name+".pdf",{type:'application/pdf'})) == false){
			this.save();
		}
	}
	sample.open = function(){
		document.body.appendChild(this);
		document.body.appendChild(this.block);
	};
	sample.close = function(){
		// --- Видалення
		if(this.parentNode != null){
			this.parentNode.removeChild(this);
		}
		if(this.block.parentNode != null){
			this.block.parentNode.removeChild(this.block);
		}
	};
	
	sample.open();
	
	setTimeout(function(){
		sample.paint(list);
	},300);
};
app.page.client = function(data,handler){
	let sample,street,i,add = data instanceof Object == false;
	
	data = app.verify(data);
	
	street = new Object();
	for(i = 0; i < app.street.length; i++){
		street[app.street[i]] = app.street[i];
	}
	
	if(add == true){
		data.key = database.key("client");
	}

	sample = create("form","client",0,{
		0: create("input",0,{"type":"hidden","name":"key"}),
		1: create("div","form-group",0,{
			0: create("p","label",0,app.lang("Призвище, Ім'я, По Батькові")),
			1: create("input",0,{"type":"text","name":"name"})
		}),
		2: create("div","form-group",0,{
			0: create("p","label",0,app.lang("Вулиця")),
			1: create("input",0,{"type":"text","name":"street"})
		}),
		3: create("div","form-group",0,{
			0: create("p","label",0,app.lang("Будинок")),
			1: create("input",0,{"type":"text","name":"house"})
		}),
		4: create("div","form-group",0,{
			0: create("p","label",0,app.lang("День пенсії")),
			1: create("input",0,{"type":"number","name":"number","step":1})
		}),
		5: create("div","group panel",0,{
			0: create("div","form-group",0,{
				0: create("p","label",0,app.lang("Пенсія")),
				1: create("input",0,{"type":"number","name":"pension","step":0.01})
			}),
			1: create("div","form-group",0,{
				0: create("p","label",0,app.lang("Доплата")),
				1: create("input",0,{"type":"number","name":"over","step":0.01})
			}),
			2: create("div","form-group",0,{
				0: create("p","label",0,app.lang("Пільга")),
				1: create("input",0,{"type":"number","name":"privilege","step":0.01})
			}),
			3: create("div","form-group",0,{
				0: create("p","label",0,app.lang("Субсидія")),
				1: create("input",0,{"type":"number","name":"subsidy","step":0.01})
			}),
			4: create("div","form-group",0,{
				0: create("p","label",0,app.lang("Страхова")),
				1: create("input",0,{"type":"number","name":"insurance","step":0.01})
			})
		}),
		6: create("div","group panel",0,{
			0: create("p","label",0,app.lang("Заборгованість")),
			1: create("div","form-group",0,{
				0: create("p","label",0,app.lang("Пенсія")),
				1: create("input",0,{"type":"number","name":"debt-pension","step":0.01})
			}),
			2: create("div","form-group",0,{
				0: create("p","label",0,app.lang("Пільга")),
				1: create("input",0,{"type":"number","name":"debt-privilege","step":0.01})
			}),
			3: create("div","form-group",0,{
				0: create("p","label",0,app.lang("Субсидія")),
				1: create("input",0,{"type":"number","name":"debt-subsidy","step":0.01})
			}),
			4: create("div","form-group",0,{
				0: create("p","label",0,app.lang("Страхова")),
				1: create("input",0,{"type":"number","name":"debt-insurance","step":0.01})
			})
		}),
		7: create("div","appointed panel",0,{
			0: create("p","label",0,app.lang("На який день призначено")),
			1: create("input",0,{"type":"number","name":"appointed"})
		}),
		8: create("div","status panel",0,{
			0: create("p","label",0,app.lang("Статус")),
			1: ux.switch({"type":"radio","value":"","name":"status","label":app.lang("Інше")}),
			2: ux.switch({"type":"radio","value":"missing","name":"status","label":app.lang("Відсутній")}),
			3: ux.switch({"type":"radio","value":"waiting","name":"status","label":app.lang("Очікує")}),
			4: ux.switch({"type":"radio","value":"paid","name":"status","label":app.lang("Виплачено")}),
		}),
		9: create("button","save",0,app.lang("Зберегти"))
	});
	sample.find = app.ux("find",{
		"data": street,
		"parent": sample.elements.street,
		//"theme": "absolute",
		"select": function(key){
			sample.elements.street.value = key;
		}
	});
	sample.save = function(){
		let data = fobject(this);
		
		delete(data[""]);
		
		["pension","over","subsidy","insurance","privilege","debt-pension","debt-subsidy","debt-insurance","debt-privilege","appointed","number","house"].forEach(function(k){
			data[k] = parseFloat(data[k]);
		});

		database.set(data,"client");
		database.save();

		if(typeof this.handler == "function"){
			this.handler(data);
		}
		
		// --- оновлення в find
		if(app.page.ready.select instanceof Node){
			app.page.ready.select.updateFind();
		}
	};
	sample.onsubmit = function(e){
		e.preventDefault();
		e.stopPropagation();
		
		this.save();

		return false;
	};
	sample.data = data;
	sample.handler = handler;

	fobject(sample,data);
	
	sample.elements.street.oninput = function(){
		sample.find.search(this.value);
	}

	ux.modal({"content":sample,"theme":"modal-auto"}).open();
};
