"use strict";
var CLASS_MAP = {'WARRIOR': ['#C69B6D', 1, 'Warrior', 1], 'PALADIN' : ['#F48CBA', 2, 'Paladin', 0], 'HUNTER' : ['#AAD372', 3, 'Hunter', 2], 'ROGUE': ['#FFF468', 4, 'Rogue', 3], 'PRIEST': ['#FFFFFF', 5, 'Priest', 0], 'DEATHKNIGHT': ['#C41E3A', 6, 'Death Knight', 6], 'SHAMAN': ['#0070DD', 7, 'Shaman', 0], 'MAGE': ['#68CCEF', 8, 'Mage', 0], 'WARLOCK': ['#9482C9', 9, 'Warlock', 0], 'MONK': ['#00FF96', 10, 'Monk', 3], 'DRUID': ['#FF7C0A', 11, 'Druid', 99]};
var POWER_TYPE = {0 : ['MANA', '#0066CC', 1], 1 : ['RAGE', '#FF0000', 0], 2 : ['FOCUS', '#996633', 1], 3 : ['ENERGY', '#FFFF00', 1], 6 : ['RUNIC', '#336699', 0], 99 : ['UNDEFINED', '#444444', 0]};
var NAMES_TABLE = {};
var FRAME_PADDING = 0.6;
var FRAME_ASPECT = 0.286;
var HEALTH_BAR_W_ASPECT = 0.78;
var HEALTH_BAR_H_ASPECT = 0.45;
var ICON_BORDER = 4;
var PLAYER_ASPECT = 1.77;
var CRIT_MULTIPLYER = 2.2;
var CRIT_SPEED = 0.05;
var MAX_AURA_NUMBER = 12;
var MOUSE_X = Number.MAX_VALUE;
var MOUSE_Y = Number.MAX_VALUE;
var KEY_SHIFT = false;
var MAX_BUFFER_SIZE = 50;
var GROUP_COMBAT_TEXT = false;
var OFFSET = {};

function Buffer(maxsize) {
    this._data = [];
    this._max = maxsize !== 'undefined' ? maxsize : Number.MAX_VALUE;
    this._index = 0;
}

Buffer.prototype = {
    push : function (value) {
        this._data.push(value);
        if (this._data.length >= this._max) {
            this._data.shift();
        }
    },
    size : function () {
        return this._data.length;
    },
    next : function () {
		var result = null;
        if (this._index < this._data.length) {
            result = this._data[this._index];
            this._index++;
        }
		return result;
    },
    reset : function () {
        this._index = 0;
    },
    map : function (callback) {
        for (var i = 0; i < this._data.length; i++){
            callback(this._data[i]);
        }
    }
};

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
    },
    add : function(x, y) {
        this._x += x;
        this._y += y;
    },
    sub : function(x, y) {
        this._x -= x;
        this._y -= y;
    }
};

function Rect(x, y, w, h){
    this._x = typeof x !== 'undefined' ? x : 0;
    this._y = typeof y !== 'undefined' ? y : 0;
    this._w = typeof w !== 'undefined' ? w : 0;
    this._h = typeof h !== 'undefined' ? h : 0;
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
    top_left : function(){
        return new Point(this.left(), this.top());
    },
    top_right : function(){
        return new Point(this.right(), this.top());
    },
    translate : function(x, y){
        x = typeof x !== 'undefined' ? x : 0;
        y = typeof y !== 'undefined' ? y : 0;
        this._x += x;
        this._y += y;
    },
    x : function(){
        return this._x;
    },
    y : function(){
        return this._y;
    },
    set_size : function(w, h){
        this._w = w;
        this._h = h;
    },
    set_position : function(x, y){
        this._x = x;
        this._y = y;
    },
    set_x : function(x){
        this._x = x;
    },
    set_y : function(y){
        this._y = y;
    },
    set_width : function(value){
        this._w = value;
    },
    set_height : function(h){
        this._h = h;
    }
};

function Cast(spellid, casttime, geometry, parent){
    this._id = spellid;
    this._geometry = geometry || new Rect();
    this._casttime = casttime;
    this._parent = parent !== 'undefined' ? parent : null;
    this._spell_info = SPELLS_TABLE[this._id];
    this._age = 0;
}

Cast.prototype = {
    id : function(){
        return this._id;
    },
    geometry : function(){
        return this._geometry;
    },
    draw : function(context){
        if (this.alive()){
            var fsize = this.geometry().height() * 0.7;
            var offset = (this.geometry().height() - fsize) * 0.5;

            context.save();
            context.font = fsize + "px Arial";
            context.fillStyle = 'yellow';
            context.fillRect(this.geometry().x(), this.geometry().y(), this.geometry().width()*(this._age / this._casttime), this.geometry().height());
            context.fillStyle = 'black';
            context.textBaseline = 'hanging';
            context.fillText(this._spell_info[0], this.geometry().x(), this.geometry().y() + offset);
            context.strokeStyle = 'white';
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(this.geometry().x() + (this.geometry().width() * (this._age / this._casttime)), this.geometry().top());
            context.lineTo(this.geometry().x() + (this.geometry().width() * (this._age / this._casttime)), this.geometry().bottom());
            context.stroke();
            context.restore();
        }
    },
    update : function(delta){
        this._age += delta;
    },
    alive : function(){
        return this._age < this._casttime;
    },
    kill : function(){
        this._age = Number.MAX_VALUE;
    },
    set_geometry : function(value){
        this._geometry = value;
    }
};

