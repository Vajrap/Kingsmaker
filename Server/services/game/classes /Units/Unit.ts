enum TROOP_TYPES {
    infantry = "infantry",
    cavalry = "cavalry",
    archer = "archer",
    mage = "mage",
    cleric = "cleric",
    siege = "siege",
}

class Unit {
    leader: Character;
    infantry: number;
    cavalry: number;
    archer: number;
    mage: number;
    cleric: number;
    siege: number;

    constructor(character: Character) {
        this.leader = character;
        this.infantry = 0;
        this.cavalry = 0;
        this.archer = 0;
        this.mage = 0;
        this.cleric = 0;
        this.siege = 0;
    }

    getTroopNumber() {
        return (
            this.infantry +
            this.cavalry +
            this.archer +
            this.mage +
            this.cleric +
            this.siege
        );
    }

    addTroop(data: { type: TROOP_TYPES; amount: number }) {
        if (this.leader.troopCapacity < data.amount + this.getTroopNumber()) {
            return Error("Not enough troop capacity");
        } else {
            this[data.type] += data.amount;
        }
    }

    getUpKeep(troopData: Record<TROOP_TYPES, Troop>): Cost {
        const totalUpKeep: Cost = { gold: 0, iron: 0, wood: 0, food: 0 };

        for (const type of Object.values(TROOP_TYPES)) {
            const troopCount = this[type];
            const upkeepPerUnit = troopData[type].upKeep;

            totalUpKeep.gold += upkeepPerUnit.gold * troopCount;
            totalUpKeep.iron += upkeepPerUnit.iron * troopCount;
            totalUpKeep.wood += upkeepPerUnit.wood * troopCount;
            totalUpKeep.food += upkeepPerUnit.food * troopCount;
        }

        return totalUpKeep;
    }
}

class Character {
    name: string;
    type: "infantry" | "cavalry" | "archer" | "mage" | "cleric";
    ability: any[];
    equipment: any;
    might: number;
    intelligence: number;
    dexterity: number;
    troopCapacity: number;
    constructor(
        name: string,
        type: "infantry" | "cavalry" | "archer" | "mage" | "cleric",
        ability: any[],
        equipment: any,
        might: number,
        intelligence: number,
        dexterity: number,
        troopCapacity: number,
    ) {
        this.name = name;
        this.type = type;
        this.ability = ability;
        this.equipment = equipment;
        this.might = might;
        this.intelligence = intelligence;
        this.dexterity = dexterity;
        this.troopCapacity = troopCapacity;
    }
}

class Troop {
    name: string;
    cost: Cost;
    upKeep: Cost;
    hp: number;
    meleeDice: { dice: number; sides: number };
    rangeDice: { dice: number; sides: number };
    constructor(
        name: string,
        cost: Cost,
        upKeep: Cost,
        hp: number,
        meleeDice: { dice: number; sides: number },
        rangeDice: { dice: number; sides: number },
    ) {
        this.name = name;
        this.cost = cost;
        this.upKeep = upKeep;
        this.hp = hp;
        this.meleeDice = meleeDice;
        this.rangeDice = rangeDice;
    }
}

interface Cost {
    gold: number;
    iron: number;
    food: number;
    wood: number;
}
