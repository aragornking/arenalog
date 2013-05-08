#!/bin/env python
import sys
import json

COMM_MAPS = [
    "None",
    "Nagrand Arena",
    "Ruins of Lordaeron",
    "Blade's Edge Arena",
    "Dalaran Arena",
    "The Ring of Valor",
    "Tol'viron Arena"]

COMM_RESULT = [
    "Unknown",
    "Win",
    "Loss",
    "Draw"]

def main(argv):
    if not argv or len(argv) != 1:
        return

    filename = argv[0]
    records = None
    try:
        with open(filename) as file_handle:
            records = json.load(file_handle)['data']
    except Exception as error:
        sys.stdout.write('ERROR {0}'.format(error))

    # data kyes
    # [u'map', u'version', u'teams', u'server', u'elapsed', u'bracket', u'result', u'startTime', u'endTime', u'data', u'combatans']
    if records is not None:
        for index, record in enumerate(records):
            teams = record.get('teams')
            print u'\n--------- {0} vs {1} -----------'.format(teams.get('0').get('name'), teams.get('1').get('name'))
            print index, record['startTime'], COMM_MAPS[record['map']], record['elapsed']
            players = record['combatans']['dudes']
            if players:
                for id, player in players.items():
                    name = player.get('name')
                    hcrit = player.get('hcrit')
                    class_ = player.get('class')
                    isplayer = player.get('player', False)
                    if isplayer:
                        print name, hcrit, class_

if __name__ == '__main__':
    main(sys.argv[1:])