function Tooltip(geometry, spell_info, font_size, parent){
    this._geometry = geometry;
    this._info = spell_info ? spell_info : new Array('Unknown', 'This spell is not present in the spells table.');
	this._font_size = font_size || 16;
    this._parent = parent || null;
}

Tooltip.prototype = {
    geometry : function(){
        return this._geometry;
    },
    parent : function(){
        return this._parent;
    },
    world_geometry : function(){
        return new Rect(this.geometry().x() + this.parent().geometry().x(), this.geometry().y() + this.parent().geometry().y(), this.geometry().width(), this.geometry().height());
    },
    draw : function(context){
        context.save();

        context.font = this._font_size + 'px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'hanging';

        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
        context.strokeStyle = 'black';
        context.fillStyle = 'black';
        context.lineWidth = 1;

        if (KEY_SHIFT){
            var space = context.measureText(' ').width;
            var tab = space*2;

            // wrap text
            var w = this._info[1].split(' ');
            var xx = tab;
            var yy = this._font_size + ICON_BORDER*2;
            var lines = [];

            var line = [];
            while (w.length > 0){
                line.push(w.shift());
                var measure = context.measureText(line.join(' '));
                if (measure.width * 1.3 >= this.geometry().width()){
                    lines.push([line.join(' '), xx, yy]);
                    yy += this._font_size + ICON_BORDER;
                    line = [];
                }
            }
            lines.push([line.join(' '), xx, yy]);
            yy += this._font_size + ICON_BORDER;

            // adjust geometry to fit the text
            this.geometry().set_height(yy);

            var ww = $("#arena-player").width();
            var hh = $("#arena-player").height();

            /* TODO: flip tooltip */
            if ((this.world_geometry().x() + this.geometry().width()) >= ww){
                this.geometry().translate(-this.geometry().width(), 0);
            }

            if ((this.world_geometry().y() + this.geometry().height()) >= hh){
                this.geometry().translate(0, -this.geometry().height());
            }

            context.beginPath();
            context.moveTo(this.geometry().x(), this.geometry().y() + this._font_size + ICON_BORDER);
            context.lineTo(this.geometry().right(), this.geometry().y() + this._font_size + ICON_BORDER);
            context.stroke();

            context.globalAlpha = 0.9;
            context.fillStyle = 'white';
            context.fillRect(this.geometry().x(),this.geometry().y(),this.geometry().width(),this.geometry().height());
            context.globalAlpha = 1.0;

            context.fillStyle = 'black';
            context.strokeRect(this.geometry().x(),this.geometry().y(),this.geometry().width(),this.geometry().height());
            context.fillText(this._info[0], this.geometry().x() + tab, this.geometry().y());
            for(var i = 0; i < lines.length; i++){
                context.fillText(lines[i][0], this.geometry().x() + lines[i][1], this.geometry().y() + lines[i][2]);
            }
        }
        else{
            context.fillText(this._info[0], this.geometry().x(), this.geometry().y());
        }
        context.restore();
    }
};

function Trinket(geometry){
    this._icon = new Image();
    this._icon.src = 'img/icons/56/pvp_trinket.jpg';
    this._geometry = geometry || new Rect();
    this._duration = 120000; // 2 min
    this._age = Number.MAX_VALUE; // more than duration
}

Trinket.prototype = {
    geometry : function(){
        return this._geometry;
    },
    icon : function(){
        return this._icon;
    },
    set_geometry : function(value){
        this._geometry = value;
    },
    update : function(delta){
        this._age += delta;
    },
    pressed : function(){
        this._age = 0;
    },
    draw : function(context){
        context.save();
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
        context.lineWidth = 1;
        context.strokeStyle = 'black';

        context.drawImage(this.icon(), this.geometry().x(), this.geometry().y(), this.geometry().width(), this.geometry().height());
        context.strokeRect(this.geometry().x(), this.geometry().y(), this.geometry().width(), this.geometry().height());
        if (this.alive()){
            context.beginPath();
            context.moveTo(this.geometry().x(), this.geometry().y());
            context.lineTo(this.geometry().top_right().x(), this.geometry().top_right().y());
            context.lineTo(this.geometry().bottom_right().x(), this.geometry().bottom_right().y());
            context.lineTo(this.geometry().bottom_left().x(), this.geometry().bottom_left().y());
            context.closePath();
            context.clip();

            context.globalAlpha = 0.5;

            context.fillStyle = 'black';
            context.strokeStyle = 'white';
            context.beginPath();
            context.moveTo(this.geometry().center().x(), this.geometry().center().y());
            context.arc(this.geometry().center().x(), this.geometry().center().y(), this.geometry().width(), 0, 2*Math.PI * (this._age / this._duration), true);
            context.closePath();
            context.fill();
            context.stroke();

            context.globalAlpha = 1.0;
            context.fillStyle = 'white';
            context.fillText(((this._duration - this._age)/1000).toFixed(0), this.geometry().center().x(), this.geometry().center().y());
        }
        context.restore();
    },
    alive : function(){
        return this._age < this._duration;
    },
    kill : function(){
        this._age = Number.MAX_VALUE;
    }
};

function Aura(spellid, duration, type, parent){
    this._spellid = spellid;
    this._type = type;
    this._icon = new Image();
    this._icon.src = 'data/' + parent.fileid() + '.jpg';
    this._offset = OFFSET[this._spellid];
    this._geometry = new Rect();
    this._age = 0;
    this._duration = duration*1000;
    this._parent = parent !== 'undefined' ? parent : null;
}

