#!/usr/bin/env python
# -*- coding: utf-8 -*-

import jinja2
import urllib2
import collections
import time
import sqlite3
import codecs
import json
import os
import sys

CC_LIST = {
    108194   : 4,
    115001   : 4,
    91800    : 4,
    91797    : 4,
    113801   : 4,
    102795   : 4,
    33786    : 4,
    99       : 4,
    2637     : 4,
    22570    : 4,
    5211     : 4,
    9005     : 4,
    102546   : 4,
    110698   : 4,
    113004   : 4,
    113056   : 4,
    117526   : 4,
    3355     : 4,
    1513     : 4,
    19503    : 4,
    19386    : 4,
    90337    : 4,
    24394    : 4,
    126246   : 4,
    126355   : 4,
    126423   : 4,
    50519    : 4,
    56626    : 4,
    96201    : 4,
    118271   : 4,
    44572    : 4,
    31661    : 4,
    118      : 4,
    61305    : 4,
    28272    : 4,
    61721    : 4,
    61780    : 4,
    28271    : 4,
    82691    : 4,
    123393   : 4,
    126451   : 4,
    122242   : 4,
    119392   : 4,
    120086   : 4,
    119381   : 4,
    115078   : 4,
    105421   : 4,
    115752   : 4,
    105593   : 4,
    853      : 4,
    119072   : 4,
    20066    : 4,
    10326    : 4,
    113506   : 4,
    605      : 4,
    88625    : 4,
    64044    : 4,
    8122     : 4,
    113792   : 4,
    9484     : 4,
    87204    : 4,
    2094     : 4,
    1833     : 4,
    1776     : 4,
    408      : 4,
    113953   : 4,
    6770     : 4,
    76780    : 4,
    77505    : 4,
    51514    : 4,
    118905   : 4,
    710      : 4,
    137143   : 4,
    54786    : 4,
    5782     : 4,
    118699   : 4,
    130616   : 4,
    5484     : 4,
    22703    : 4,
    6789     : 4,
    132412   : 4,
    30283    : 4,
    104045   : 4,
    7922     : 4,
    118895   : 4,
    5246     : 4,
    20511    : 4,
    132168   : 4,
    107570   : 4,
    105771   : 4,
    107079   : 4,
    20549    : 4,
    118345   : 4,
    89766    : 4,
    115268   : 4,
    6358     : 4,

    # Roots
    96294    : 2,
    91807    : 2,
    339      : 2,
    113770   : 2,
    19975    : 2,
    45334    : 2,
    102359   : 2,
    110693   : 2,
    19185    : 2,
    128405   : 2,
    90327    : 2,
    50245    : 2,
    54706    : 2,
    4167     : 2,
    122      : 2,
    111340   : 2,
    33395    : 2,
    116706   : 2,
    113275   : 2,
    123407   : 2,
    113275   : 2,
    87194    : 2,
    114404   : 2,
    115197   : 2,
    64695    : 2,
    63685    : 2,
    107566   : 2,

    # Silences
    47476    : 3,
    114238   : 3,
    81261    : 3,
    34490    : 3,
    102051   : 3,
    55021    : 3,
    116709   : 3,
    31935    : 3,
    15487    : 3,
    1330     : 3,
    113287   : 3,
    132409   : 3,
    31117    : 3,
    115782   : 3,
    24259    : 3,
    25046    : 3,
    28730    : 3,
    50613    : 3,
    69179    : 3,
    80483    : 3,
    129597   : 3,
            
    # Disarms
    126458   : 1,
    50541    : 1,
    91644    : 1,
    117368   : 1,
    64058    : 1,
    51722    : 1,
    118093   : 1,
    676      : 1,
                 
    # Buffs
    48792    : 1,
    49039    : 1,
    110575   : 1,
    122291   : 1,
    31821    : 1,
    113002   : 1,
    8178     : 1,
    104773   : 1,
    23920    : 1,
    114028   : 1,
    131557   : 1,
    89485    : 1,
    6940     : 1,
    110913   : 1,

    # Immunities
    115018   : 1,
    48707    : 1,
    110617   : 1,
    110715   : 1,
    110700   : 1,
    110696   : 1,
    110570   : 1,
    110788   : 1,
    19263    : 1,
    45438    : 1,
    115760   : 1,
    131523   : 1,
    642      : 1,
    47585    : 1,
    31224    : 1,
    46924    : 1 }

