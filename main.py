#!/usr/bin/env python
# -*- coding: utf-8 -*-

import jinja2
import collections
import time
import sqlite3
import codecs
import json
import os
import sys

def build_tables(db):
    c = db.cursor()
    # map
    map_ = ((0, "None"), (1, "Nagrand Arena"), (2, "Ruins of Lordaeron"), (3, "Blade's Edge Arena"), (4, "Dalaran Arena"), (5, "The Ring of Valor"), (6, "Tol'viron Arena"))
    c.execute('''CREATE TABLE IF NOT EXISTS map ("id" INTEGER PRIMARY KEY UNIQUE, "name" TEXT NOT NULL)''')
    c.executemany('''INSERT OR IGNORE INTO map (id, name) VALUES   (?, ?)''', map_)

    # class
    class_ = ((1, 'WARRIOR', 'C69B6D'), (2, 'PALADIN', 'F48CBA'), (3, 'HUNTER', 'AAD372'), (4, 'ROGUE', 'FFF468'), (5, 'PRIEST', 'FFFFFF'), (6, 'DEATH KNIGHT', 'C41E3A'), (7, 'SHAMAN', '0070DD'), (8, 'MAGE', '68CCEF'), (9, 'WARLOCK', '9482C9'), (10, 'MONK', '00FF96'), (11, 'DRUID', 'FF7C0A'))
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
    c.execute('''CREATE TABLE IF NOT EXISTS team_player ( "player_id" INTEGER NOT NULL,
                                                          "team_id" INTEGER NOT NULL,
                                                          FOREIGN KEY(player_id) REFERENCES player(id) ON DELETE CASCADE,
                                                          FOREIGN KEY(team_id) REFERENCES team(id) ON DELETE CASCADE)''')
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
    db.commit()

def time_to_sql(timestamp):
    # convert the format stored by aav to sqlite format
    in_date = time.strptime(str(timestamp), '%d/%m/%y %H:%M:%S')
    return time.strftime("%Y-%m-%d %H:%M:%S", in_date)

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

                        # insert players
                        players = battle.get('combatans').get('dudes')
                        if players:
                            for id, player in players.items():
                                is_player = player.get('player', False)
                                if is_player:
                                    class_ = player.get('class')
                                    c.execute('''SELECT id FROM class WHERE class.name = ?''', (class_.upper(),))
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

                                        c.execute('''INSERT INTO team_player (player_id, team_id) VALUES (?, ?)''', (player_id, red_id if team == 1 else blue_id))

                        # insert battle
                        c.execute('''INSERT INTO battle (id, map, elapsed, bracket, date, red_id, blue_id, result, red_mmr, red_rating, blue_mmr, blue_rating)
                                                    VALUES ( NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
                            (map_, elapsed, bracket, date, red_id, blue_id, result, red_mmr, red_rating, blue_mmr, blue_rating))

                        filename = os.path.join(directory, '{0}.json'.format(c.lastrowid))
                        with open(filename, 'w') as o_file:
                            json.dump(battle, o_file)
                        db.commit()
                    except Exception as error:
                        db.rollback()
                        sys.stderr.write('ERROR: {0} on line {1}\n'.format(error, sys.exc_traceback.tb_lineno))

def setup_table(bracket):
    db = sqlite3.connect('history.db')
    data = collections.namedtuple('TableContainer', ['header', 'rows', 'bracket'])

    c = db.cursor()
    c.execute('SELECT id, red_mmr, blue_mmr, date FROM battle WHERE bracket = ?', str(bracket))

    # fill data
    data.header = ('Id', 'Red MMR', 'Blue MMR', 'Date')
    data.rows = c.fetchall()
    data.bracket = bracket

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

def main():
    # TODO: optparse for different options
    root = os.path.dirname(__file__)
    templates_dir = os.path.join(root, 'templates')

    # init database
    db = sqlite3.connect('history.db')
    build_tables(db)
    update_data(db, os.path.join(root, 'web', 'data'), os.path.join(root, 'data', 'data.json'))
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
    
    # close db
    db.close()

if __name__ == '__main__':
    main()