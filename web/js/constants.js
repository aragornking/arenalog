// Spell Name           Priority (higher : more priority
// Crowd control
var CC_TABLE = {
    108194   : 4,    // Asphyxiate
    115001   : 4,    // Remorseless Winter
    91800    : 4,    // Gnaw
    91797    : 4,    // Monstrous Blow (Dark Transformation
    113801   : 4,    // Bash (Force of Nature - Feral Treants
    102795   : 4,    // Bear Hug
    33786    : 4,    // Cyclone
    99       : 4,    // Disorienting Roar
    2637     : 4,    // Hibernate
    22570    : 4,    // Maim
    5211     : 4,    // Mighty Bash
    9005     : 4,    // Pounce
    102546   : 4,    // Pounce (Incarnation
    110698   : 4,    // Hammer of Justice (Paladin
    113004   : 4,    // Intimidating Roar Fleeing in fear  (Warrior
    113056   : 4,    // Intimidating Roar Cowering in fear  (Warrior
    117526   : 4,    // Binding Shot
    3355     : 4,    // Freezing Trap
    1513     : 4,    // Scare Beast
    19503    : 4,    // Scatter Shot
    19386    : 4,    // Wyvern Sting
    90337    : 4,    // Bad Manner (Monkey
    24394    : 4,    // Intimidation
    126246   : 4,    // Lullaby (Crane
    126355   : 4,    // Paralyzing Quill (Porcupine
    126423   : 4,    // Petrifying Gaze (Basilisk
    50519    : 4,    // Sonic Blast (Bat
    56626    : 4,    // Sting (Wasp
    96201    : 4,    // Web Wrap (Shale Spider
    118271   : 4,    // Combustion Impact
    44572    : 4,    // Deep Freeze
    31661    : 4,    // Dragon's Breath
    118      : 4,    // Polymorph
    61305    : 4,    // Polymorph: Black Cat
    28272    : 4,    // Polymorph: Pig
    61721    : 4,    // Polymorph: Rabbit
    61780    : 4,    // Polymorph: Turkey
    28271    : 4,    // Polymorph: Turtle
    82691    : 4,    // Ring of Frost
    123393   : 4,    // Breath of Fire (Glyph of Breath of Fire
    126451   : 4,    // Clash
    122242   : 4,    // Clash (not sure which one is right
    119392   : 4,    // Charging Ox Wave
    120086   : 4,    // Fists of Fury
    119381   : 4,    // Leg Sweep
    115078   : 4,    // Paralysis
    105421   : 4,    // Blinding Light
    115752   : 4,    // Blinding Light (Glyph of Blinding Light
    105593   : 4,    // Fist of Justice
    853      : 4,    // Hammer of Justice
    119072   : 4,    // Holy Wrath
    20066    : 4,    // Repentance
    10326    : 4,    // Turn Evil
    113506   : 4,    // Cyclone (Symbiosis
    605      : 4,    // Dominate Mind
    88625    : 4,    // Holy Word: Chastise
    64044    : 4,    // Psychic Horror
    8122     : 4,    // Psychic Scream
    113792   : 4,    // Psychic Terror (Psyfiend
    9484     : 4,    // Shackle Undead
    87204    : 4,    // Sin and Punishment
    2094     : 4,    // Blind
    1833     : 4,    // Cheap Shot
    1776     : 4,    // Gouge
    408      : 4,    // Kidney Shot
    113953   : 4,    // Paralysis (Paralytic Poison
    6770     : 4,    // Sap
    76780    : 4,    // Bind Elemental
    77505    : 4,    // Earthquake
    51514    : 4,    // Hex
    118905   : 4,    // Static Charge (Capacitor Totem
    710      : 4,    // Banish
    137143   : 4,    // Blood Horror
    54786    : 4,    // Demonic Leap (Metamorphosis
    5782     : 4,    // Fear
    118699   : 4,    // Fear
    130616   : 4,    // Fear (Glyph of Fear
    5484     : 4,    // Howl of Terror
    22703    : 4,    // Infernal Awakening
    6789     : 4,    // Mortal Coil
    132412   : 4,    // Seduction (Grimoire of Sacrifice
    30283    : 4,    // Shadowfury
    104045   : 4,    // Sleep (Metamorphosis
    7922     : 4,    // Charge Stun
    118895   : 4,    // Dragon Roar
    5246     : 4,    // Intimidating Shout (aoe
    20511    : 4,    // Intimidating Shout (targeted
    132168   : 4,    // Shockwave
    107570   : 4,    // Storm Bolt
    105771   : 4,    // Warbringer
    107079   : 4,    // Quaking Palm
    20549    : 4,    // War Stomp
    118345   : 4,    // Pulverize
    89766    : 4,    // Axe Toss (Felguard/Wrathguard
    115268   : 4,    // Mesmerize (Shivarra
    6358     : 4,    // Seduction (Succubus

    // Roots
    96294    : 2,    // Chains of Ice (Chilblains
    91807    : 2,    // Shambling Rush (Dark Transformation
    339      : 2,    // Entangling Roots
    113770   : 2,    // Entangling Roots (Force of Nature - Balance Treants
    19975    : 2,    // Entangling Roots (Nature's Grasp
    45334    : 2,    // Immobilized (Wild Charge - Bear
    102359   : 2,    // Mass Entanglement
    110693   : 2,    // Frost Nova (Mage
    19185    : 2,    // Entrapment
    128405   : 2,    // Narrow Escape
    90327    : 2,    // Lock Jaw (Dog
    50245    : 2,    // Pin (Crab
    54706    : 2,    // Venom Web Spray (Silithid
    4167     : 2,    // Web (Spider
    122      : 2,    // Frost Nova
    111340   : 2,    // Ice Ward
    33395    : 2,    // Freeze
    116706   : 2,    // Disable
    113275   : 2,    // Entangling Roots (Symbiosis
    123407   : 2,    // Spinning Fire Blossom
    113275   : 2,    // Entangling Roots (Symbiosis
    87194    : 2,    // Glyph of Mind Blast
    114404   : 2,    // Void Tendril's Grasp
    115197   : 2,    // Partial Paralysis
    64695    : 2,    // Earthgrab (Earthgrab Totem
    63685    : 2,    // Freeze (Frozen Power
    107566   : 2,    // Staggering Shout

    // Silences
    47476    : 3,    // Strangulate
    114238   : 3,    // Fae Silence (Glyph of Fae Silence
    81261    : 3,    // Solar Beam
    34490    : 3,    // Silencing Shot
    102051   : 3,    // Frostjaw (also a root
    55021    : 3,    // Silenced - Improved Counterspell
    116709   : 3,    // Spear Hand Strike
    31935    : 3,    // Avenger's Shield
    15487    : 3,    // Silence
    1330     : 3,    // Garrote - Silence
    113287   : 3,    // Solar Beam (Symbiosis
    132409   : 3,    // Spell Lock (Grimoire of Sacrifice
    31117    : 3,    // Unstable Affliction
    115782   : 3,    // Optical Blast (Observer
    24259    : 3,    // Spell Lock (Felhunter
    25046    : 3,    // Arcane Torrent (Energy
    28730    : 3,    // Arcane Torrent (Mana
    50613    : 3,    // Arcane Torrent (Runic Power
    69179    : 3,    // Arcane Torrent (Rage
    80483    : 3,    // Arcane Torrent (Focus
    129597   : 3,    // Arcane Torrent (Chi
            
    // Disarms
    126458   : 1,    // Grapple Weapon (Monk
    50541    : 1,    // Clench (Scorpid
    91644    : 1,    // Snatch (Bird of Prey
    117368   : 1,    // Grapple Weapon
    64058    : 1,    // Psychic Horror
    51722    : 1,    // Dismantle
    118093   : 1,    // Disarm (Voidwalker/Voidlord
    676      : 1,    // Disarm
                    
    // Buffs
    48792    : 1,    // Icebound Fortitude
    49039    : 1,    // Lichborne
    110575   : 1,    // Icebound Fortitude (Death Knight
    122291   : 1,    // Unending Resolve (Warlock
    31821    : 1,    // Aura Mastery
    113002   : 1,    // Spell Reflection (Warrior
    8178     : 1,    // Grounding Totem Effect (Grounding Totem
    104773   : 1,    // Unending Resolve
    23920    : 1,    // Spell Reflection
    114028   : 1,    // Mass Spell Reflection
    131557   : 1,    // Spiritwalker's Aegis
    89485    : 1,    // Inner Focus
    6940     : 1,    // Hand of Sacrifice
    110913   : 1,    // Dark Bargain

    // Immunities
    115018   : 1,    // Desecrated Ground
    48707    : 1,    // Anti-Magic Shell
    110617   : 1,    // Deterrence (Hunter
    110715   : 1,    // Dispersion (Priest
    110700   : 1,    // Divine Shield (Paladin
    110696   : 1,    // Ice Block (Mage
    110570   : 1,    // Anti-Magic Shell (Death Knight
    110788   : 1,    // Cloak of Shadows (Rogue
    19263    : 1,    // Deterrence
    45438    : 1,    // Ice Block
    115760   : 1,    // Glyph of Ice Block
    131523   : 1,    // Zen Meditation
    642      : 1,    // Divine Shield
    47585    : 1,    // Dispersion
    31224    : 1,    // Cloak of Shadows
    46924    : 1     // Bladestorm
};
