var CLASS_COLOR_MAP = {'WARRIOR':['#C69B6D', 1, 'Warrior'], 'PALADIN':['#F48CBA', 2, 'Paladin'], 'HUNTER':['#AAD372', 3, 'Hunter'], 'ROGUE':['#FFF468', 4, 'Rogue'], 'PRIEST':['#FFFFFF', 5, 'Priest'], 'DEATHKNIGHT':['#C41E3A', 6, 'Death Knight'], 'SHAMAN':['#0070DD', 7, 'Shaman'], 'MAGE':['#68CCEF', 8, 'Mage'], 'WARLOCK':['#9482C9', 9, 'Warlock'], 'MONK':['#00FF96', 10, 'Monk'], 'DRUID':['#FF7C0A', 11, 'Druid']};
var FRAME_PADDING = 0.6;
var FRAME_ASPECT = 0.286;
var HEALTH_BAR_W_ASPECT = 0.78;
var HEALTH_BAR_H_ASPECT = 0.45;
var ICON_BORDER = 4;
var PLAYER_ASPECT = 1.77;
var INTERVAL_VALUE = 0.1;
var FPS = 0;
	
function Point(x, y){
    x = typeof x !== 'undefined' ? x : 0;
    y = typeof y !== 'undefined' ? y : 0;
    this._x = x;
    this._y = y;
}

Point.prototype = {
    x : function(){
        return this._x;
    },
    y : function(){
        return this._y;
    },
    set_x : function(x){
        this._x = x;
    },
    set_y : function(y){
        this._y = y;
    }
}

function Rect(x, y, w, h){
    x = typeof x !== 'undefined' ? x : 0;
    y = typeof y !== 'undefined' ? y : 0;
    w = typeof w !== 'undefined' ? w : 0;
    h = typeof h !== 'undefined' ? h : 0;
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
}

Rect.prototype = {
    bottom : function(){
        return this._y + this._h;
    },
    top : function(){
        return this._y;
    },
    left : function(){
        return this._x;
    },
    right : function(){
        return this._x + this._w;
    },
    bottom_left : function(){
        return new Point(this.left(), this.bottom());
    },
    bottom_right : function(){
        return new Point(this.right(), this.bottom());
    },
    center : function(){
        return new Point(this._x + (this._w * 0.5), this._y + (this._h*0.5));
    },
    contains : function(x, y){
        return (x >= this.left() && x <= this.right()) && (y >= this.top() && y <= this.bottom());
    },
    height : function(){
        return this._h;
    },
    width : function(){
        return this._w;
    },
    set_width : function(value){
        this._w = value;
    },
    top_left : function(){
        return new Point(this.left(), this.top());
    },
    top_right : function(){
        return new Point(this.right(), this.top());
    },
    translate : function(x, y){
        this._x += x;
        this._y += y;
        this._w += x;
        this._h += y;
    },
    x : function(){
        return this._x;
    },
    y : function(){
        return this._y;
    },
    set_size : function(w, h){
        self._w = w;
        self._h = h;
    }
}

function Frame(data){
    this._name = data.name;
    this._data = data;
    this._buffs = [];
    this._debuffs = [];
    this._parent = null;
    this._rect = new Rect();
    // icon image
    this._icon_image = new Image();
    this._icon_image.src = 'img/icons/56/class_' + CLASS_COLOR_MAP[this._data.class][1] + '.jpg';
    // bar image
    this._bar_image = new Image();
    this._bar_image.src = 'img/minimalist.png';

    this._stamina = this._data.starthpmax;
    this._maxstamina = this._data.starthpmax;
}

