ux.RSC = function(t,e,s){
	var r,a,b,i,label,theme,name,disabled,checked;

	r = new Array;
	
	if(typeof(e) == "string") e = document.querySelectorAll(e);
	else if(e instanceof Node) e = [e];
	else if(e instanceof Array == false && e instanceof NodeList == false) s = e;

	if(typeof(s) == "function") s = {"change": s};
	
	s = ux.verify({
		"append": null,
		"type": "checkbox",
		"change": "function",
		"checked": null,
		"disabled": false,
		"name": false,
		"value": false,
		"label": false,
		"theme": false,
	},s);

	if(ux.isString(s.append)) s.append = document.querySelector(s.append);
	// --- создания елемента
	if(typeof(e)=="undefined" || typeof(e.length)=="undefined") e = [ux.create("input",0,{"type":t=="switch"?s.type:t,"name":ux.typeString(s.name)},s.value)];

	for(i=0; i<e.length; i++){
		b = e[i];
		
		if(b.hasAttribute("ux-compile") == true) continue;
		if(t == "switch" && ["checkbox","radio"].indexOf(b.type) == -1) continue;
		else if(t == "checkbox" && b.type != "checkbox") continue;
		else if(t == "radio" && b.type != "radio") continue;
		
		checked = b.checked?true:s.checked;
		disabled = b.hasAttribute("disabled")?true:s.disabled;
		theme = (b.hasAttribute("ux-theme") && !s.theme?b.getAttribute("ux-theme"):s.theme);
		label = (b.hasAttribute("ux-label")?b.getAttribute("ux-label"):s.label);
		name  = (b.hasAttribute("name") && !s.name?b.getAttribute("name"):s.name);
		
		a = ux.create("label","ux-"+t+" "+ux.typeString(theme));
		a.setting = {
			"name": name,
			"label": label,
			"theme": theme,
			"change": s.change,
			"type": b.type,
		};
		a.caption = ux.create("p",0,0,label);
		a.icon = ux.create("a","ux-anim ux-anim-b");
		a.input = b;
		a.input.ux = a;
		a.input.addEventListener("change",function(){
			this.ux.set(this.checked);
		});
		// ---
		a.set = function(bool){
			if(typeof bool != "boolean") return false;
			// --- устанавливаем изменяем флажок
			this.checked = bool;
			// --- выполняем зарегестрировану функцию
			this.setting.change.call(this,bool);
			return true;
		};
		a.get = function(){
			return this.checked;
		};
		// --- создаем list для radio
		Object.defineProperty(a, "list", {
		  get: function() {
		  	let list,parent,value;
		  	
		  	list = new Array;
		  	
		  	if(this.setting.type == "radio"){
				parent = this.input.form != null ? this.input.form : document.body;
			
				[].forEach.call(parent.querySelectorAll('[name="'+this.input.name+'"]'),function(a){
					list.push(a);
					if(a.checked) value = a.value;
				});

				Object.defineProperty(list, "value", { value: value});
			}

		    return list;
		  },
		});
		// --- создаем value
		Object.defineProperty(a, "value", {
		  get: function() {
		    return this.setting.type == "radio" ? this.input.value : this.input.checked;
		  },
		  set: function(value) {
		  	if(typeof value == "boolean") this.input.checked = checked;
			else if(this.setting.type == "radio") this.input.value = value;
		  },
		});
		// --- создаем checked
		Object.defineProperty(a, "checked", {
		  get: function() {
		    return this.input.checked;
		  },
		  set: function(checked) {
			this.input.checked = checked;
			if(this.input.checked == true) this.setAttribute("checked","on");
			else this.removeAttribute("checked");
		  },
		});
		// --- создаем label
		Object.defineProperty(a, "label", {
		  get: function() {
		    return this.caption.innerText;
		  },
		  set: function(value) {
			return this.caption.innerHTML = value;
		  },
		});
		// --- создаем disabled
		Object.defineProperty(a, "disable", {
		  get: function() {
		    return this.input.disabled;
		  },
		  set: function(bool) {
		    if(bool == true) this.setAttribute("disabled","on");
			else this.removeAttribute("disabled");
			this.input.disabled = bool;
		  },
		});
		// ---
		b.style.display = "none";
		b.setAttribute("ux-compile","on");
		// --- сначало нужно вставить родителя
		if(s.append == null && (b.parentNode instanceof Node)) b.parentNode.insertBefore(a,b);
		else if(s.append instanceof Node) s.append.appendChild(a);
		
		a.appendChild(a.input);
		a.appendChild(a.icon);
		
		if(typeof label == "string") a.appendChild(a.caption);

		a.disable = disabled;
		a.checked = checked;

		r.push(a);
	}

	return r.length==1?r[0]:r;
};
ux.radio = function(e,s){return ux.RSC("radio",e,s)};
ux.switch = function(e,s){return ux.RSC("switch",e,s)};
ux.checkbox = function(e,s){return ux.RSC("checkbox",e,s)};