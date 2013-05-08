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
    map_ = ((0, "None"), (1, "Nagrand Arena"), (2, "Ruins of Lordaeron"), (3, "Blade's Edge Arena"), (4, "Dalaran Arena"), (5, "The Ring of Valor"), (6, "Tol'viron Arena"))
    # map
    c.execute('''CREATE TABLE IF NOT EXISTS map ("id" INTEGER PRIMARY KEY UNIQUE, "name" TEXT NOT NULL)''')
    c.executemany('''INSERT OR IGNORE INTO map (id, name) VALUES   (?, ?)''', map_)

    # team
    c.execute('''CREATE TABLE IF NOT EXISTS team   (   "id" INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, 
                                                        "name" TEXT NOT NULL UNIQUE)''')

    # record
    c.execute('''CREATE TABLE IF NOT EXISTS record (   "id" INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, 
                                                        "map" INTEGER NOT NULL DEFAULT 0, 
                                                        "elapsed" INTEGER NOT NULL DEFAULT 0, 
                                                        "bracket" INTEGER NOT NULL,
                                                        "date" TEXT NOT NULL,
                                                        "team_red" TEXT NOT NULL,
                                                        "team_blue" TEXT NOT NULL,
                                                        "result" INTEGER NOT NULL DEFAULT 0)''')
    db.commit()

def time_to_sql(timestamp):
    # convert the format stored by aav to sqlite format
    in_date = time.strptime(str(timestamp), '%d/%m/%y %H:%M:%S')
    return time.strftime("%Y-%m-%d %H:%M:%S", in_date)

def update_data(db, directory, datafile):
    records = None
    if os.path.exists(datafile) and os.path.isfile(datafile):
        try:
            with open(datafile) as file_handle:
                records = json.load(file_handle)['data']
        except Exception as error:
            sys.stdout.write('ERROR {0}\n'.format(error))

        if records is not None:
            c = db.cursor()
            for record in records:
                teams = record.get('teams')

                map_ = record.get('map')
                elapsed = record.get('elapsed')
                bracket = record.get('bracket')
                date = time_to_sql(record.get('startTime'))
                team_red = teams.get('0').get('name')
                team_blue = teams.get('1').get('name')
                result = record.get('result')

                c.execute('''SELECT id FROM record WHERE record.date = ? AND record.map = ? AND record.bracket = ?''', (date, map_, bracket))
                record_id = c.fetchone()

                # insert new record if we dont have it in the database
                if record_id is None:
                    try:
                        c.execute('''INSERT INTO record (map, elapsed, bracket, date, team_red, team_blue, result) VALUES ( ?, ?, ?, ?, ?, ?, ?)''', 
                            (map_, elapsed, bracket, date, team_red, team_blue, result))
                        filename = os.path.join(directory, '{0}.json'.format(c.lastrowid))
                        with open(filename, 'w') as o_file:
                            json.dump(record, o_file)
                        db.commit()
                    except Exception as error:
                        db.rollback()
                        sys.stderr.write('ERROR: {0}\n'.format(error))

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

    j_loader = jinja2.Environment(loader = jinja2.FileSystemLoader(templates_dir), autoescape=True)

    #index
    template = j_loader.get_template('index.html')
    data = setup_index()
    write_file(os.path.join(root, 'web', 'index.html'), template.render(data=data))

    # bracket tables
    template = j_loader.get_template('records_table.html')
    c = db.cursor()
    c.execute('SELECT id, team_red, team_blue, date FROM record WHERE bracket = 3')
    data = c.fetchall()
    write_file(os.path.join(root, 'web', '3v3.html'), template.render(data=data))
    
    # close db
    db.close()

if __name__ == '__main__':
    main()