Frame.prototype = {
    name : function (){
        return this._name;
    },
    id : function (){
        return this._data.ID;
    },
    add_debuff : function (debuff){
        this._debuffs.push(debuff);
    },
    translate : function(x, y){
        this._rect.translate(x, y);
    },
    set_rect : function(x, y, w, h){
        this._rect = new Rect(x, y, w, h);
    },
    scale : function(scale){
        self._rect.set_size(self._rect.width()*scale, self._rect.height()*scale);
    },
    update : function (post){
        /*
        # event (0)  init || time, event, id, hp, maxhp, buffs(separator ;), debuffs(separator ;)
        # event (1)  hp related events || time, event, id, value UnitHealth(unit)
        # event (2)  hp related events || time, event, id, value UnitHealthMax(unit)
        # event (3)  SWING_DAMAGE || time, event, source_id, dest_id, amount, critical
        # event (4)  SPELL_DAMAGE || time, event, source_id, dest_id, amount, critical
        # event (5)  SPELL_PERIODIC_DAMAGE || time, event, source_id, dest_id, amount, critical
        # event (6)  RANGE_DAMAGE || time, event, source_id, dest_id, amount, critical
        # event (7)  SPELL_HEAL || time, event, source_id, dest_id, amount, critical
        # event (8)  SPELL_PERIODIC_HEAL || time, event, source_id, dest_id, amount, critical
        # event (9)  SPELL_CAST_START || time, event, source_id, dest_id, spellid, casttime, duration
        # event (10) SPELL_CAST_SUCCESS || time, event, source_id, dest_id, spellid, time
        # event (11) SPELL_CAST_FAILED || can't be tracked from others
        # event (12) SPELL_INTERRUPT || time, event, source_id, dest_id, spellid, amount
        # event (13) create new buf, debuff || time, event, id, spellid, 1(buff) or 2(debuff), buff_time --> UnitBuff(unit, n), UnitDebuff(unit, n) n = 1,40
        # event (14) remove existing buf, debuff || time, event, id, index, 1(buff) or 2(debuff)
        # event (17) mana related || time, event, id, value = math.floor( UnitMana(unit) / UnitManaMax(unit) * 100) 
        # event (18) ARENA_OPPONENT_UPDATE || time, event, id, 2(seen) or 1(unseen) or 3(destroyed) -->  unseed = lost track (stealth), destroyed = has left the arena
        */

        post_id = parseInt(post[2]);
        if (post_id != this.id())
            return;
        
        var event_ = parseInt(post[1]);
        if (event_ == 1)
        {
            this._stamina = (parseInt(post[3]));
        }
        else if (event_ == 2)
        {
            this._maxstamina = (parseInt(post[3]));
        }
    },
    draw : function (context){
        context.save();
        context.translate(this._rect.x(), this._rect.y());

        // calculate rectangles
        var ww = this._rect.width() * FRAME_PADDING;
        var hh = ww * FRAME_ASPECT;
        var offset_w = (this._rect.width()-ww)/2;
        var offset_h = (this._rect.height()-hh)/2;

        var background_r = new Rect(offset_w, offset_h, ww, hh);
        var icon_r = new Rect(background_r.x() + ICON_BORDER*0.5, background_r.y() + ICON_BORDER*0.5, background_r.width() - (background_r.width() * HEALTH_BAR_W_ASPECT), background_r.width() - (background_r.width() * HEALTH_BAR_W_ASPECT));
        var stamina_r = new Rect(background_r.x() + icon_r.width() + ICON_BORDER, background_r.y(), background_r.width() * HEALTH_BAR_W_ASPECT - ICON_BORDER, background_r.height() * HEALTH_BAR_H_ASPECT);
        var power_r = new Rect(stamina_r.left(), stamina_r.bottom() + ICON_BORDER/2, stamina_r.width(), icon_r.height() - stamina_r.height());
        var cast_r = new Rect(background_r.left(), icon_r.bottom(), background_r.width(), background_r.height() - icon_r.height() - ICON_BORDER/2);

        var stamina_bar = jQuery.extend(true, {}, stamina_r);
        stamina_bar.set_width(stamina_bar.width() * (this._stamina / this._maxstamina));

        // draw background
        context.fillStyle = 'rgba(125, 125, 125, 0.5)';
        context.fillRect(background_r.x(), background_r.y(), background_r.width(), background_r.height());

        // draw icon
        context.drawImage(this._icon_image, icon_r.x(), icon_r.y(), icon_r.width(), icon_r.height());

        // draw stamina_r
        context.fillStyle = CLASS_COLOR_MAP[this._data.class][0];
        context.fillRect(stamina_bar.x(), stamina_bar.y(), stamina_bar.width(), stamina_bar.height());
        context.globalAlpha = 0.5;
        context.drawImage(this._bar_image, stamina_r.x(), stamina_r.y(), stamina_r.width(), stamina_r.height());
        context.globalAlpha = 1.0;

        // draw power
        //context.fillStyle = 'blue';
        //context.fillRect(power_r.x(), power_r.y(), power_r.width(), power_r.height());
        context.globalAlpha = 0.5;
        context.drawImage(this._bar_image, power_r.x(), power_r.y(), power_r.width(), power_r.height());
        context.globalAlpha = 1.0;

        // draw cast bar
        context.globalAlpha = 0.5;
        context.drawImage(this._bar_image, cast_r.x(), cast_r.y(), cast_r.width(), cast_r.height());
        context.globalAlpha = 1.0;

        // init font
        var font_h = Math.round(stamina_r.height()/2);
        context.font = font_h + 'px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'hanging';
        context.fillStyle = 'white';
        context.shadowColor = '#000';
        context.shadowBlur = font_h/5;
        context.shadowOffsetX = -font_h*0.1;
        context.shadowOffsetY = font_h*0.1;

        // draw name text
        font_offset = (stamina_r.height() - font_h)/2;
        context.fillText(this._name, stamina_r.left() + font_offset, stamina_r.top() + font_offset);

        // draw hpoints text
        context.fillText(this._stamina, stamina_r.right() - context.measureText(this._data.starthpmax).width - font_offset, stamina_r.top() + font_offset);

        // draw race class
        var font_h = Math.round(power_r.height()/2);
        context.font = font_h + 'px Arial';
        context.fillText(this._data.race + ' ' + CLASS_COLOR_MAP[this._data.class][2], power_r.left() + font_offset, power_r.top() + (power_r.height() - font_h)*0.5);

        context.restore();

    }
}