Aura.prototype = {
    id : function(){
        return this._spellid;
    },
    icon : function(){
        return this._icon;
    },
    type : function(){
        return this._type;
    },
    geometry : function(){
        return this._geometry;
    },
    world_geometry : function(){
        return new Rect(this.geometry().x() + this.parent().geometry().x(), this.geometry().y() + this.parent().geometry().y(), this.geometry().width(), this.geometry().height());
    },
    set_geometry : function(value){
        this._geometry = value;
    },
    update : function(delta){
        this._age += delta;
    },
    draw : function(context){
        context.save();
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
        context.strokeStyle = this._type == 1 ? 'black' : 'red';
        context.lineWidth = 1;

        context.drawImage(this.icon(), this._offset, 0, 18, 18, this.geometry().x(), this.geometry().y(), this.geometry().width(), this.geometry().height());
        context.strokeRect(this.geometry().x(), this.geometry().y(), this.geometry().width(), this.geometry().height());
        context.restore();
    },
    alive : function(){
        return this._age < this._duration;
    },
    kill : function(){
        this._age = Number.MAX_VALUE;
    },
    parent : function(){
        return this._parent;
    }
};

function CrowdControl(spellid, duration, type, options, geometry, parent){
    this._spellid = spellid;
    this._type = type;
    this._age = 0;
    this._icon = new Image();
    this._icon.src = 'img/cc.jpg';
    this._duration = duration*1000;
    this._geometry = geometry || new Rect();
    this._parent = parent || null;
    this._priority = typeof options !== 'undefined' ? options[0] : 1;
    this._offset = options[1];
}

CrowdControl.prototype = {
    id : function(){
        return this._spellid;
    },
    icon : function(){
        return this._icon;
    },
    update : function(delta){
        this._age += delta;
    },
    draw : function(context){
        context.save();

        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;

        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.drawImage(this.icon(), this._offset, 0, 36, 36, this.geometry().x(), this.geometry().y(), this.geometry().width(), this.geometry().height());
        context.fillText(((this._duration - this._age)/1000).toFixed(1), this.geometry().center().x(), this.geometry().center().y());
        context.restore();
    },
    geometry : function(){
        return this._geometry;
    },
    parent : function(){
        return this._parent;
    },
    set_geometry : function(value){
        this._geometry = value;
    },
    priority : function(){
        return this._priority;
    },
    alive : function(){
        return this._age < this._duration;
    },
    kill : function(){
        this._age = Number.MAX_VALUE;
    }
};

function CombatText(s, critical, type, position, parent){
    this._s = s;
    this._critical = critical;
    this._position = position || new Point();
    this._start_position = new Point(position.x(), position.y());
    this._fsize = 16;
    this._fcritsize = this._fsize * CRIT_MULTIPLYER;
    this._speed = 0.09;
    this._type = type;
    this._color = type == 1 ? 'red' : 'green';
    this._age = 0;
    this._fadetime = 1200; //miliseconds
    this._parent = parent;
    this._additions = 1;
}

CombatText.prototype = {
    draw : function(context){
        if (typeof context !== 'undefined'){
            context.save();

            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 0;
            context.textAlign = 'center';
            context.textBaseline = 'bottom';

            if (this._critical){
                context.font = 'bold ' + this._fcritsize + 'px monospace';
            }
            else{
                context.font = this._fsize + 'px monospace';
            }

            context.globalAlpha = this._age > this._fadetime ? 0 : 1.0 - this._age / this._fadetime;
            context.fillStyle = this._color;
            context.fillText(this._s, this._position.x(), this._position.y());
            context.restore();
        }
    },
    update : function(delta){
        this._age += delta;
        this._position.sub(0, this._speed * delta);
        this._fcritsize = this._fcritsize > this._fsize ? this._fcritsize - CRIT_SPEED*delta : this._fsize;
    },
    add : function(other){
        this._additions++;
        var tokens_a = this.value().split('(');
        var tokens_b = other.value().split('(');
        var amount = parseInt(tokens_a[0], 10) + parseInt(tokens_b[0], 10);
        if (tokens_a[1] == tokens_b[1]){
            this._s = amount + '(' + tokens_a[1] + 'X' + this._additions;
        }
        else{
            this._s = amount + '(Multiple)X' + this._additions;
        }
    },
    value : function(){
        return this._s;
    },
    font : function(){
        return this._fsize;
    },
    position : function(){
        return this._position;
    },
    distance_y : function(){
        return this._start_position.y() - this._position.y();
    },
    set_position : function(position){
        this._position = position;
    },
    set_font_size : function(value){
        this._fsize = value;
    },
    set_speed : function(value){
        this._speed = value;
    },
    age : function(){
        return this._age;
    },
    type : function(){
        return this._type;
    },
    set_fadetime : function(value){
        this._fadetime = value;
    },
    alive : function(){
        return this._age < this._fadetime;
    },
    kill : function(){
        this._age = Number.MAX_VALUE;
    }
};