def build_tables(db):
    c = db.cursor()
    # map
    map_ = ((0, "None"), (1, "Nagrand Arena"), (2, "Ruins of Lordaeron"), (3, "Blade's Edge Arena"), (4, "Dalaran Arena"), (5, "The Ring of Valor"), (6, "Tol'viron Arena"))
    c.execute('''CREATE TABLE IF NOT EXISTS map ("id" INTEGER PRIMARY KEY UNIQUE, "name" TEXT NOT NULL)''')
    c.executemany('''INSERT OR IGNORE INTO map (id, name) VALUES   (?, ?)''', map_)

    # class
    class_ = ((1, 'Warrior', 'C69B6D'), (2, 'Paladin', 'F48CBA'), (3, 'Hunter', 'AAD372'), (4, 'Rogue', 'FFF468'), (5, 'Priest', 'FFFFFF'), (6, 'Death Knight', 'C41E3A'), (7, 'Shaman', '0070DD'), (8, 'Mage', '68CCEF'), (9, 'Warlock', '9482C9'), (10, 'Monk', '00FF96'), (11, 'Druid', 'FF7C0A'))
    c.execute('''CREATE TABLE IF NOT EXISTS class ("id" INTEGER PRIMARY KEY UNIQUE, "name" TEXT NOT NULL, "color" TEXT NOT NULL)''')
    c.executemany('''INSERT OR IGNORE INTO class (id, name, color) VALUES   (?, ?, ?)''', class_)

    # player
    c.execute('''CREATE TABLE IF NOT EXISTS player (   "id" INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                                                       "name" TEXT NOT NULL UNIQUE,
                                                       "spec" TEXT NOT NULL DEFAULT "",
                                                       "race" TEXT NOT NULL,
                                                       "class_id" INTEGER NOT NULL)''')

    # team
    c.execute('''CREATE TABLE IF NOT EXISTS team   (   "id" INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, 
                                                       "name" TEXT NOT NULL UNIQUE)''')

    # team<->player
    c.execute('''CREATE TABLE IF NOT EXISTS team_player_battle (  "id" INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
                                                                  "player_id" INTEGER NOT NULL,
                                                                  "team_id" INTEGER NOT NULL,
                                                                  "battle_id" INTEGER NOT NULL,
                                                                  FOREIGN KEY(player_id) REFERENCES player(id) ON DELETE CASCADE,
                                                                  FOREIGN KEY(team_id) REFERENCES team(id) ON DELETE CASCADE,
                                                                  FOREIGN KEY(battle_id) REFERENCES battle(id) ON DELETE CASCADE)''')
    # battle
    c.execute('''CREATE TABLE IF NOT EXISTS battle (   "id" INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, 
                                                        "map" INTEGER NOT NULL DEFAULT 0, 
                                                        "elapsed" INTEGER NOT NULL DEFAULT 0, 
                                                        "bracket" INTEGER NOT NULL,
                                                        "date" TEXT NOT NULL,
                                                        "red_id" INTEGER NOT NULL,
                                                        "red_mmr" INTEGER NOT NULL,
                                                        "red_rating" INTEGER NOT NULL,
                                                        "blue_id" INTEGER NOT NULL,
                                                        "blue_mmr" INTEGER NOT NULL,
                                                        "blue_rating" INTEGER NOT NULL,
                                                        "result" INTEGER NOT NULL DEFAULT 0)''')
    # spell
    c.execute('''CREATE TABLE IF NOT EXISTS spell   (   "id" INTEGER PRIMARY KEY UNIQUE,
                                                       "name" TEXT NOT NULL,
                                                       "icon" TEXT NOT NULL,
                                                       "description" TEXT NOT NULL,
                                                       "range" TEXT NOT NULL,
                                                       "powercost" TEXT NOT NULL,
                                                       "casttime" TEXT NOT NULL,
                                                       "control" INTEGER NOT NULL DEFAULT 0,
                                                       "priority" INTEGER NOT NULL DEFAULT 0)''')
    db.commit()

