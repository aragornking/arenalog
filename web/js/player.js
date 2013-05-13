$(document).ready(function () {

    function get_url_parameter(name) {
        return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]);
    }

	// get json data
	var json_data = null;
	var id = get_url_parameter('id');
	var data_url = 'data/' + id + '.json';
	$.getJSON(data_url, function (data) {
		json_data = data;
        main();
	});

	//globals
    var canvas = $("#arena-player");
    var context = canvas.get(0).getContext('2d');
    var container = $(canvas).parent();
    var frames = [];

    var CLASS_COLOR_MAP = {'WARRIOR':['#C69B6D', 1], 'PALADIN':['#F48CBA', 2], 'HUNTER':['#AAD372', 3], 'ROGUE':['#FFF468', 4], 'PRIEST':['#FFFFFF', 5], 'DEATHKNIGHT':['#C41E3A', 6], 'SHAMAN':['#0070DD', 7], 'MAGE':['#68CCEF', 8], 'WARLOCK':['#9482C9', 9], 'MONK':['#00FF96', 10], 'DRUID':['#FF7C0A', 11]};
    var FRAME_PADDING = 0.6;
    var FRAME_ASPECT = 0.286;
    var HEALTH_BAR_W_ASPECT = 0.78;
    var HEALTH_BAR_H_ASPECT = 0.45;
    var ICON_BORDER = 4;
    var PLAYER_ASPECT = 1.77;
	
    //$(window).resize(resize_canvas);

    function resize_canvas() {
        canvas.attr('width', $(container).width());
        canvas.attr('height', $(canvas).width() / PLAYER_ASPECT);
    }
	
	function clear_canvas() {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, $(canvas).width(), $(canvas).height());
        context.restore();
	}

    function Frame(data){
        this._name = data.name;
        this._data = data;
        this._buffs = [];
        this._debuffs = [];
        this._translate = [0, 0];
        this._scale = [1, 1];
        this._parent = null;
        this._bbox = [-1, 1, -1, 1];
    }

    Frame.prototype = {
        name : function (){
            return this._name;
        },
        add_debuff : function (debuff){
            this._debuffs.push(debuff);
        },
        set_translate : function(x, y){
            this._translate[0] = x;
            this._translate[1] = y;
        },
        bbox : function(){
            return this._bbox;
        },
        set_bbox : function(xmin, xmax, ymin, ymax){
            this._bbox[0] = xmin;
            this._bbox[1] = xmax;
            this._bbox[2] = ymin;
            this._bbox[3] = ymax;
        },
        set_scale : function(scale){
            this._scale[0] = scale;
            this._scale[1] = scale;
        },
        update : function (){
            var u = null;
        },
        draw : function (){
            context.save();
            context.translate(this._bbox[0], this._bbox[2]);

            // calculate offsets
            var w = (this._bbox[1] - this._bbox[0]);
            var h = (this._bbox[3] - this._bbox[2]);
            var ww = w * FRAME_PADDING;
            var hh = ww * FRAME_ASPECT;
            var offset_w = (w-ww)/2;
            var offset_h = (h-hh)/2;
            var h_bar_w = ww * HEALTH_BAR_W_ASPECT; 
            var h_bar_h = hh * HEALTH_BAR_H_ASPECT;
            var icon = ww - (h_bar_w + ICON_BORDER);
            var icon_image = new Image();
            var bar_image = new Image();
            icon_image.src = 'img/icons/56/class_' + CLASS_COLOR_MAP[this._data.class][1] + '.jpg';
            bar_image.src = 'img/minimalist.png';

            // draw background
            context.fillStyle = 'rgba(125, 125, 125, 0.5)';
            context.fillRect(offset_w, offset_h, ww, hh);

            // draw icon
            context.drawImage(icon_image, offset_w + ICON_BORDER/2, offset_h + ICON_BORDER/2, icon, icon);

            // draw health
            context.fillStyle = CLASS_COLOR_MAP[this._data.class][0];
            context.fillRect(offset_w + ICON_BORDER + icon, offset_h, h_bar_w, h_bar_h);
            context.globalAlpha = 0.5;
            context.drawImage(bar_image, offset_w + ICON_BORDER + icon, offset_h, h_bar_w, h_bar_h);
            context.globalAlpha = 1.0;

            // init font
            var font_h = Math.round(h_bar_h * 0.5);
            var font_half = font_h/2;
            context.font = font_h + 'px Arial';
            context.textAlign = 'left';
            context.textBaseline = 'hanging';
            context.fillStyle = 'white';
            context.shadowColor = '#000';
            context.shadowBlur = font_h/5;
            context.shadowOffsetX = -font_h*0.1;
            context.shadowOffsetY = font_h*0.1;

            // draw name text
            context.fillText(this._name, offset_w + ICON_BORDER + icon + font_half, offset_h + font_half);

            // draw hpoints text
            context.fillText(this._data.hpmax, offset_w + ww - context.measureText(this._data.hpmax).width - font_half, offset_h + font_half);

            context.restore();
        }
    }

    function display() {
		clear_canvas();
        for (var i = 0; i < frames.length; i++)
        {
            frames[i].draw();
        }
    }
	
	//window.requestAnimationFrame
	window.requestAnimationFrame = (function(){
    return  window.requestAnimationFrame       ||  //Chromium 
            window.webkitRequestAnimationFrame ||  //Webkit
            window.mozRequestAnimationFrame    || //Mozilla Geko
            window.oRequestAnimationFrame      || //Opera Presto
            window.msRequestAnimationFrame     || //IE Trident?
            function(callback, element){ //Fallback function
                window.setTimeout(callback, 1000/60);                
            }
     
	})();
	
	function init(){
		resize_canvas();
        if (json_data == null)
            return;
        
        // set title text
        $("#battle-title").text(json_data.teams['0'].name + '(' + json_data.teams['0'].mmr + ') vs ' + json_data.teams['1'].name + '(' + json_data.teams['1'].mmr + ')');

        if (json_data.combatans && json_data.combatans.dudes)
        {
            var index = 0; //counter
            var xmin = xmax = 0;
            var ymin = ymax = 0;
            var w_step = Math.round($(canvas).width()/2);
            var h_step = Math.round($(canvas).height()/json_data.bracket);

            var last_red_y = 0;
            var last_blue_y = 0;

            dudes = json_data.combatans.dudes
            for (var key in dudes)
            {
                dude = dudes[key];
                if (dude.player)
                {
                    // calculate bbox
                    xmin = dude.team == 2 ? w_step : 0;
                    xmax = xmin + w_step;

                    if (dude.team == 1)
                    {
                        ymin = last_red_y;
                        last_red_y += h_step;
                    }
                    else
                    {
                        ymin = last_blue_y;
                        last_blue_y += h_step;
                    }
                    ymax = ymin + h_step;

                    console.log(dude.name, dude.team, ymin);

                    // init each frame
                    d_frame = new Frame(dude);
                    d_frame.set_bbox(xmin, xmax, ymin, ymax);
                    frames.push(d_frame);
                }
                index++;
            }
        }
	}
	
	function animate(){
		display();
		requestAnimationFrame(animate);
	}

    function main(){
        init();
        animate();
    }
});