function Frame(data, geometry, parent){
    this._name = data.name;
    this._data = data;
    this._parent = null;
    this._geometry = geometry || new Rect();
    this._parent = parent !== 'undefined' ? parent : null;

    // calculate rectangles
    var ww = this._geometry.width() * FRAME_PADDING;
    var hh = ww * FRAME_ASPECT;
    var tt = hh;
    var aa = ((ww + tt + ICON_BORDER/2) - (ICON_BORDER * 0.5 * (MAX_AURA_NUMBER-1))) / MAX_AURA_NUMBER;
    var offset_w = Math.max(0, (this._geometry.width()-ww-tt)/2);
    var offset_h = Math.max(0, (this._geometry.height()-hh-aa)/2);

    this._background_r = new Rect(offset_w, offset_h, ww, hh);
    this._icon_r = new Rect(this._background_r.x() + ICON_BORDER*0.5, this._background_r.y() + ICON_BORDER*0.5, this._background_r.width() - (this._background_r.width() * HEALTH_BAR_W_ASPECT), this._background_r.width() - (this._background_r.width() * HEALTH_BAR_W_ASPECT));
    this._stamina_r = new Rect(this._background_r.x() + this._icon_r.width() + ICON_BORDER, this._background_r.y(), this._background_r.width() * HEALTH_BAR_W_ASPECT - ICON_BORDER, this._background_r.height() * HEALTH_BAR_H_ASPECT);
    this._power_r = new Rect(this._stamina_r.left(), this._stamina_r.bottom() + ICON_BORDER/2, this._stamina_r.width(), this._icon_r.height() - this._stamina_r.height());
    this._cast_r = new Rect(this._background_r.left(), this._icon_r.bottom(), this._background_r.width(), this._background_r.height() - this._icon_r.height() - ICON_BORDER/2);
    this._trinket_r = new Rect(this._background_r.top_right().x() + ICON_BORDER/2, this._background_r.top_right().y(), this._background_r.height(), this._background_r.height());

    // icon image
    this._icon_image = new Image();
    this._icon_image.src = 'img/icons/56/class_' + CLASS_MAP[this._data['class']][1] + '.jpg';
    // bar image
    this._bar_image = new Image();
    this._bar_image.src = 'img/minimalist.png';

    // cc list
    this._control = [];

    // stamina
    this._stamina = this._data.starthpmax;
    this._maxstamina = this._data.starthpmax;

    // power amount
    this._power = POWER_TYPE[CLASS_MAP[this._data['class']][3]][2] * 100;

    // aura buffer
    this._auras = new Buffer(MAX_BUFFER_SIZE);

    // combat text buffer
    this._combat_text = new Buffer(MAX_BUFFER_SIZE);

    // trinket
    this._trinket = new Trinket(this._trinket_r);

    // cast bar
    this._cast = null;

    // tooltip
    this._tooltip = null;
}