def time_to_sql(timestamp):
    # convert the format stored by aav to sqlite format
    in_date = time.strptime(str(timestamp), '%m/%d/%y %H:%M:%S')
    return time.strftime("%Y-%m-%d %H:%M:%S", in_date)

def fetch_spell_data(spell_id):
    img_dir = os.path.join(os.path.dirname(__file__), 'web', 'img', 'icons')
    response = urllib2.urlopen('http://eu.battle.net/api/wow/spell/{id}'.format(id=spell_id))
    spell_info = json.load(response)
    for size in (18, 36, 56):
        url = 'http://media.blizzard.com/wow/icons/{size}/{spell_name}.jpg'.format(size = size, spell_name = spell_info.get('icon'))
        file = os.path.join(img_dir, str(size), '{0}.jpg'.format(spell_info.get('id')))
        with open(file, 'wb') as out_image:
            out_image.write(urllib2.urlopen(url).read())
    return spell_info

def update_data(db, directory, datafile):
    battles = None
    if os.path.exists(datafile) and os.path.isfile(datafile):
        try:
            with open(datafile) as file_handle:
                battles = json.load(file_handle)['data']
        except Exception as error:
            sys.stdout.write('ERROR {0}\n'.format(error))

        if battles is not None:
            c = db.cursor()
            for battle in battles:
                teams = battle.get('teams')

                map_ = battle.get('map')
                elapsed = battle.get('elapsed')
                bracket = battle.get('bracket')
                date = time_to_sql(battle.get('startTime'))

                # filter invalid data
                if elapsed <= 0 or bracket not in (2,3,5):
                    continue

                red = teams.get('0')
                blue = teams.get('1')

                # red team
                red_name = red.get('name')
                red_mmr = red.get('mmr')
                red_rating = red.get('rating')

                # blue team
                blue_name = blue.get('name')
                blue_mmr = blue.get('mmr')
                blue_rating = blue.get('rating')

                # 0 if red won else 1
                result = 0 if int(red.get('diff')) > 0 else 1

                c.execute('''SELECT id FROM battle WHERE battle.date = ? AND battle.map = ? AND battle.bracket = ?''', (date, map_, bracket))
                battle_id = c.fetchone()

                # insert spell
                battle_data = battle.get('data')
                spell_id = None
                if battle_data is not None:
                    for line in battle_data:
                        tokens = line.split(',')
                        event = int(tokens[1])
                        if event in (9, 10, 12):
                            spell_id = int(tokens[4])
                        elif event == 13:
                            spell_id = int(tokens[3])
                        c.execute('''SELECT id FROM spell WHERE spell.id = ?''', (spell_id, ))
                        id = c.fetchone()
                        if id is not None:
                            pass
                        else:
                            spell_info = fetch_spell_data(spell_id)
                            id = int(spell_info.get('id'))
                            name = spell_info.get('name')
                            icon = spell_info.get('icon')
                            description = spell_info.get('description')
                            range = spell_info.get('range', '')
                            powercost = spell_info.get('powerCost', '')
                            casttime = spell_info.get('castTime')
                            control = 0
                            priority = 0

                            if id in CC_LIST:
                                control = 1
                                priority = CC_LIST.get(id)

                            c.execute('''INSERT INTO spell (id, name, icon, description, range, powercost, casttime, control, priority)
                                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', (id, name, icon, description, range, powercost, casttime, control, priority))
                            db.commit()

                # insert new battle if we dont have it in the database
                if battle_id is None:
                    try:
                        # insert red
                        c.execute('''SELECT id FROM team WHERE team.name = ?''', (red_name, ))
                        id = c.fetchone()
                        if id is not None:
                            (red_id, ) = id
                        else:
                            c.execute('''INSERT INTO team (id, name) VALUES (NULL, ?)''', (red_name,))
                            red_id = c.lastrowid

                        # insert blue
                        c.execute('''SELECT id FROM team WHERE team.name = ?''', (blue_name, ))
                        id = c.fetchone()
                        if id is not None:
                            (blue_id, ) = id
                        else:
                            c.execute('''INSERT INTO team (id, name) VALUES (NULL, ?)''', (blue_name,))
                            blue_id = c.lastrowid

                        # insert battle
                        c.execute('''INSERT INTO battle (id, map, elapsed, bracket, date, red_id, blue_id, result, red_mmr, red_rating, blue_mmr, blue_rating)
                                                    VALUES ( NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
                            (map_, elapsed, bracket, date, red_id, blue_id, result, red_mmr, red_rating, blue_mmr, blue_rating))
                        battle_id = c.lastrowid

                        # insert players
                        players = battle.get('combatans').get('dudes')
                        if players:
                            for id, player in players.items():
                                is_player = player.get('player', False)
                                if is_player:
                                    class_ = player.get('class')
                                    c.execute('''SELECT id FROM class WHERE upper(replace(class.name, " ", "")) = ?''', (class_.upper(),))
                                    class_id = c.fetchone()
                                    if class_id is not None:
                                        (class_id, ) = class_id
                                        name = player.get('name')
                                        spec = player.get('spec')
                                        race = player.get('race')
                                        team = player.get('team')

                                        c.execute('''SELECT id FROM player WHERE player.name = ? AND player.class_id = ?''', (name, class_id))
                                        id = c.fetchone()
                                        if id is not None:
                                            (player_id, ) = id
                                        else:
                                            c.execute('''INSERT INTO player (id, name, spec, race, class_id)
                                                                            VALUES( NULL, ?, ?, ?, ?)''', (name, spec, race, class_id))
                                            player_id = c.lastrowid

                                        c.execute('''INSERT INTO team_player_battle (id, player_id, team_id, battle_id) VALUES (NULL, ?, ?, ?)''', (player_id, red_id if team == 1 else blue_id, battle_id))
                                    else:
                                        sys.stderr.write('ERROR: Unknown class {0}\n'.format(class_))

                        # write data file
                        filename = os.path.join(directory, '{0}.json'.format(battle_id))
                        with open(filename, 'w') as o_file:
                            json.dump(battle, o_file)
                        db.commit()
                    except Exception as error:
                        db.rollback()
                        sys.stderr.write('ERROR: {0} on line {1}\n'.format(error, sys.exc_traceback.tb_lineno))

def setup_table(bracket):
    db = sqlite3.connect('history.db')
    data = collections.namedtuple('TableContainer', ['header', 'rows', 'bracket', 'best'])

    c = db.cursor()
    c.execute('''
SELECT battle.id AS bid,
       battle.date AS bdate,
       map.name AS bmap,
       ( 
           SELECT team.name
             FROM team
            WHERE team.id = battle.red_id 
       ) 
       AS r_team,
       battle.red_rating AS r_rating,
       battle.red_mmr AS r_mmr,
       ( 
           SELECT group_concat( player.class_id, ' ')
             FROM player, 
                  team_player_battle
            WHERE player.id = team_player_battle.player_id 
                  AND
                  team_player_battle.battle_id = battle.id 
                  AND
                  team_player_battle.team_id = battle.red_id 
       ) 
       AS r_comp,
       ( 
           SELECT group_concat( player.class_id, ' ')
             FROM player, 
                  team_player_battle
            WHERE player.id = team_player_battle.player_id 
                  AND
                  team_player_battle.battle_id = battle.id 
                  AND
                  team_player_battle.team_id = battle.blue_id 
       ) 
       AS b_comp,
       ( 
           SELECT team.name
             FROM team
            WHERE team.id = battle.blue_id 
       ) 
       AS b_team,
       battle.blue_rating AS b_rating,
       battle.blue_mmr AS b_mmr,
       strftime( '%M:%S', battle.elapsed, 'unixepoch' ) AS duration,
       battle.result AS bresult
  FROM battle
       JOIN map
         ON map.id = battle.map
 WHERE battle.bracket = ?''', str(bracket))

    # fill data
    data.header = ('Date', 'Map', 'Team', 'Rating', 'MMR', 'Enemy', 'Rating', 'MMR', 'Duration', 'Result')
    data.rows = map(lambda x : dict(zip(map(lambda v: v[0], c.description), x)), c.fetchall())
    for row in data.rows:
        r_comp = row.get('r_comp')
        b_comp = row.get('b_comp')

        try:
            row['r_comp'] = map(str, sorted(map(int, r_comp.split())))
        except Exception as e:
            row['r_comp'] = []
        try:
            row['b_comp'] = map(str, sorted(map(int, b_comp.split())))
        except Exception as e:
            row['b_comp'] = []

    data.bracket = bracket

    # best rating
    c.execute('''SELECT max( battle.red_rating ) FROM battle WHERE battle.bracket=?''', str(bracket))
    (data.best,) = c.fetchone()

    db.close()

    return data

def setup_index():
    data = collections.namedtuple('IndexContainer', ['date', 'num_records'])
    data.date = time.strftime("%A, %d %b %Y %H:%M:%S", time.gmtime())

    data.num_records = 20

    return data

def write_file(filename, data):
    with codecs.open(filename, 'w', 'UTF-8') as out:
        out.write(data)

def write_spells_table():
    root = os.path.dirname(__file__)

    db = sqlite3.connect('history.db')
    c = db.cursor()
    c.execute('SELECT id, name, description FROM spell')
    rows = c.fetchall()

    data = ['var SPELLS_TABLE = {']
    for row in rows:
        data.append('    {id} : ["{name}", "{description}"],'.format(id = row[0], name = row[1], description = row[2].replace('\n', '')))
    data[-1] = data[-1][::-1].replace(',', '}', 1)[::-1]

    c.execute('SELECT id, priority FROM spell WHERE spell.control == 1')
    rows = c.fetchall()
    data.append('var CC_TABLE = {')
    for row in rows:
        data.append('    {id} : {priority},'.format(id = row[0], priority = row[1]))
    data[-1] = data[-1][::-1].replace(',', '}', 1)[::-1]

    db.close()

    write_file(os.path.join(root, 'web', 'js', 'spells.js'), '\n'.join(data))

def main():
    # TODO: optparse for different options
    root = os.path.dirname(__file__)
    templates_dir = os.path.join(root, 'templates')

    # init database
    db = sqlite3.connect('history.db')
    build_tables(db)
    update_data(db, os.path.join(root, 'web', 'data'), os.path.join(root, 'data', 'data.json'))
    # close db
    db.close()

    j_loader = jinja2.Environment(loader = jinja2.FileSystemLoader(templates_dir), autoescape=True)

    #index
    template = j_loader.get_template('index.html')
    data = setup_index()
    write_file(os.path.join(root, 'web', 'index.html'), template.render(data=data))

    # bracket tables
    template = j_loader.get_template('records_table.html')
    for bracket in (2,3,5):
        data = setup_table(bracket)
        write_file(os.path.join(root, 'web', 'table{0}.html'.format(bracket)), template.render(data=data))

    template = j_loader.get_template('player.html')
    write_file(os.path.join(root, 'web', 'player.html'), template.render(data=None))

    # spells
    write_spells_table()
    

if __name__ == '__main__':
    main()
