var create = function(e,c,a,d,o,f){
	if(typeof e != "string" && e instanceof Node == false) return false;var r,i,k;if(typeof e == "string") e = document.createElement(e);if(typeof c == "string") e.className = c;if(typeof a == "object"){k = Object.keys(a);for(i=0;i<k.length;i++) e.setAttribute(k[i],a[k[i]]); } if(typeof d != "undefined" && d != null){if(typeof d == "function") d = d();if(["string","number"].indexOf(typeof d) != -1){if(e.nodeName == "INPUT") e.value = d;else e.innerHTML = d;}else if(d instanceof Node){e.appendChild(d);}else if(typeof d == "object"){k = Object.keys(d);for(i=0;i<k.length;i++){if(typeof d[k[i]] == "function") d[k[i]] = d[k[i]]();if(["string","number"].indexOf(typeof d[k[i]]) != -1) e.innerHTML += d[k[i]];else if(d[k[i]] instanceof Node) e.appendChild(d[k[i]]);}}}if(typeof o == "function"){e.onclick = o;}else if(typeof o == "object"){k = Object.keys(o);for(i=0;i<k.length;i++){e[k[i]] = o[k[i]];}}if(typeof(f) == "function") f(e);return e;
}
var verify = function(a,b,r){
	var k,t,l = ["object","array","function","boolean","string"];
	if(typeof r != "object") r = new Object();
	if(a instanceof Object == false) a = new Object();
	if(b instanceof Object == false) b = new Object();
	for(k in a){
		t = l.indexOf(a[k]) != -1;
		if(typeof(b[k]) == "undefined" && !t){
			r[k] = a[k];
		}
		else if(a[k] instanceof Node){
			r[k] = b[k] instanceof Node ? b[k] : a[k];
		}
		else if(a[k] instanceof Array && b[k] instanceof Array){
			r[k] = verify(a[k],b[k],[]);
		}
		else if(a[k] instanceof Object && b[k] instanceof Object){
			r[k] = verify(a[k],b[k]);
		}
		else if(t && a[k] == l[0]){
			r[k] = b[k] instanceof Object ? b[k] : {};
		}
		else if(t && a[k] == l[1]){
			r[k] = b[k] instanceof Array ? b[k] : [];
		} 
		else if(t && a[k] == l[2]){
			r[k] = typeof b[k] == l[2] ? b[k] : function(){};
		}
		else if(t && a[k] == l[3]){
			r[k] = typeof b[k] == l[3] ? b[k] : false;
		} 
		else if(t && a[k] == l[4]){
			r[k] = typeof b[k] == l[4] ? b[k] : "";
		} 
		else{
			r[k] = b[k];
		}
	}
	return r;
};
var round = function(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
};
var NumberToText = function(value){
	let c,i,view;
	value += "";
	value = value.replace(".",",");
	value = value.split(",")

	view = ""
	c = 0;
	for(i = value[0].length-1; i >= 0; i--){
		c++;
		view = value[0][i]+view;
		if(c == 3){
			view = " "+view;
			c = 0;
		}
	}
	
	value[0] = view;
	
	return value.join(",");
};
var toFloat = function(val){
	val = val+"";
	val = val.replace(",",".");
	val = parseFloat(val);
	if(isNaN(val)) val = 0;
	return val;
}
var overflow = function(clear){
	let html,width;
	html = window.document.documentElement;
	width = window.innerWidth - document.body.offsetWidth;
	if(clear == true){
		html.style.paddingRight = "";
		html.style.overflow = "";
	}else{
		html.style.paddingRight = width+"px";
		html.style.overflow = "hidden";
	}
}

var fobject = function(forma,values){
	if(forma.localName != "form") return false;
	let is,elems,i,n,v,m,a;
	is = typeof(values) == "object"?'fill':"collect";
	elems = forma.elements;
	if(is == "collect"){
		values = new Object();
		for(i = 0; i < elems.length; i++){
			n = elems[i].name;
			v = elems[i].value;
			if(elems[i].type == "radio"){
				if(elems[i].checked) v = elems[i].value;
				else continue;
			}else if(elems[i].type == "checkbox"){
				v = elems[i].checked;
			}else if(elems[i].type == "range"){
				v = parseFloat(v);
			}
			values = fobject.collect(n,v,values);
		}
		return values;
	}
	if(is == "fill"){
		for(i = 0; i < elems.length; i++){
			n = elems[i].name;
			if(n.search(/\[\]/g) != -1) continue;
			m = n.split(".");
			n = m.splice(0, 1);
			n = n.toString();
			v = null;
			if(m.length == 0) v = values[n];
			else v = fobject.fill(values[n],m);
			if(typeof v == "undefined") continue;
			if(elems[i].type == "checkbox"){
				elems[i].checked = v;
			}else if(elems[i].type == "radio" && elems[i].value == v){
				elems[i].checked = true;
			}else if(elems[i].nodeName == "SELECT"){
				a = elems[i].querySelector('[value="'+v+'"]');
				if((a instanceof Node)) a.setAttribute("selected","true");
			}else if(elems[i].type != "radio" ){
				elems[i].value = v;
			}
		}
	}
	return true;
};
fobject.collect = function(n,v,o){
	let a;
	if(typeof(n) == "string") n = n.split(".");
	a = n.splice(0, 1);
	a = a.toString();
	
	if(n.length == 0){

		if(a.search(/\[\]/g) != -1){
			a = a.replace("[]","");
			if((o[a] instanceof Array) == false){
				o[a] = new Array;
			}
		}

		if((o instanceof Object) == true && (o[a] instanceof Array) == false) o[a] = v;
		else if(o[a] instanceof Array) o[a].push(v);
		
		return o;
	}else{
		if(typeof o[a] == "undefined") o[a] = new Object(null);
		o[a] = this.collect(n,v,o[a]);
		return o;
	}
};
fobject.fill = function(d,b){
	if(typeof d != "object") return null;
	let v,n;
	n = b.splice(0, 1);
	n = n.toString();

	if(typeof d == "undefined" || d == "") v = null;
	else if(b.length == 0) v = (typeof d[n] != "undefined" ? d[n] : null);
	else v = this.fill(d[n],b);

	return v;
};