function get_url_parameter(name) {
    return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]);
}

$(document).ready(function () {
	// get json data
	var json_data = null;
	var id = get_url_parameter('id');
	var data_url = 'data/' + id + '.json';
	$.getJSON(data_url, function (data) {
		json_data = data;
        main();
	});

    //spellid info
    //$.getJSON("http://eu.battle.net/api/wow/spell/19750?jsonp=?", function(data){
    //    console.log(data);
    //});

    // spellicon 18, 36, 56 sizes
    // http://media.blizzard.com/wow/icons/36/spell_holy_flashheal.jpg

	//globals
    var canvas = $("#arena-player");
    var context = canvas.get(0).getContext('2d');
    var container = $(canvas).parent();
    var frames = [];
    var time = 0.0;
    var tick = 0;

    var now = null;
    var last_update = (new Date)*1 - 1;
    var fps_filter = 50;

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

    function draw_info(){
        context.save();
        // font 
        context.textAlign = 'left';
        context.textBaseline = 'hanging';
        context.font = '12px monospace';

        context.fillText(FPS.toFixed(1), 0, 0);
        context.restore();
    }

    function display() {
        // clear
		clear_canvas();

        draw_info();

        var post = null;
        time += INTERVAL_VALUE;

        while (true)
        {
            if (tick >= json_data.data.length)
                break;
            else{
                post = json_data.data[tick].split(',');
                if (!post || parseInt(post[0]) >= time){
                    break;
                }
                else{
                    for (var i = 0; i < frames.length; i++) {
                        frames[i].update(post);
                    }
                    tick++;
                }
            }
        }
        for (var i = 0; i < frames.length; i++) {
            frames[i].draw(context);
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

                    // init each frame
                    d_frame = new Frame(dude);
                    d_frame.set_rect(xmin, ymin, xmax - xmin, ymax - ymin);
                    frames.push(d_frame);
                }
                index++;
            }
        }
	}
	
	function animate(){
        var this_fps = 1000 / ((now = new Date) - last_update);
        FPS += (this_fps - FPS) / fps_filter;
        last_update = now;

		display();
		requestAnimationFrame(animate);
	}

    function main(){
        init();
        animate();
    }
});