Frame.prototype = {
    name : function (){
        return this._name;
    },
    parent : function(){
        return this._parent;
    },
    id : function (){
        return this._data.ID;
    },
    fileid : function(){
        if (this._parent !== null){
            return this._parent.id();
        }
    },
    translate : function(x, y){
        this._geometry.translate(x, y);
    },
    geometry : function(){
        return this._geometry;
    },
    set_geometry : function(x, y, w, h){
        this._geometry = new Rect(x, y, w, h);
    },
    scale : function(scale){
        this._rect.set_size(this._rect.width()*scale, this._rect.height()*scale);
    },
    alive : function(){
        return this._stamina > 0;
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
        # event (17) UNIT_POWER || time, event, id, value = math.floor( UnitMana(unit) / UnitManaMax(unit) * 100) 
        # event (18) ARENA_OPPONENT_UPDATE || time, event, id, 2(seen) or 1(unseen) or 3(destroyed) -->  unseed = lost track (stealth), destroyed = has left the arena
        */

        var event_ = parseInt(post[1], 10);

        // current hp
        if (event_ == 1)
        {
            if(parseInt(post[2], 10) == this.id()){
                this._stamina = (parseInt(post[3], 10));
            }
        }
        // max hp
        else if (event_ == 2)
        {
            if(parseInt(post[2], 10) == this.id()){
                this._maxstamina = (parseInt(post[3], 10));
            }
        }
        // damage
        else if ([3, 4, 5, 6].indexOf(event_) !== -1)
        {
            if(parseInt(post[3], 10) == this.id()){
                var s = post[4] + '(' + NAMES_TABLE[post[2]] + ')';
                var critical = parseInt(post[5], 10);
                this._combat_text.push(new CombatText(s, critical, 1, this._background_r.top_right(), this));
            }
        }
        // healing
        else if ([7, 8].indexOf(event_) !== -1)
        {
            if(parseInt(post[3], 10) == this.id()){
                var s0 = post[4] + '(' + NAMES_TABLE[post[2]] + ')';
                var critical0 = parseInt(post[5], 10);
                this._combat_text.push(new CombatText(s0, critical0, 2, this._background_r.top_right(), this));
            }
        }
        // cast start
        else if(event_ == 9){
            if(parseInt(post[2], 10) == this.id()){
                this._cast = new Cast(parseInt(post[4], 10), parseInt(post[5], 10), this._cast_r);
            }
        }
        // spell success
        else if(event_ == 10){
            if(parseInt(post[2], 10) == this.id()){
                var target = parseInt(post[3], 10);
                var spell_id = parseInt(post[4], 10);
                var duration = parseInt(post[5], 10);
                if (spell_id == 59752 || spell_id == 42292){
                    this._trinket.pressed();
                }
                if (this._cast !== null && spell_id == this._cast.id()){
                    this._cast = null;
                }
            }
        }
        // spell interupt
        else if(event_ == 12){
            if(parseInt(post[2], 10) == this.id()){
                console.log(this.name(), ' --> ', NAMES_TABLE[parseInt(post[3], 10)], ' INTERUPT (', SPELLS_TABLE[parseInt(post[4], 10)][0], ')');
            }
        }
        // add aura
        else if(event_ == 13){
            if(parseInt(post[2], 10) == this.id()){
                var spell_id0 = parseInt(post[3], 10);
                var type = parseInt(post[4], 10);
                var duration0 = parseFloat(post[5]);
                if (duration0 > 0 && CC_TABLE.hasOwnProperty(spell_id0)){
                    this._control.push(new CrowdControl(spell_id0, duration0, type, CC_TABLE[spell_id0], this._icon_r, this));
                }
                else{
                    this._auras.push(new Aura(spell_id0, duration0, type, this));
                }
            }
        }
        // remove aura
        else if(event_ == 14){
            if(parseInt(post[2], 10) == this.id()){
                var spell_id1 = parseInt(post[3], 10);
                if (CC_TABLE.hasOwnProperty(spell_id1)){
                    for (var i = 0; i < this._control.length; i++){
                        if (this._control[i].id() == spell_id1){
                            this._control[i].kill();
                        }
                    }
                }
                else{
                    this._auras.map(function (aura){
                        if (aura.id() == spell_id1){
                            aura.kill();
                        }
                    });
                }
            }
        }
        // unit power
        else if(event_ == 17){
            if(parseInt(post[2], 10) == this.id()){
                this._power = parseInt(post[3], 10);
            }
        }
    },
    draw_tooltip : function(context){
        context.save();
        context.translate(this._geometry.x(), this._geometry.y());
        if (this._tooltip !== null){
            this._tooltip.draw(context);
        }
        context.restore();
    },
    draw : function (context, delta){
        context.save();
        context.translate(this._geometry.x(), this._geometry.y());

        // update stamina_bar
        var stamina_bar = jQuery.extend(true, {}, this._stamina_r);
        stamina_bar.set_width(stamina_bar.width() * (this._stamina / this._maxstamina));

        // update power_bar
        var power_bar = jQuery.extend(true, {}, this._power_r);
        power_bar.set_width(power_bar.width() * (this._power / 100));

        // draw background
        context.fillStyle = 'rgba(125, 125, 125, 0.5)';
        context.fillRect(this._background_r.x(), this._background_r.y(), this._background_r.width(), this._background_r.height());

        // draw icon
        context.drawImage(this._icon_image, this._icon_r.x(), this._icon_r.y(), this._icon_r.width(), this._icon_r.height());

        // draw stamina_r
        context.fillStyle = CLASS_MAP[this._data['class']][0];
        context.fillRect(stamina_bar.x(), stamina_bar.y(), stamina_bar.width(), stamina_bar.height());
        context.globalAlpha = 0.5;
        context.drawImage(this._bar_image, this._stamina_r.x(), this._stamina_r.y(), this._stamina_r.width(), this._stamina_r.height());
        context.globalAlpha = 1.0;

        // draw power
        context.fillStyle = POWER_TYPE[CLASS_MAP[this._data['class']][3]][1];
        context.fillRect(power_bar.x(), power_bar.y(), power_bar.width(), power_bar.height());
        context.globalAlpha = 0.5;
        context.drawImage(this._bar_image, this._power_r.x(), this._power_r.y(), this._power_r.width(), this._power_r.height());
        context.globalAlpha = 1.0;

        // draw cast bar
        if (this._cast !== null){
            this._cast.update(delta);
            this._cast.draw(context);
        }
        context.globalAlpha = 0.5;
        context.drawImage(this._bar_image, this._cast_r.x(), this._cast_r.y(), this._cast_r.width(), this._cast_r.height());
        context.globalAlpha = 1.0;


        // init font
        var font_h = Math.round(this._stamina_r.height()/2);
        context.font = font_h + 'px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'hanging';
        context.fillStyle = 'white';
        context.shadowColor = '#000';
        context.shadowBlur = font_h/5;
        context.shadowOffsetX = -font_h*0.1;
        context.shadowOffsetY = font_h*0.1;

        // draw trinket
        this._trinket.update(delta);
        this._trinket.draw(context);

        // draw name text
        var font_offset = (this._stamina_r.height() - font_h)/2;
        context.fillText(this._name, this._stamina_r.left() + font_offset, this._stamina_r.top() + font_offset);

        // draw hpoints text
        context.fillText(this._stamina, this._stamina_r.right() - context.measureText(this._data.starthpmax).width - font_offset, this._stamina_r.top() + font_offset);

        // draw cc
        this._control.sort(function(a,b){return b.priority() - a.priority();});
        for (var i = 0; i < this._control.length; i++){
            if (this._control[i].alive()){
                this._control[i].update(delta);
                this._control[i].draw(context);
            }
        }

        // draw race class
        font_h = Math.round(this._power_r.height()/2);
        context.font = font_h + 'px Arial';
        context.fillText(this._data.race + ' ' + this._data.spec + ' ' + CLASS_MAP[this._data['class']][2], this._power_r.left() + font_offset, this._power_r.top() + (this._power_r.height() - font_h)*0.5);

        // draw power value
        font_offset = (this._power_r.height() - font_h)/2;
        context.fillText(this._power, this._power_r.right() - context.measureText('100').width - font_offset, this._power_r.top() + font_offset);


        // draw combat text
        var prev_text = null;
        this._combat_text.map(function (text){
            if (text.alive()){
                if (prev_text !== null && prev_text.distance_y() < text.font()){
                    /*pass*/
                    if (GROUP_COMBAT_TEXT){
                        if (prev_text.type() == text.type()){
                            prev_text.add(text);
                            text.kill();
                        }
                    }
                }
                else{
                    text.update(delta);
                    text.draw(context);
                    prev_text = text;
                }
            }
        }.bind(this));

        // draw auras
        var frame_width = this._background_r.width() + this._trinket.geometry().width() + ICON_BORDER/2;
        var aura_w = (frame_width - (ICON_BORDER * 0.5 * (MAX_AURA_NUMBER-1))) / MAX_AURA_NUMBER;
        var offset_x = 0;
        var offset_y = 0;
        var has_tooltip = false;
        this._auras.reset();
        for ( var j = 0; j < this._auras.size(); j++)
        {
            var aura = this._auras.next();
            if (aura.alive()){
                // tooltip
                if (aura.world_geometry().contains(MOUSE_X, MOUSE_Y)){
                    has_tooltip = true;
                    this._tooltip = new Tooltip(new Rect(aura.geometry().bottom_left().x(), aura.geometry().bottom_left().y(), this._background_r.width(), this._background_r.width()), SPELLS_TABLE[aura.id()], font_h, this);
                }
                if (offset_x > frame_width){
                    offset_x = 0;
                    offset_y = aura_w + ICON_BORDER/2;
                }
                aura.set_geometry(new Rect(this._background_r.bottom_left().x() + offset_x, this._background_r.bottom_left().y() + ICON_BORDER/2 + offset_y, aura_w, aura_w));
                aura.update(delta);
                aura.draw(context);
                offset_x += aura_w + ICON_BORDER/2;
            }
        }
        if (!has_tooltip){
            this._tooltip = null;
        }
        context.restore();
    }
};

