!function(){"use strict";var s=(t.prototype.transform=function(){if("string"==typeof this.buttons)return this.parseString();if(this.buttons instanceof Array)return this.parseArray();throw new Error("Buttons must be a string or array")},t.prototype.parseArray=function(){if(0===this.buttons.length)throw new Error("You must define at least one button");return this.buttons.map(function(t){var e={text:"",latex:"",cmd:!1};if("string"==typeof t)return e.text=t,e.latex=t,e.cmd=!1,e;if("object"!=typeof t)throw new Error("Button must be an object");if(void 0===t.text)throw new Error("You must define text property of button");if("string"!=typeof t.text)throw new Error("text property of button must be a string");if(e.text=t.text,void 0===t.latex)e.latex=t.text;else{if("string"!=typeof t.latex)throw new Error("latex property of button must be a string");e.latex=t.latex}if(void 0===t.cmd)e.cmd=!1;else{if("boolean"!=typeof t.cmd)throw new Error("cmd property must be boolean");e.cmd=t.cmd}return e})},t.prototype.parseString=function(){if(0===this.buttons.length)throw new Error("You must define at least 1 button");return this.buttons.split(this.SEPARATOR).map(function(t){return{text:t,latex:t,cmd:!1}})},t);function t(t){this.SEPARATOR=" ",this.buttons=t}function e(r,t){"6"===r.editorManager.majorVersion&&(r.options.register("equation_editor_config",{processor:"object"}),r.options.register("equation_editor_group",{processor:"string",default:"basic"}),r.options.register("equation_editor_button_bar",{processor:"object"}),r.options.register("equation_editor_button_groups",{processor:"object"}));var n=function(t){var e=o(t,"equation_editor_config");if(void 0===e)e={};else if("object"!=typeof e)throw new Error("'equation_editor_config' property must be an object");if(void 0===e.url)e.url="editor/equation_editor.html";else if("string"!=typeof e.url)throw new Error("'url' property must be a string in equation_editor_config");if(void 0===e.origin)e.origin=document.location.origin;else if("string"!=typeof e.origin)throw new Error("'origin' property must be a string in equation_editor_config");if(void 0===e.title)e.title="Equation Editor";else if("string"!=typeof e.title)throw new Error("'title' property must be a string in equation_editor_config");if(void 0===e.space_after_content)e.space_after_content="&nbsp;";else if("string"!=typeof e.space_after_content)throw new Error("'space_after_content' property must be a string in equation_editor_config");if(void 0===e.btn_cancel_text)e.btn_cancel_text="Cancel";else if("string"!=typeof e.btn_cancel_text)throw new Error("'btn_cancel_text' property must be a string in equation_editor_config");if(void 0===e.btn_ok_text)e.btn_ok_text="Insert";else if("string"!=typeof e.btn_ok_text)throw new Error("'btn_ok_text' property must be a string in equation_editor_config");if("object"==typeof e.mathlive_config||void 0===e.mathlive_config)return e;throw new Error("'mathlive_config' property must be a object with config of mathlive, see http://docs.mathlive.io/tutorial-CONFIG.html")}(r),i=o(r,"equation_editor_button_groups"),a=o(r,"equation_editor_button_bar"),c=o(r,"equation_editor_group"),d="";if(void 0===c)c="basic";else if("string"!=typeof c)throw new Error("'equation_editor_group' property must be a string");void 0===i&&(i={basic:[{name:"Numbers",buttons:[{cmd:!1,text:"0"},{cmd:!1,text:"1"},{cmd:!1,text:"2"},{cmd:!1,text:"3"},{cmd:!1,text:"4"},{cmd:!1,text:"5"},{cmd:!1,text:"6"},{cmd:!1,text:"7"},{cmd:!1,text:"8"},{cmd:!1,text:"9"},{cmd:!1,text:","},{cmd:!1,text:"."},{cmd:!1,text:"\\pi"},{cmd:!1,text:"i"},{cmd:!1,text:"e"},{cmd:!1,text:"\\infty"}]},{name:"Arithmetic and Units",buttons:[{cmd:!1,text:"+"},{cmd:!1,text:"-"},{cmd:!1,text:"\\times"},{cmd:!1,text:"\\div"},{cmd:!1,text:"\\pm"},{cmd:!0,latex:"\\overline",text:"\\overline{x}"},{cmd:!1,text:"\\cdot"},{cmd:!0,latex:"/",text:"/"},{cmd:!1,text:"$"},{cmd:!1,text:"\\degree"},{cmd:!1,text:"%"}]}],intermediate:[{name:"Exponents, Roots, Logs",buttons:[{cmd:!0,latex:"y^x",text:"y^x"},{cmd:!0,latex:"\\sqrt{x}",text:"\\sqrt{x}"},{cmd:!0,latex:"\\sqrt[\\placeholder{3}]{\\placeholder{}}",text:"\\sqrt[\\placeholder{3}]{\\placeholder{x}}"},{cmd:!0,latex:"\\sqrt[\\placeholder{}]{\\placeholder{}}",text:"\\sqrt[\\placeholder{n}]{\\placeholder{x}}"},{cmd:!1,text:"e^x"},{cmd:!1,text:"\\ln"},{cmd:!1,text:"\\log"},{cmd:!1,text:"\\log_b"}]},{name:"Relations",buttons:[{cmd:!1,text:"="},{cmd:!1,text:"\\neq"},{cmd:!1,text:"\\sim"},{cmd:!1,text:"\\not\\sim"},{cmd:!1,text:"\\lt"},{cmd:!1,text:"\\gt"},{cmd:!1,text:"\\approx"},{cmd:!1,text:"\\not\\approx"},{cmd:!1,text:"\\le"},{cmd:!1,text:"\\ge"},{cmd:!1,text:"\\simeq"},{cmd:!1,text:"\\not\\simeq"},{cmd:!1,text:"\\therefore"}]},{name:"Geometry",buttons:[{cmd:!1,text:"\\rightarrow"},{cmd:!1,text:"\\leftrightarrow"},{cmd:!0,latex:"\\overline",text:"\\overline{AB}"},{cmd:!0,latex:"\\overarc",text:"\\overarc{AB}"},{cmd:!1,text:"\\parallel"},{cmd:!1,text:"\\perp"},{cmd:!1,text:"\\angle"},{cmd:!1,text:"m\\angle"},{cmd:!1,text:"\\bigtriangleup"},{cmd:!1,text:"▱"},{cmd:!1,text:"\\bigodot"}]},{name:"Groups",buttons:[{cmd:!0,latex:"(",text:"(\\cdot)"},{cmd:!0,latex:"[",text:"[\\cdot]"},{cmd:!0,latex:"|",text:"|\\cdot|"},{cmd:!1,text:"(x,y)"},{cmd:!1,text:"[x,y]"},{cmd:!1,text:"(x,y]"},{cmd:!1,text:"[x,y)"}]}],advanced:[{name:"Trigonometry",buttons:[{cmd:!1,text:"\\sin"},{cmd:!1,text:"\\sec"},{cmd:!1,text:"\\sin^{-1}"},{cmd:!1,text:"\\sec^{-1}"},{cmd:!1,text:"\\cos"},{cmd:!1,text:"\\csc"},{cmd:!1,text:"\\cos^{-1}"},{cmd:!1,text:"\\csc^{-1}"},{cmd:!1,text:"\\tan"},{cmd:!1,text:"\\cot"},{cmd:!1,text:"\\tan^{-1}"},{cmd:!1,text:"\\cot^{-1}"}]},{name:"Statistics",buttons:[{cmd:!1,text:"\\mu"},{cmd:!1,text:"\\sigma"},{cmd:!1,text:"\\overline{x}"},{cmd:!1,text:"\\overline{y}"},{cmd:!1,text:"x^i"},{cmd:!1,text:"x_i"},{cmd:!1,text:"x!"},{cmd:!1,text:"\\Sigma"}]},{name:"Greek",buttons:[{cmd:!1,text:"\\alpha"},{cmd:!1,text:"\\beta"},{cmd:!1,text:"\\gamma"},{cmd:!1,text:"\\delta"},{cmd:!1,text:"\\theta"},{cmd:!1,text:"\\pi"}]},{name:"Calculus",buttons:[{cmd:!1,text:"\\int"},{cmd:!1,text:"\\int_{a}^{b}"},{cmd:!1,text:"dx"},{cmd:!1,text:"\\frac{d}{dx}"},{cmd:!1,latex:"\\lim_{x \\to \\infty}",text:"\\lim"},{cmd:!1,latex:"\\sum_{i=1}^{n}",text:"\\sum"},{cmd:!1,text:"\\infty"}]},{name:"Matrix",buttons:[{cmd:!0,latex:"\\begin{bmatrix} \\placeholder{} & \\placeholder{} \\\\ \\placeholder{} & \\placeholder{} \\end{bmatrix}",text:"\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}"},{cmd:!0,latex:"\\begin{bmatrix} \\placeholder{} & \\placeholder{} & c \\\\ \\placeholder{} & \\placeholder{} & f \\\\ \\placeholder{} & \\placeholder{} & \\placeholder{} \\end{bmatrix}",text:"\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}"}]},{name:"Equation System",buttons:[{cmd:!0,text:"\\begin{cases} x + y \\\\ x – y \\end{cases}"},{cmd:!0,text:"\\begin{cases} x + y + z \\\\ x – y + z \\\\ x + y + z \\end{cases}"}]}]}),void 0===a&&(a=[{text:"+"},{text:"-"},{text:"\\times"},{text:"\\div"},{text:"y^x",latex:"y^x",cmd:!0},{text:"\\sqrt{x}",latex:"\\sqrt{x}",cmd:!0},{latex:"\\sqrt[\\placeholder{}]{\\placeholder{}}",text:"\\sqrt[\\placeholder{n}]{\\placeholder{x}}",cmd:!0},{latex:"\\log_b",text:"\\log_b",cmd:!1}]),r.on("init",function(){setTimeout(function(){m(r)},500)}),r.addCommand("equation-window",function(o){void 0===o&&(o={}),r.windowManager.openUrl({url:n.url,title:n.title,width:820,height:500,buttons:[{type:"cancel",text:n.btn_cancel_text},{type:"custom",text:n.btn_ok_text,primary:!0}],onAction:function(){r.execCommand("equation-insert",{html:d,latex:o.latex,currentTarget:o.currentTarget}),r.windowManager.close()},onMessage:function(t,e){switch(e.mceAction){case"equation-update":d=e.html,o.latex=e.latex;break;case"equation-mounted":!function(t,e,o,r,n){var i=document.querySelector("iframe[src='"+t.url+"']"),a=new s(e).transform();for(var c in o)if(o.hasOwnProperty(c)){var d=o[c];if(!(d instanceof Array))throw new Error("Groups must be an array ");var m=d.map(function(t){if(void 0===t.name)throw new Error("You must define group name property");if("string"!=typeof t.name)throw new Error("Group name must be a string");if(void 0===t.buttons)throw new Error("You must define buttons property");var e=new s(t.buttons).transform();return{name:t.name,buttons:e}});o[c]=m}i.contentWindow.postMessage({equation_editor_group:r,equation_editor_button_bar:a,equation_editor_button_groups:o,mathlive_config:t.mathlive_config,latex:n},t.origin)}(n,a,i,c,o.latex)}}})}),r.addCommand("equation-insert",function(t){var e;t&&(e="\n            <span class='mq-math-mode' data-latex='"+t.latex+"'>\n                "+t.html+"\n            </span>"+n.space_after_content,t.currentTarget&&r.selection.select(t.currentTarget),r.selection.setContent(e),m(r))}),r.ui.registry.addButton("equation-editor",{title:"Editor de ecuaciones",text:"f(x)",onAction:function(){r.execCommand("equation-window",{})}})}function o(t,e){return"6"===t.editorManager.majorVersion?t.options.get(e):t.settings[e]}function m(e){for(var t=0,o=e.getDoc().getElementsByClassName("mq-math-mode");t<o.length;t++){var r=o[t];r.contentEditable="false",r.onclick||(r.onclick=function(t){t.stopPropagation(),e.execCommand("equation-window",{latex:t.currentTarget.dataset.latex,currentTarget:t.currentTarget})})}}tinymce.PluginManager.add("equation-editor",e)}();