var database = new Object();
database.name = "database";
database.table = new Object();
database.verify = function(data){
	return verify({
		"street": "object",
		"client": "object",
	},data);
};
database.key = function(table){
	let len,i,k,key,charset;

	len = 8;
	key = "";
	charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	for(i = 0; i < len; i++) {
		k = Math.floor(Math.random() * charset.length);
		key += charset[k];
	}

	// --- перевірка дубліката
	if(typeof this.table[table] != "undefined"){
		if(typeof this.table[table][key] != "undefined"){
			key = this.key(table);
		}
	}
	
	return key;
};
database.save = function(){
	localStorage.setItem(this.name, JSON.stringify(this.table));
	return true;
};
database.load = function(name){
	let data = localStorage.getItem(name);
	
	if(data != null) data = JSON.parse(data);

	data = this.verify(data);
	
	this.table = data;
	this.name = name;
};
database.get = function(key,table){
	if(typeof table != "string") table = "client";
	return this.table[table][key];
};
database.set = function(data,table){
	let key = data.key;
	if(typeof table != "string") table = "client";
	if(typeof key == "undefined") key = this.key(table);
	this.table[table][key] = data;
};
database.update = function(data,table){
	let key = data.key;
	if(typeof table != "string") table = "client";
	if(typeof key == "undefined") return false;
	for(k in data){
		this.table[table][key][k] = data[k];
	}
	return true;
};
database.del = function(key,table){
	if(typeof table != "string") table = "client";
	delete(this.table[table][key]);
};
database.select = function(data,table){
	let i,k,a,b,check,item,list = new Object();
	let type,value,key,field,map,where = [];
	if(typeof table != "string") table = "client";
	if(typeof this.table[table] == "undefined") return false;

	if(data instanceof Object == false) data = new Object();

	for(key in data) {
		if(!data.hasOwnProperty(key)) continue;

		type = "=";
		field = key;
		value = data[key];

		if(value instanceof Array == false) {
			if(typeof value["field"] != "undefined") field = value["field"];
			if(typeof value["value"] != "undefined") value = value["value"];
			if(typeof value["type"] != "undefined") type = value["type"];
		}

		if(type === "IN") {
			if(value instanceof Array == false) value = [value];
			map = {};
			for(i = 0; i < value.length; i++) {
				map[value[i]] = 1;
			}
			value = map;
		}

		where.push({
			field: field,
			value: value,
			type: type
		});
	}

	for(k in this.table[table]){
		check = true;
		item = this.table[table][k];
		for(i = 0; i < where.length; i++){
			a = item[where[i]["field"]];
			b = where[i]["value"];
			type = where[i]["type"];
			if(type == "="){
				check = a == b;
			}else if(type == "!="){
				check = a != b;
			}else if(type == "<>"){
				check = a != b;
			}else if(type == ">"){
				check = a > b;
			}else if(type == "<"){
				check = a < b;
			}else if(type == "IN"){
				check = typeof b[a] != "undefined";
			}else if(type == "LIKE"){
				// --- в розробці
			}
			
			if(check == false) break;
		}
		if(check == true){
			list[k] = Object.assign({},item);
		}
	}
	
	return list;
};
database.import = function(file){
	let reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function() {
		let data = JSON.parse(reader.result);
		database.table = database.verify(data);
	};
};
database.export = function(){
	let data = JSON.stringify(this.table);
	saveAs(new Blob([data],{type: "application/json;charset=utf-8"}), this.name+".json");
};

var memory = new Object();
memory.data = {
	"selected": "stanislav",
	"calculator": null
};
memory.save = function(){
	localStorage.setItem("memory", JSON.stringify(this.data));
	return true;
};
memory.load = function(){
	let data = localStorage.getItem("memory");
	if(data != null) data = JSON.parse(data);
	if(data instanceof Object){
		this.data = verify(this.data,data);
	}
};
memory.get = function(key,subkey){
	let data = this.data[key];
	if(typeof subkey != "undefined" && data instanceof Object){
		data = data[subkey];
	}
	return typeof data != "undefined" ? data : null;
};
memory.set = function(data,key,subkey){
	if(typeof key == "undefined") return false;
	if(typeof subkey != "undefined"){
		if(this.data[key] instanceof Object == false){
			this.data[key] = new Object();
		}
		this.data[key][subkey] = data;
	}else{
		this.data[key] = data;
	}
};

// ---
window.addEventListener('pagehide', function(){
	memory.save();
});
document.addEventListener("visibilitychange", function(){
	if(document.visibilityState === "hidden"){
		memory.save();
	} 
});