function rjust(s, width, fillchar){
    return new Array(width + 1 - s.length).join(fillchar) + s;
}

function ljust(s, width, fillchar){
    return s + new Array(width + 1 - s.length).join(fillchar);
}

function number_to_currency(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function get_url_parameter(name) {
    return decodeURI((new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [null])[1]);
}

function format_time(time){
    time = time / 1000;
    var a = '0';
    var b = '0';
    if (Math.floor(time / 60) >= 10) a = '';
    if (Math.floor(time % 60) >= 10) b = '';
    return (a + Math.floor(time/60) + ':' + b + Math.floor(time % 60) + ',' + Math.floor(time % 60 * 10 % 10));
}

function draw_info(context, data){
    var line = 0;
    var size = 16;
    var adjust_size = 14;

    var pprint = function(key, value){
        return ljust(key, adjust_size, ' ') + ': ' + value;
    };

    context.save();

    // font 
    context.textAlign = 'left';
    context.textBaseline = 'hanging';
    context.font = size + 'px monospace';

    //line++;
    //context.fillText(pprint('Elapsed', format_time(elapsed*1000)), 0, size*line);

    line++;
    context.fillText(pprint('Time', format_time(data.time)), 0, size*line);

    line++;
    context.fillText(pprint('Speed', data.speed.toFixed(1)), 0, size*line);

    //line++;
    //context.fillText(pprint('Tick', tick.toFixed(1)), 0, size*line);
    context.restore();

}

window.requestAnimationFrame = (function(){
return  window.requestAnimationFrame       ||  //Chromium 
        window.webkitRequestAnimationFrame ||  //Webkit
        window.mozRequestAnimationFrame    || //Mozilla Geko
        window.oRequestAnimationFrame      || //Opera Presto
        window.msRequestAnimationFrame     || //IE Trident?
        function(callback, element){ //Fallback function
            window.setTimeout(callback, 1000/60);                
        };
 
})();

function preload(id, _callback){
    var t_images = 13;
    var l_images = 0;

    function f_onload(){
        l_images++;
        if (l_images == t_images){
            _callback();
        }
    }

    var img0 = new Image();
    img0.onload = f_onload;
    img0.src = 'data/' + id + '.jpg';

    var img1 = new Image();
    img1.onload = f_onload;
    img1.src = 'img/icons/56/pvp_trinket.jpg';

    var img2 = new Image();
    img2.onload = f_onload;
    img2.src = 'img/cc.jpg';

    for(var i = 1; i < 12; i++){
        var cimg = new Image();
        cimg.onload = f_onload;
        cimg.src = 'img/icons/56/class_' + i + '.jpg';
    }
}

function Statistic(data){
    this._data = data;
    this._canvas = $("#arena-statistics");
    this._context = this._canvas.get(0).getContext('2d');

    this._resize();

    this._init();
}

Statistic.prototype = {
    _resize : function(){
        this._canvas.attr('width', $(this._canvas).parent().width());
        this._canvas.attr('height', $(this._canvas).parent().height());
    },
    _init : function(){
        var team1 = {};
        var team2 = {};
        var teams = {};
        if (this._data.teams){
            var t1 = this._data.teams["0"];
            var t2 = this._data.teams["1"];

            team1.mmr = t1.mmr;
            team1.name = t1.name;
            team1.rating = t1.rating;

            team2.mmr = t2.mmr;
            team2.name = t2.name;
            team2.rating = t2.rating;
        }
        var players_team1 = [];
        var players_team2 = [];
        if (this._data.combatans && this._data.combatans.dudes){
            var dudes = this._data.combatans.dudes;
            for (var key in dudes) {
                var dude = dudes[key];
                if (dude.player) {
                    if (dude.team == 1){
                        players_team1.push([dude['class'], dude.name, dude.ddone, dude.hdone, dude.hcrit]);
                    }else{
                        players_team2.push([dude['class'], dude.name, dude.ddone, dude.hdone, dude.hcrit]);
                    }
                }
            }
        }
        team1.players = players_team1;
        team2.players = players_team2;
        teams.team1 = team1;
        teams.team2 = team2;

        this._context.save();
        var fsize = 24;

        this._context.font = fsize + 'px Arial';
        this._context.fillStyle = 'black';
        this._context.strokeStyle = 'black';
        this._context.textBaseline = 'hanging';

        var c_w = $(this._canvas).width();
        var c_h = $(this._canvas).height();


        var title = team1.name.toUpperCase() + ' vs ' + team2.name.toUpperCase();
        var title_width = this._context.measureText(title).width;
        var margin = c_w*0.05;
        var spacing = 4;
        var y_offset = margin + spacing + fsize;

        // draw title
        this._context.fillText(title, (c_w - title_width)/2, margin);
        this._draw_line(margin, y_offset, c_w - margin, y_offset);
        y_offset += margin/2;

        // players
        var c_x = margin;
        var header = ['Icon', 'Name', 'Team', 'Damage Done', 'Healing Done', 'Max Crit'];
        for(var i = 0; i < header.length; i++){
            var h = header[i];
            var yof = y_offset;
            var ccw = 0;
            var x = null;
            this._context.font = fsize*0.7 + 'px Arial';
            this._context.textBaseline = 'middle';
            for (x in teams){
                for(var j = 0; j < teams[x].players.length; j++){
                    var rect = new Rect(c_x, yof + spacing, c_w - margin*2, fsize);
                    if (h.toLowerCase() == 'icon'){
                        ccw = Math.max(ccw, this._draw_icon(teams[x].players[j], rect, spacing));
                        yof += fsize + spacing;
                    }
                    else if (h.toLowerCase() == 'name'){
                        ccw = Math.max(ccw, this._draw_name(teams[x].players[j], rect, spacing));
                        yof += fsize + spacing;
                    }
                    else if (h.toLowerCase() == 'team'){
                        ccw = Math.max(ccw, this._draw_team(teams[x], rect, spacing));
                        yof += fsize + spacing;
                    }
                    else if (h.toLowerCase() == 'damage done'){
                        ccw = Math.max(ccw, this._draw_ddone(teams[x].players[j], rect, spacing));
                        yof += fsize + spacing;
                    }
                    else if (h.toLowerCase() == 'healing done'){
                        ccw = Math.max(ccw, this._draw_hdone(teams[x].players[j], rect, spacing));
                        yof += fsize + spacing;
                    }
                    else if (h.toLowerCase() == 'max crit'){
                        ccw = Math.max(ccw, this._draw_crit(teams[x].players[j], rect, spacing));
                        yof += fsize + spacing;
                    }
                }
                yof += margin/4;
            }
            c_x = Math.max(c_x, ccw);
        }

        // duration
        this._context.restore();
    },
    _draw_text : function(text, geometry, spacing){
        this._context.fillText(text, geometry.x(), geometry.center().y());
        return geometry.x() + this._context.measureText(text).width + spacing*10;
    },
    _draw_line : function(x0, y0, x1, y1){
        this._context.beginPath();
        this._context.moveTo(x0, y0);
        this._context.lineTo(x1, y1);
        this._context.stroke();
    },
    _draw_icon : function(player, geometry, spacing){
        var icon = new Image();
        icon.src = 'img/icons/56/class_' + CLASS_MAP[player[0]][1] + '.jpg';
        this._context.drawImage(icon, geometry.x(), geometry.y(), geometry.height(), geometry.height());
        return geometry.x() + geometry.height() + spacing*10;
    },
    _draw_name : function(player, geometry, spacing){
        var text = player[1];
        this._context.fillStyle = CLASS_MAP[player[0]][0];
        return this._draw_text(text, geometry, spacing);
    },
    _draw_team : function(team, geometry, spacing){
        var text = team.name;
        this._context.fillStyle = 'black';
        return this._draw_text(text, geometry, spacing);
    },
    _draw_ddone : function(player, geometry, spacing){
        var text = number_to_currency(player[2]);
        this._context.fillStyle = 'red';
        return this._draw_text(text, geometry, spacing);
    },
    _draw_hdone : function(player, geometry, spacing){
        var text = number_to_currency(player[3]);
        this._context.fillStyle = 'green';
        return this._draw_text(text, geometry, spacing);
    },
    _draw_crit : function(player, geometry, spacing){
        var text = number_to_currency(player[4]);
        this._context.fillStyle = 'gray';
        return this._draw_text(text, geometry, spacing);
    }
};

function Player(id, data){
    this._data = data;
    this._canvas = $("#arena-player");
    this._context = this._canvas.get(0).getContext('2d');
    this._last_time = (new Date())*1 - 1;
    this._time = 0;
    this._delta = 0;
    this._tick = 0;
    this._frames = [];
    this._speed = 1.0;
	this._pause = false;
	this._duration = this._data.elapsed * 1000.0;
    this._id = id;

    this._resize();

    this._init();
    this._keyboard();
    this._mouse();
}

Player.prototype = {
    play : function(){
        var now = new Date();
        this._delta = (now - this._last_time) * (this._pause ? 0 : this._speed);
        this._time += this._delta;
        this._last_time = now;
		
        this._display();
        requestAnimationFrame(this.play.bind(this));
    },
	replay : function(){
		this._reset();
		this.play();
	},
    pause : function(){
		this._pause = !this._pause;
    },
	seek : function(time){
		this._last_time = (new Date())*1 - 1;
		this._time = time;
		this._delta = 0;
		this._tick = 0;
		this._frames = [];
		
		this._init();

	},
	time : function(){
		return this._time;
	},
	duration : function(){
		return this._duration;
	},
    id : function(){
        return this._id;
    },
    canvas : function(){
        return this._canvas;
    },
	_reset : function(){
		this._last_time = (new Date())*1 - 1;
		this._time = 0;
		this._delta = 0;
		this._tick = 0;
		this._frames = [];
		
		this._init();
	},
    _init : function(){
        if (this._data.combatans && this._data.combatans.dudes){
            var index = 0; //counter
            var margin = 30;
            var xmin = 0;
            var xmax = 0;
            var ymin = 0;
            var ymax = 0;
            var cw = $(this._canvas).width() - margin*2;
            var ch = $(this._canvas).height() - margin*2;

            var w_step = Math.round(cw/2);
            var h_step = Math.round(ch/this._data.bracket);

            var last_red_y = margin;
            var last_blue_y = margin;

            var dudes = this._data.combatans.dudes;
            for (var key in dudes) {
                var dude = dudes[key];
                if (dude.player) {
                    // calculate bbox
                    xmin = dude.team == 2 ? w_step + margin : margin;
                    xmax = xmin + w_step;

                    // update names table
                    NAMES_TABLE[dude.ID] = dude.name;

                    if (dude.team == 1) {
                        ymin = last_red_y;
                        last_red_y += h_step;
                    }
                    else {
                        ymin = last_blue_y;
                        last_blue_y += h_step;
                    }
                    ymax = ymin + h_step;

                    // init each frame
                    var frame_geometry = new Rect(xmin, ymin, xmax - xmin, ymax - ymin);
                    var d_frame = new Frame(dude, frame_geometry, this);
                    this._frames.push(d_frame);
                }
                index++;
            }
        }
    },
    _clear : function(){
        this._context.save();
        this._context.setTransform(1, 0, 0, 1, 0, 0);
        this._context.clearRect(0, 0, $(this._canvas).width(), $(this._canvas).height());
        this._context.restore();
    },
    _resize : function(){
        this._canvas.attr('width', $(this._canvas).parent().width());
        this._canvas.attr('height', $(this._canvas).parent().height());
    },
    _display : function(){
        this._clear();

        var post = null;
        while (true)
        {
            if (this._tick >= this._data.data.length){
                break;
            }
            else{
                post = this._data.data[this._tick].split(',');
                if (!post || parseFloat(post[0]) >= (this._time/1000)){
                    break;
                }
                else{
                    for (var i = 0; i < this._frames.length; i++) {
                        this._frames[i].update(post);
                    }
                    this._tick++;
                }
            }
        }

        // draw frames
        for (var j = 0; j < this._frames.length; j++) {
            this._frames[j].draw(this._context, this._delta);
        }

        // overlay tooltips
        for (var k = 0; k < this._frames.length; k++) {
            this._frames[k].draw_tooltip(this._context);
        }

        // overlay info
        draw_info(this._context, {time : this._time, speed : this._speed});
    },
    _keyboard : function(){
        // keys
        $(this._canvas).on('keydown', function(event){
            if (event.keyCode == 32){ // space
				this.pause();
            }
			else if (event.keyCode == 37 && event.ctrlKey){ // left arrow with Ctrl
				this.seek(Math.max(0, this.time() - 5000));
			}
            else if (event.keyCode == 37){ // left arrow
				this.seek(Math.max(0, this.time() - 1000));
            }
			else if (event.keyCode == 39 && event.ctrlKey){ // right arrow with Ctrl
				this.seek(Math.min(this.duration(), this.time() + 5000));
			}
            else if (event.keyCode == 39){ // right arrow
				this.seek(Math.min(this.duration(), this.time() + 1000));
            }
            else if (event.keyCode == 107 || event.keyCode == 187){ // +
                this._speed += 0.1;
            }
            else if (event.keyCode == 109 || event.keyCode == 189){ // -
                this._speed = Math.max(0, this._speed - 0.1);
            }
            else if (event.keyCode == 96){ // 0
                this._speed = 1.0;
            }
            else if (event.keyCode == 16){ // Shift
                KEY_SHIFT = true;
            }
            else if (event.keyCode == 83){ // s
                $("#player").toggleClass("flipped");
            }
            else if (event.keyCode == 71){ // g
                GROUP_COMBAT_TEXT = !GROUP_COMBAT_TEXT;
            }
        }.bind(this));

        $(this._canvas).on('keyup', function(event){
            if (event.keyCode == 16){ // Shift
                KEY_SHIFT = false;
            }
        });
    },
    _mouse : function(){
        // focus canvas
        $(this._canvas).on('mouseover mouseout', function(event){
            if (event.type == 'mouseover'){
                this.focus();
            }
            else if (event.type == 'mouseout'){
                this.blur();
            }
        });

        // mousemove
        $(this._canvas).on('mousemove', function(event){
            MOUSE_X = (event.offsetX || event.clientX - $(event.target).offset().left);
            MOUSE_Y = (event.offsetY || event.clientY - $(event.target).offset().top);
        });
		
		// Ctrl click
		$(this._canvas).click(function(event){
			if (event.ctrlKey) {
				this.replay();
			}
		}.bind(this));

        // double click
        $("#player").dblclick(function(event){
            $("#player").toggleClass("flipped");
        });
    }
};

$(document).ready(function () {
    var id = get_url_parameter('id');
    $.getJSON('data/' + id + '.json', function (data) {
        $("#battle-title").text(data.teams['0'].name + '(' + data.teams['0'].mmr + ') vs ' + data.teams['1'].name + '(' + data.teams['1'].mmr + ')');
        OFFSET = data.offset;
        var player = new Player(id, data);
        var statss = new Statistic(data);
        preload(id, function(){
            player.play();
        });
    });
});
