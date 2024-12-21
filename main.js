document.getElementById("dummy").innerHTML = "";
var globalVariable = {
    current: new Date().getTime(),
    maxVero: 80,
    fps: 30,
    currentCheat: 0,
    course: 0,
    mouseX: 0,
    mouseY: 0,
    lainaAmount: 0,
    active: false,
}

var game = {
    score: 0,
    totalScore: 0,
    voima: 1,
    rahaClicked: 0,
    versio: 1.000,
    topScore: 0,
    ascensionBonus: 1,
    combo: 0,
    comboMultiplier: 0,

    addToScore: function(amount) {
        this.score += amount;
        this.totalScore += amount;
        if (this.topScore <= this.score) {
            this.topScore = this.applyCourse();
            this.topScore += amount;
        }
        display.updateScore();
    },

    takeFromScore: function(amount) {
        this.score -= amount / getCourse();
    },

    checkScore: function(amount) {
        return (this.applyCourse() >= amount);
    },

    applyCourse: function() {
        return this.score * getCourse();
    },

    getVerotonScorePerSecond: function() {
        var scorePerSecond = 0;
        for ( let i = 0; i < building.name.length; i++) {
            scorePerSecond += building.factor[i] * building.amount[i];
        }
        var yritysUpgradeFactor = yritysUpgrade.getFactor();
        scorePerSecond += pienyritys.factor * pienyritys.amount * yritysUpgradeFactor;
        return scorePerSecond;
    },

    getScorePerSecond: function() {
        return this.getVerotonScorePerSecond() * (1 - this.getVeroprosentti() / 100) * this.ascensionBonus;
    },

    getVeroprosentti: function() {
        var veroprosentti = Math.ceil(Math.min(globalVariable.maxVero, Math.max(1, Math.log(this.getVerotonScorePerSecond()) * 8.5)));
        document.getElementById("veroProsenttiStyle").style.color = "rgba(255, 0, 0, "+((veroprosentti / 100) * 1.2)+")";
        return veroprosentti;
    },

    getVoima: function() {
        let x = this.getScorePerSecond();
        return (Math.trunc((this.voima * Math.max(1, this.getComboMultiplier()) * Math.max(1, events.getTotalBonus()) * Math.max(1, ((x * (1 - this.getVeroprosentti() / 100)) / 100 * ascendUpgrade.ascendVoimaMultiplier)) * 100)) / 100);
    },

    getComboMultiplier: function() {
        return Math.min(this.getMaxComboMultiplier(), Math.max(0.01, getBaseLog(10, this.combo)));
    },

    getMaxComboMultiplier: function() {
        let x = 2;
        for (let i = 0; i < upgrade.name.length; i++) {
            if (upgrade.type[i] == "combo" && upgrade.purchased[i]) {
                x += 1;
            } else {
                x = 2;
            }
        }
        return x;
    }
};

setInterval (function() {
    display.updateUpgrades();
    display.updateScore();
    display.updateShop();
    yritysUpgrade.getFactor();
    ascension.progressBar();


}, 500);

/*setInterval (function() {
    document.getElementById("rahaClickedCheat").innerHTML = game.rahaClicked;
    document.getElementById("topScoreCheat").innerHTML = Math.ceil(game.topScore);
    document.getElementById("scoreCheat").innerHTML = Math.ceil(game.score);
    document.getElementById("scorePerSecondCheat").innerHTML = Math.ceil(game.getScorePerSecond());
    document.getElementById("veroprosenttiCheat").innerHTML = game.getVeroprosentti();
    document.getElementById("totalScoreCheat").innerHTML = game.totalScore;
    document.getElementById("voimaCheat").innerHTML = game.voima;
}, 500);*/

var building = {
    mode: "purchase",
    name: [
        "Allowance",
        "Bottle Returning",
        "Lawn Mowing",
        "Summer Job",
        "Minimum Wage Job",
    ],
    cost: [
        100,
        1000,
        10000,
        100000,
        1000000,
    ],
    kuva: [
        "images/viikkoraha-1.png",
        "images/pullonkeräys-1.png",
        "images/ruohonleikkaus-template.png",
        "images/kesätyö-template.png",
        "images/minimipalkkatyö-template.png",
    ],
    amount: [
        0,
        0,
        0,
        0,
        0,
    ],
    factor: [
        1,
        5,
        15,
        30,
        50,
    ],
    number: [
        1,
        2,
        3,
        4,
        5,
    ],

    purchase: function(index) {
    if (game.checkScore(this.getCost(index))) {
        game.takeFromScore(this.getCost(index));
        this.amount[index]++;

        display.updateScore();
        display.updateShop();
        display.updateUpgrades();
        display.updateEvents();
    }
    display.updateAscensionUpgrades();
    display.updateYritysUpgrades();
    },

    sell: function(index) {
        if (this.amount[index] > 0) {
            this.amount[index]--;
            game.addToScore(this.getCost(index) * 0.6);

            display.updateScore();
            display.updateShop();
            display.updateUpgrades();
            display.updateEvents();
            display.updateAscensionUpgrades();
            display.updateYritysUpgrades();
        }
    },

    getCost: function(index) {
        return this.cost[index] * 1.15 ** this.amount[index];
    },

    switch: function(type) {
        if (type == "purchase") {
            this.mode = "purchase";
            pienyritys.mode = "purchase";
    
            document.getElementById("buyTypeButtonPlus").style.color = "green";
            document.getElementById("buyTypeButtonMinus").style.color = "white";
        } else if (type == "sell") {
            this.mode = "sell";
            pienyritys.mode = "sell";

            document.getElementById("buyTypeButtonMinus").style.color = "red";
            document.getElementById("buyTypeButtonPlus").style.color = "white";
        }
    }
};

var pienyritys = {
    mode: "purchase",
    name: "Small Business",
    cost: 10000000,
    kuva: "images/pienyritys-template.png",
    amount: 0,
    factor: 80,

    purchase: function() {
        if (game.checkScore(this.getCost())) {
            game.takeFromScore(this.getCost());
            this.amount += 1;
        }
        display.updateScore();
        display.updateShop();
        display.updateUpgrades();
        display.updateYritysUpgrades();
    },

    sell: function() {
        if (this.amount > 0) {
            this.amount--;
            game.addToScore(this.getCost() * 0.6);
        }


        display.updateScore();
        display.updateShop();
        display.updateUpgrades();
        display.updateEvents();
        display.updateAscensionUpgrades();
        display.updateYritysUpgrades();
    },

    getCost: function() {
        return this.cost * 1.15 ** this.amount;
    },


}

var upgrade = {
    name: [
        "Sticky Hands","Sticky Hands 2","Sticky Hands 3","Sticky Hands 4",
        "Clicking Combo",
        "Generous Parents","Generous Parents 2","Generous Parents 3","Generous Parents 4",
        "330ml Cans","0,5l Bottles","1,0l Bottles","1,5l Bottles",
        "Iron Blade","Steel Blade","Titanium Blade","Silver Blade",
        "Generous Employer","Generous Employer 2","Generous Employer 3","Generous Employer 4",
        "More Shifts","Overtime","Nightshift","Raise",
    ],
    description: [
        "Touching the cash produces double the amount","Touching the cash produces double the amount","Touching the cash produces double the amount","Touching the cash produces double the amount",
        "You gain combo by clicking",
        "Allowance produces double the amount","Allowance produces double the amount","Allowance produces double the amount","Allowance produces double the amount",
        "Bottle Returning produces double the amount","Bottle Returning produces double the amount","Bottle Returning produces double the amount","Bottle Returning produces double the amount",
        "Lawn Mowing produces double the amount","Lawn Mowing produces double the amount","Lawn Mowing produces double the amount","Lawn Mowing produces double the amount",
        "Summer Job produces double the amount","Summer Job produces double the amount","Summer Job produces double the amount","Summer Job produces double the amount",
        "Minimum Wage Job produces double the amount","Minimum Wage Job produces double the amount","Minimum Wage Job produces double the amount","Minimum Wage Job produces double the amount",
    ],
    image: [
        "images/stickyfingers-template.png","images/stickyfingers-template.png","images/stickyfingers-template.png","images/stickyfingers-template.png",
        "images/combo.png",
        "images/viikkoraha-1.png","images/viikkoraha-2.png","images/viikkoraha-3.png","images/viikkoraha-4.png",
        "images/pullonkeräys-1.png","images/pullonkeräys-2.png","images/pullonkeräys-3.png","images/pullonkeräys-4.png",
        "images/ruohonleikkaus-template.png","images/ruohonleikkaus-template.png","images/ruohonleikkaus-template.png","images/ruohonleikkaus-template.png",
        "images/kesätyö-template.png","images/kesätyö-template.png","images/kesätyö-template.png","images/kesätyö-template.png",
        "images/minimipalkkatyö-template.png","images/minimipalkkatyö-template.png","images/minimipalkkatyö-template.png","images/minimipalkkatyö-template.png",
    ],
    type: [
        "click","click","click","click",
        "combo",
        "building","building","building","building",
        "building","building","building","building",
        "building","building","building","building",
        "building","building","building","building",
        "building","building","building","building",
    ],
    cost: [
        500,5000,50000,500000,
        100000,
        500,5000,50000,50000,
        5000,50000,500000,5000000,
        50000,500000,5000000,50000000,
        500000,5000000,50000000,500000000,
        5000000,50000000,500000000,5000000000,
    ],
    buildingIndex: [
        -1,-1,-1,-1,
        -1,
        0,0,0,0,
        1,1,1,1,
        2,2,2,2,
        3,3,3,3,
        4,4,4,4,
    ],
    requirement: [
        100,500,1000,5000,
        200,
        5,25,50,100,
        5,25,50,100,
        5,25,50,100,
        5,25,50,100,
        5,25,50,100,
    ],
    bonus: [
        2,2,2,2,
        1,
        2,2,2,2,
        2,2,2,2,
        2,2,2,2,
        2,2,2,2,
        2,2,2,2,
    ],
    purchased: [
        false,false,false,false,
        false,
        false,false,false,false,
        false,false,false,false,
        false,false,false,false,
        false,false,false,false,
        false,false,false,false,
    ],
    tier: [
        1,2,3,4,
        1,
        1,2,3,4,
        1,2,3,4,
        1,2,3,4,
        1,2,3,4,
        1,2,3,4,
    ],

    purchase: function(index) {
        if (!this.purchased[index] && game.checkScore(this.cost[index])) {
            if (this.type[index] == "building" && building.amount[this.buildingIndex[index]] >= this.requirement[index]) {
                game.takeFromScore(this.cost[index]);
                building.factor[this.buildingIndex[index]] *= this.bonus[index];
                this.purchased[index] = true;

            } else if (this.type[index] == "click" && game.rahaClicked >= this.requirement[index]) {
                game.takeFromScore(this.cost[index]);
                game.voima *= this.bonus[index];
                this.purchased[index] = true;

            } else if (this.type[index] == "combo" && game.rahaClicked >= this.requirement[index]){
                game.takeFromScore(this.cost[index]);
                this.purchased[index] = true;
            }
        }
        display.updateUpgrades();
        display.updateScore();
    },
};

var yritysUpgrade = {
    name: [
        "Scaling",
        "Monopoly Position",
        "Sponsors",
        "Maintenance",
        "Landscapers",
        "Child Labour",
        "Providing Minimum Wage",
    ],
    description: [
        "Increases the production of your business by 10%",
        "increases the production of your business in proporion to the level of your business",
        "increases the production of your business in proporion to the level of Allowance",
        "increases the production of your business in proporion to the level of Bottle Returning",
        "increases the production of your business in proporion to the level of Lawn Mowing",
        "increases the production of your business in proporion to the level of Summer Job",
        "increases the production of your business in proporion to the level of Minimum Wage Job",
    ],
    cost: [
        100000,
        500000,
        1000000,
        10000000,
        100000000,
        1000000000,
        10000000000,
    ],
    amount: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
    ],
    factor: [
        0.1,
        0.05,
        1,
        1,
        1,
        1,
        1,
    ],
    type: [
        "solid",
        "solidScaling",
        "synergy",
        "synergy",
        "synergy",
        "synergy",
        "synergy",
    ],
    buildingIndex: [
        -1,
        -1,
        0,
        1,
        2,
        3,
        4,
    ],
    requirement: [
        0,
        0,
        50,
        50,
        50,
        50,
        50,
    ],
    image: [
        "images/kolikko-1.png",
        "images/kolikko-1.png",
        "images/kolikko-1.png",
        "images/kolikko-1.png",
        "images/kolikko-1.png",
        "images/kolikko-1.png",
        "images/kolikko-1.png",
    ],
    purchased: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
    ],
    purchase: function(index) {
        if (game.checkScore(this.cost[index])) {
                if (this.type[index] == "solid") {
                    game.takeFromScore(this.cost[index]);
                    this.amount[index]++;
                    this.cost[index] = Math.ceil(this.cost[index] * 2);
                    this.purchased[index] = true;

                } else if (this.type[index] == "solidScaling") {
                    game.takeFromScore(this.cost[index]);
                    this.amount[index]++;
                    this.cost[index] = Math.ceil(this.cost[index] * 2);
                    this.purchased[index] = true;

                } else if (this.type[index] == "synergy" && !this.purchased[index] && building.amount.at(this.buildingIndex[index]) >= this.requirement[index]) {
                    game.takeFromScore(this.cost[index]);
                    this.amount[index]++;
                    this.purchased[index] = true;
                }

            display.updateScore();
            display.updateShop();
            display.updateYritysUpgrades();
        }
    },
    getFactor: function(index) {
        var yritysFactor = 1;
        for ( let i = 0; i < yritysUpgrade.name.length; i++) {
            if (this.type[i] == "solid") {
                yritysFactor += this.factor[i] * this.amount[i];
            } else if (this.type[i] == "solidScaling") {
                yritysFactor += this.factor[i] * this.amount[i] * pienyritys.amount;
            } else if (this.type[i] == "synergy" && this.purchased[i]) {
                yritysFactor += this.factor[i] * (building.amount.at(this.buildingIndex[i]) / 10);
            }
        }
        return (yritysFactor || 1);
    }
}

var leftButton = {
    id: [
        "dummy",
        "innerHuijaus",
        "innerUhkapelaus",
        "innerEvents",
        "innerLaina",
        "notes",
    ],
    buttonId: [
        "dummy",
        "huijausAvausNappi",
        "uhkapelausAvausNappi",
        "eventsAvausNappi",
        "lainaAvausNappi",
        "notesAvausNappi",
    ],

    check: function(index) {
        for (let i = 0; i < this.id.length; i++) {
            if (i != index) {
                display.hide(i, 'auto', this.id[i], this.buttonId[i], 'leftButton');  
            }
        }
    }
}

var display = {
    suffix: [
        "k", "Mil.", "Bil.", "Trl.","Qdr.", "Qnt.", "Sxt.", "Spt.", "Oct.", "Non.", "Dec.", "Undec", "Duodec", "Tredec", "Quattuordec", "Quindec."
    ].reverse(),
    name: [
        "Small Business", 
        "Medium Business", 
        "Large Business", 
        "Firm", 
        "Large Firm",
        "Enterprise", 
        "Corporation",
        "Conglomerate",
        "Mega Firm",
        "Behemoth",
        "Juggernaut",
        "Powerhouse", 
        "Mega Corporation",
        "Empire",
        "Monolith", 
        "Monopoly"
    ],
    amount: [
        1000,
        1000000,
        1000000000,
        1000000000000,
        1000000000000000,
        Number(1000000000000000000n),
        Number(1000000000000000000000n),
        Number(1000000000000000000000000n),
        Number(1000000000000000000000000000n),
        Number(1000000000000000000000000000000n),
        Number(1000000000000000000000000000000000n),
        Number(1000000000000000000000000000000000000n),
        Number(1000000000000000000000000000000000000000n),
        Number(1000000000000000000000000000000000000000000n),
        Number(1000000000000000000000000000000000000000000000n),
        Number(1000000000000000000000000000000000000000000000000n),
    ].reverse(),

    updateClicker: function() {
        let y = game.topScore;
        let x = Math.min(6, Math.max(1, Math.ceil(getBaseLog(10, y))));
        document.getElementById("clicker").style.backgroundImage = "url('images/pääraha-"+x+".png')";
    },

    updateScore: function() {
        document.getElementById("game.score").innerHTML = this.applySuffix(game.applyCourse(), 3);
        document.getElementById("game.scorePerSecond").innerHTML = this.applySuffix(game.getScorePerSecond(), 2);
        document.getElementById("rahaClicked").innerHTML = game.rahaClicked;
        document.getElementById("veroprosentti").innerHTML = game.getVeroprosentti();
        document.getElementById("topScore").innerHTML = game.topScore;
        if (game.topScore <= game.score) {
            game.topScore = game.score;
        }
        if (game.totalScore < game.score) {
            game.totalScore += game.score;
        }
        this.updateClicker();
    },

    updateShop: function() {
        if (pienyritys.amount >= 10) {
            document.getElementById("outerYritysUpgradeAvausNappi").style.visibility = "visible";
            document.getElementById("outerYritysUpgradeAvausNappi").style.height = "auto";
        } else if (pienyritys.amount < 10) {
            document.getElementById("outerYritysUpgradeAvausNappi").style.visibility = "hidden";
            document.getElementById("outerYritysUpgradeAvausNappi").style.height = "0px";  
        }
        this.updateYritysTitle();
        document.getElementById("shopContainer").innerHTML = "";
        for (var i = 0; i < building.name.length; i++) {
            let x = (building.name[i] == "Allowance");
            /*SAA OSTAA*/
            if (game.topScore >= building.getCost(i) * 0.6 && game.checkScore(building.getCost(i)) && ((building.amount.at(Math.max(0, [i] - 1)) >= 1 || x) || building.amount[i] > 0)) {
                document.getElementById("shopContainer").innerHTML += '<table class="buildingButton buildingButton-affordable" onmouseover="infoCard('+i+', \'building\');" onClick="building.'+building.mode+'('+i+')"><tr><td id="image"><img draggable="false" class="building-kuva" src="'+building.kuva[i]+'"></td><td class="building-nameAndCost"><p><span class="building-name">'+building.name[i]+'</span><span class="building-factor">'+display.applySuffix(building.factor[i], 2)+' /s</span></p><p><span class="building-cost">'+display.applySuffix(building.getCost(i), 2)+'</span><span class="ostonappi-upgrade-image"></span></p></td><td class="outer-building-amount"><span class="building-amount">'+display.applySuffix(building.amount[i], 3)+'</span></td></tr></table>';
            /*NÄKYY INFO MUTTA EI SAA OSTAA*/
            } else if (game.topScore >= building.getCost(i) * 0.6 && !game.checkScore(building.getCost(i)) && ((building.amount.at( [i] - 1)) >= 1 || x) || building.amount[i] > 0) {
                document.getElementById("shopContainer").innerHTML += '<table class="buildingButton buildingButton-unaffordable" onmouseover="infoCard('+i+', \'building-unaffordable\');" onClick="building.'+building.mode+'('+i+')"><tr><td id="image"><img draggable="false" class="building-kuva" src="'+building.kuva[i]+'"></td><td class="building-nameAndCost"><p><span class="building-name">'+building.name[i]+'</span><span class="building-factor">'+display.applySuffix(building.factor[i], 2)+' /s</span></p><p><span class="building-cost building-cost-unaffordable">'+display.applySuffix(building.getCost(i), 2)+'</span><span class="ostonappi-upgrade-image"></span></p></td><td class="outer-building-amount"><span class="building-amount">'+display.applySuffix(building.amount[i], 3)+'</span></td></tr></table>';
            /*EI NÄY INFO*/
            } else if (!game.checkScore(building.getCost(i)) && (building.amount.at([i] - 1) >= 1 || x)) {
                document.getElementById("shopContainer").innerHTML += '<table onmouseover="infoCard('+i+', \'???\')" class="buildingButton buildingButton-locked"><tr><td id="image"><img draggable="false" class="building-kuva" src="images/locked-template.png"></td><td class="building-nameAndCost"><p><span class="building-name">???</span><span class="building-factor">??? /s</span></p><p><span class="building-cost">???</span><span id="ostonappi-upgrade-image"></span></p></td><td class="outer-building-amount"><span class="building-amount">?</span></td></tr></table>';
            }
        }
        // saa ostaa
        if (game.topScore >= pienyritys.getCost() * 0.6 &&  game.checkScore(pienyritys.getCost()) && (building.amount.at(-1) >= 1 || pienyritys.amount > 0)) {
            document.getElementById("shopContainer").innerHTML += '<table  onmouseover="infoCard('+i+', \'pienyritys\');" class="buildingButton buildingButton-affordable" onClick="pienyritys.'+pienyritys.mode+'();"><tr><td id="image"><img draggable="false" class="building-kuva" src="'+pienyritys.kuva+'"></td><td class="building-nameAndCost"><p><span class="building-name">'+display.updateYritysTitle()+'</span><span class="building-factor" id="pienYritysFactor">'+display.applySuffix(Math.trunc(pienyritys.factor * yritysUpgrade.getFactor()), 2)+' /s</span></p><p><span class="building-cost">'+display.applySuffix(pienyritys.getCost(), 2)+'</span><span class="ostonappi-upgrade-image"></span></p></td><td class="outer-building-amount"><span class="building-amount">'+display.applySuffix(pienyritys.amount, 3)+'</span></td></tr></table>';
        // info mutta ei saa ostaa
        } else if (game.topScore >= pienyritys.getCost() * 0.6 && !game.checkScore(pienyritys.getCost()) && (building.amount.at(-1) >= 1 || pienyritys.amount > 0)) {
            document.getElementById("shopContainer").innerHTML += '<table  onmouseover="infoCard('+i+', \'pienyritys-unaffordable\');" class="buildingButton buildingButton-unaffordable" onClick="pienyritys.'+pienyritys.mode+'();"><tr><td id="image"><img draggable="false" class="building-kuva" src="'+pienyritys.kuva+'"></td><td class="building-nameAndCost"><p><span class="building-name">'+display.updateYritysTitle()+'</span><span class="building-factor" id="pienYritysFactor">'+display.applySuffix(Math.trunc(pienyritys.factor * yritysUpgrade.getFactor()), 2)+' /s</span></p><p><span class="building-cost building-cost-unaffordable">'+display.applySuffix(pienyritys.getCost(), 2)+'</span><span class="ostonappi-upgrade-image"></span></p></td><td class="outer-building-amount"><span class="building-amount">'+display.applySuffix(pienyritys.amount, 3)+'</span></td></tr></table>';
        // ei infoa
        } else if (!game.checkScore(pienyritys.getCost()) && building.amount.at(4) >= 1) {
            document.getElementById("shopContainer").innerHTML += '<table onmouseover="infoCard('+i+', \'???\')" class="buildingButton buildingButton-locked"><tr><td id="image"><img draggable="false" class="building-kuva" src="images/locked-template.png"></td><td class="building-nameAndCost"><p><span class="building-name">???</span><span class="building-factor">??? /s</span></p><p><span class="building-cost">???</span><span id="ostonappi-upgrade-image"></span></p></td><td class="outer-building-amount"><span class="building-amount">?</span></td></tr></table>';
        }

    },

    updateYritysTitle: function() {
        let x = getBaseLog(9, pienyritys.factor * pienyritys.amount * yritysUpgrade.getFactor());
        if (display.name.at(x) == undefined) {
            return "Small Business";
        } else {
            return display.name.at(x);
        }
    },

    applySuffix: function(amount, decimal) {
        let x = amount;
        for (let i = 0; i < this.suffix.length; i++) {
            if (x >= this.amount[i]) {
                return (x / this.amount[i]).toFixed(decimal) + this.suffix[i];
            } else if (x < 1000) {
                return Math.ceil(x);
            }
        }
    },

    updateUpgrades: function() {
        document.getElementById("upgradeContainer").innerHTML = "";
        for ( let i = 0; i < upgrade.name.length; i++) {
            if (!upgrade.purchased[i]) {
                if (upgrade.type[i] == "building" && building.amount[upgrade.buildingIndex[i]] >= upgrade.requirement[i] && game.checkScore(upgrade.cost[i])) {
                    document.getElementById("upgradeContainer").innerHTML += '<img draggable="false" onmouseover="infoCard('+i+', \'upgrade\');" class="upgrade" src="'+upgrade.image[i]+'" onclick="upgrade.purchase('+i+')">';
                } else if (upgrade.type[i] == "building" && building.amount[upgrade.buildingIndex[i]] >= upgrade.requirement[i] &&  !game.checkScore(upgrade.cost[i])) {
                    document.getElementById("upgradeContainer").innerHTML += '<img draggable="false" onmouseover="infoCard('+i+', \'upgrade-unaffordable\');" " class="upgrade upgrade-unaffordable" src="'+upgrade.image[i]+'" onclick="upgrade.purchase('+i+')">';
                    /*väli*/
                } else if (upgrade.type[i] == "click" && game.rahaClicked >= upgrade.requirement[i] && game.checkScore(upgrade.cost[i])) {
                    document.getElementById("upgradeContainer").innerHTML += '<img draggable="false" onmouseover="infoCard('+i+', \'upgrade\');" " class="upgrade" src="'+upgrade.image[i]+'" onclick="upgrade.purchase('+i+')">';
                } else if (upgrade.type[i] == "click" && game.rahaClicked >= upgrade.requirement[i] && !game.checkScore(upgrade.cost[i])) {
                    document.getElementById("upgradeContainer").innerHTML += '<img draggable="false" onmouseover="infoCard('+i+', \'upgrade-unaffordable\');" " class="upgrade upgrade-unaffordable" src="'+upgrade.image[i]+'" onclick="upgrade.purchase('+i+')">';
                    /*väli*/
                } else if (upgrade.type[i] == "combo" && game.rahaClicked >= upgrade.requirement[i] && game.checkScore(upgrade.cost[i])) {
                    document.getElementById("upgradeContainer").innerHTML += '<img draggable="false" onmouseover="infoCard('+i+', \'upgrade\');" " class="upgrade" src="'+upgrade.image[i]+'" onclick="upgrade.purchase('+i+')">';
                } else if (upgrade.type[i] == "combo" && game.rahaClicked >= upgrade.requirement[i] && !game.checkScore(upgrade.cost[i])) {
                    document.getElementById("upgradeContainer").innerHTML += '<img draggable="false" onmouseover="infoCard('+i+', \'upgrade-unaffordable\');" " class="upgrade upgrade-unaffordable" src="'+upgrade.image[i]+'" onclick="upgrade.purchase('+i+')">';
                    /*väli*/
                }
            }
        }
    },

    updateYritysUpgrades: function() {
        document.getElementById("yritysUpgradeContainer").innerHTML = "";
        if (pienyritys.amount >= 10) {
            for ( let i = 0; i < yritysUpgrade.name.length; i++) {
                if (yritysUpgrade.type[i] == "solid" && game.checkScore(yritysUpgrade.cost[i])) {
                    document.getElementById("yritysUpgradeContainer").innerHTML += '<div onmouseover="infoCard('+i+', \'yritysUpgrade\');" class="solidYritysUpgrade yritysUpgrade" onClick="yritysUpgrade.purchase('+i+')"><span class="yritysUpgradeName">'+yritysUpgrade.name[i]+'</span><br><span class="yritysUpgradePrice">'+display.applySuffix(yritysUpgrade.cost[i], 2)+'</span><span class="yritysUpgradeAmount">'+display.applySuffix(yritysUpgrade.amount[i], 3)+'</span></div>';
                } else if (yritysUpgrade.type[i] == "solid" && !game.checkScore(yritysUpgrade.cost[i])) {
                    document.getElementById("yritysUpgradeContainer").innerHTML += '<div onmouseover="infoCard('+i+', \'yritysUpgrade\');" class="solidYritysUpgradeUnaffordable yritysUpgrade" onClick="yritysUpgrade.purchase('+i+')"><span class="yritysUpgradeName">'+yritysUpgrade.name[i]+'</span><br><span class="yritysUpgradePrice">'+display.applySuffix(yritysUpgrade.cost[i], 2)+'</span><span class="yritysUpgradeAmount">'+display.applySuffix(yritysUpgrade.amount[i], 3)+'</span></div>';
                } else if (yritysUpgrade.type[i] == "solidScaling" && game.checkScore(yritysUpgrade.cost[i])) {
                    document.getElementById("yritysUpgradeContainer").innerHTML += '<div onmouseover="infoCard('+i+', \'yritysUpgrade\');" class="solidScalingYritysUpgrade yritysUpgrade" onClick="yritysUpgrade.purchase('+i+')"><span class="yritysUpgradeName">'+yritysUpgrade.name[i]+'</span><br><span class="yritysUpgradePrice">'+display.applySuffix(yritysUpgrade.cost[i], 2)+'</span><span class="yritysUpgradeAmount">'+display.applySuffix(yritysUpgrade.amount[i], 3)+'</span></div>';
                } else if (yritysUpgrade.type[i] == "solidScaling" && !game.checkScore(yritysUpgrade.cost[i])) {
                    document.getElementById("yritysUpgradeContainer").innerHTML += '<div onmouseover="infoCard('+i+', \'yritysUpgrade\');" class="solidScalingYritysUpgradeUnaffordable yritysUpgrade" onClick="yritysUpgrade.purchase('+i+')"><span class="yritysUpgradeName">'+yritysUpgrade.name[i]+'</span><br><span class="yritysUpgradePrice">'+display.applySuffix(yritysUpgrade.cost[i], 2)+'</span><span class="yritysUpgradeAmount">'+display.applySuffix(yritysUpgrade.amount[i], 3)+'</span></div>';
                } else if (yritysUpgrade.type[i] == "synergy" && !yritysUpgrade.purchased[i] && building.amount.at(yritysUpgrade.buildingIndex[i]) >= yritysUpgrade.requirement[i] && game.checkScore(yritysUpgrade.cost[i])) {
                    document.getElementById("yritysUpgradeContainer").innerHTML += '<div onmouseover="infoCard('+i+', \'yritysUpgrade\');" class="synergyYritysUpgrade yritysUpgrade" onClick="yritysUpgrade.purchase('+i+')"><span class="yritysUpgradeName">'+yritysUpgrade.name[i]+'</span><br><span class="yritysUpgradePrice">'+display.applySuffix(yritysUpgrade.cost[i], 2)+'</span></div>';
                } else if (yritysUpgrade.type[i] == "synergy" && !yritysUpgrade.purchased[i] && building.amount.at(yritysUpgrade.buildingIndex[i]) >= yritysUpgrade.requirement[i] && !game.checkScore(yritysUpgrade.cost[i])) {
                    document.getElementById("yritysUpgradeContainer").innerHTML += '<div onmouseover="infoCard('+i+', \'yritysUpgrade\');" class="synergyYritysUpgradeUnaffordable yritysUpgrade" onClick="yritysUpgrade.purchase('+i+')"><span class="yritysUpgradeName">'+yritysUpgrade.name[i]+'</span><br><span class="yritysUpgradePrice">'+display.applySuffix(yritysUpgrade.cost[i], 2)+'</span></div>';
                }
            }
        }
    },

    updateAscensionUpgrades: function() {
        let elements = document.getElementsByClassName("ascensionLocked");
        for (let i = 0; i < elements.length; i++) {
            if (ascension.ascended) {
                elements[i].style.display = "block";
            } else if (!ascension.ascended) {
                elements[i].style.display = "none";
            }
        }

        document.getElementById("innerAscensionUpgrades").innerHTML += '<div id="ascensionCurrency"></div>';
        document.getElementById("innerAscensionUpgrades").innerHTML += '<button onClick="display.toggle(\'innerSectionLeft\',\'100%\'); display.toggle(\'ascensionUpgrades\',\'0\')" id="closeAscensionUpgradesButton">X</button>';
        document.getElementById("ascensionCurrency").innerHTML = ascension.currency;

        document.getElementById("ascensionUpgradeContainerTax").innerHTML = '<div class="ascensionUpgradeContainerTitle">Taxation</div>';
        document.getElementById("ascensionUpgradeContainerUnlock").innerHTML = '<div class="ascensionUpgradeContainerTitle">Unlock</div>';
        document.getElementById("ascensionUpgradeContainerIncome").innerHTML = '<div class="ascensionUpgradeContainerTitle">Income</div>';
        document.getElementById("ascensionUpgradeContainerClicking").innerHTML = '<div class="ascensionUpgradeContainerTitle">Clicking</div>';
        document.getElementById("ascensionUpgradeContainerMisc").innerHTML = '<div class="ascensionUpgradeContainerTitle">Misc.</div>';

        for (let i = 0; i < ascendUpgrade.name.length; i++) {
            if (ascension.ascended && ascendUpgrade.type[i] == "Unlock" && ascendUpgrade.amount[i] < 1) {
                document.getElementById("ascensionUpgradeContainer" + ascendUpgrade.type[i]).innerHTML += '<div class="ascendUpgrade" onClick="ascendUpgrade.purchase('+i+');" onmouseover="infoCard('+i+', \'ascensionUpgrade\');" onmouseout="infoCard('+i+', \'off\');"><span class="ascendUpgradeName">'+ascendUpgrade.name[i]+'</span><div class="ascendUpgradePrice">'+display.applySuffix(ascendUpgrade.cost[i], 3);+'</div></div>';
            } else if (ascension.ascended && ascendUpgrade.type[i] != "Unlock") {
                document.getElementById("ascensionUpgradeContainer" + ascendUpgrade.type[i]).innerHTML += '<div class="ascendUpgrade" onClick="ascendUpgrade.purchase('+i+');" onmouseover="infoCard('+i+', \'ascensionUpgrade\');" onmouseout="infoCard('+i+', \'off\');"><span class="ascendUpgradeName">'+ascendUpgrade.name[i]+'</span><div class="ascendUpgradePrice">'+display.applySuffix(ascendUpgrade.getCost(i), 3);+'</div><div class="ascendUpgradeAmount">'+ascendUpgrade.amount[i]+'</div></div>';
            }
        }
    },

    updateEvents: function() {
        document.getElementById("eventsUpgradeContainer").innerHTML = "";
        for (let i = 0; i < events.name.length; i++) {
            if (events.unlocked[i]) {
                if (game.checkScore(events.cost[i]) && events.useCoolDown[i] <= 0) {
                    document.getElementById("eventsUpgradeContainer").innerHTML += '<div class="eventsUpgrade" onClick="events.purchase('+i+')" onmouseover="infoCard('+i+',\'events\')"><span class="eventsUpgradeName">'+events.name[i]+'</span><span class="eventsUpgradeCost">'+display.applySuffix(events.cost[i], 1)+'</span><span class="eventsUpgradeBonus">'+events.bonus[i]+'x</span><span class="eventsUpgradeDuration">'+events.duration[i]+'s</span></div>';
                } else if (events.active[i]) {
                    document.getElementById("eventsUpgradeContainer").innerHTML += '<div class="eventsUpgrade eventsUpgrade-active" onmouseover="infoCard('+i+',\'events\')"><span class="eventsUpgradeName">'+events.name[i]+'</span><span class="eventsUpgradeCost">'+display.applySuffix(events.cost[i], 1)+'</span><span class="eventsUpgradeBonus">'+events.bonus[i]+'x</span><span class="eventsUpgradeDuration">'+events.useDuration[i]+'s</span></div>';
                } else if (!game.checkScore(events.cost[i]) && events.useCoolDown[i] <= 0) {
                    document.getElementById("eventsUpgradeContainer").innerHTML += '<div class="eventsUpgrade eventsUpgrade-unaffordable" onmouseover="infoCard('+i+',\'events\')"><span class="eventsUpgradeName">'+events.name[i]+'</span><span class="eventsUpgradeCost">'+display.applySuffix(events.cost[i], 1)+'</span><span class="eventsUpgradeBonus">'+events.bonus[i]+'x</span><span class="eventsUpgradeDuration">'+events.duration[i]+'s</span></div>';
                } else if (!game.checkScore(events.cost[i]) || events.useCoolDown[i] > 0) {
                    document.getElementById("eventsUpgradeContainer").innerHTML += '<div class="eventsUpgrade eventsUpgrade-unaffordable" onmouseover="infoCard('+i+',\'events\')"><span class="eventsUpgradeName">'+events.name[i]+'</span><span class="eventsUpgradeCost">'+display.applySuffix(events.cost[i], 1)+'</span><span class="eventsUpgradeBonus">'+events.bonus[i]+'x</span><span class="eventsUpgradeDuration">'+events.getCoolDown(i)+'</span></div>';
                }
            } else {
                if (i <= 4 && building.amount[i] >= 100) {
                    document.getElementById("eventsUpgradeContainer").innerHTML += '<div class="eventsUpgrade eventsUpgradeUnlock" onClick="events.unlock('+i+')" onmouseover="infoCard('+i+',\'events\')"><div class="innereventsUpgradeUnlock"><div class="eventsUpgradeUnlockFont">UNLOCK</div><div class="eventsUpgradeUnlockText"> '+building.amount[i]+'/100 '+building.name[i]+'</div><div></div>';
                } else if (i <= 4 && building.amount[i] < 100) {
                    document.getElementById("eventsUpgradeContainer").innerHTML += '<div class="eventsUpgrade eventsUpgrade-unaffordable eventsUpgradeUnlock" onmouseover="infoCard('+i+',\'events\')"><div class="innereventsUpgradeUnlock"><div class="eventsUpgradeUnlockFont">UNLOCK</div><div class="eventsUpgradeUnlockText"> '+building.amount[i]+'/100 '+building.name[i]+'</div><div></div>';
                } else if (i > 4 && pienyritys.amount >= 100) {
                    document.getElementById("eventsUpgradeContainer").innerHTML += '<div class="eventsUpgrade eventsUpgradeUnlock" onClick="events.unlock('+i+')" onmouseover="infoCard('+i+',\'events\')"><div class="innereventsUpgradeUnlock"><div class="eventsUpgradeUnlockFont">UNLOCK</div><div class="eventsUpgradeUnlockText"> '+pienyritys.amount+'/100 '+this.updateYritysTitle()+'</div><div></div>';
                } else if (i > 4 && pienyritys.amount < 100) {
                    document.getElementById("eventsUpgradeContainer").innerHTML += '<div class="eventsUpgrade eventsUpgrade-unaffordable eventsUpgradeUnlock" onmouseover="infoCard('+i+',\'events\')"><div class="innereventsUpgradeUnlock"><div class="eventsUpgradeUnlockFont">UNLOCK</div><div class="eventsUpgradeUnlockText"> '+pienyritys.amount+'/100 '+this.updateYritysTitle()+'</div><div></div>';
                }
            }
            
        }
    },

    toggleUpgrade: function(type) {
        if (type == "show") {
            document.getElementById("upgradeContainer").style.height = "auto";
        } else if (type == "hide") {
            document.getElementById("upgradeContainer").style.height = "75px";
        }
    },

    changeSaved: function() {
        document.getElementById("saving").innerHTML = "Save";
        document.getElementById("saved").innerHTML = "X";
    },

    show: function(index, height, id, buttonId, classList) {
            document.getElementById(id).style.display = "block";
            document.getElementById(id).style.height = height;
            document.getElementById(buttonId).innerHTML = '<button onClick="display.hide(\'' + index + '\', \'' + height + '\', \'' + id + '\', \'' + buttonId + '\', \'' + classList + '\');" class="'+classList+'">[-]</button>';
            leftButton.check(index);
    },
    hide: function(index, height, id, buttonId, classList) {
            document.getElementById(id).style.display = "none";
            document.getElementById(id).style.height = "0px";
            document.getElementById(buttonId).innerHTML = '<button onClick="display.show(\'' + index + '\', \'' + height + '\', \'' + id + '\', \'' + buttonId + '\', \'' + classList + '\');" class="'+classList+'">[+]</button>';
    },

    toggle: function(id, height) {
        if (height == "0") {
            document.getElementById(id).style.height = "0px";
            document.getElementById(id).style.visibility = "hidden";  
        } else {
            document.getElementById(id).style.height = height;
            document.getElementById(id).style.visibility = "visible";
        }
    },

     updateCheat: function() {
        if (inputValue == "huijaa") {
            document.getElementById("huijaus").style.visibility = "visible";
            document.getElementById("huijaus").style.height = "auto";
            document.getElementById("innerUhkapelaus").style.display = "none";
        } else if (inputValue == "hanes") {
            document.getElementById("clicker").style.backgroundImage = "url('images/hannes.png')";
            document.getElementById("otsikko").innerHTML = "Hane Simulator 2 <span id='version'>0.000</span>";
            document.getElementById("alaotsikko").innerHTML = "Hane Simulator 1 tulossa pian...";
            document.getElementById("credits").innerHTML = "by Hane";
            document.getElementById("unit").innerHTML = "Hanet";
        }
    },

    updateNotes: function() {
        /*fetch("patchnotes.txt")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Tiedoston lataus epäonnistui");
                }
                return response.text();
            })
            .then(data => {
                const fileContent = data;
                console.log("Tiedoston sisältö:", fileContent);
            })
            .catch(error => console.error("Virhe:", error));
        document.getElementById("notes").innerHTML = filecontent;*/
    }
};

function saveGame() {
    var gameSave = {
        score: game.score,
        scorePerSecond: game.getScorePerSecond(),
        totalScore: game.totalScore,
        voima: game.voima,
        rahaClicked: game.rahaClicked,
        versio: game.versio,
        veroprosentti: game.veroprosentti,
        maxVero: globalVariable.maxVero,
        topScore: game.topScore,

        buildingAmount: building.amount,
        buildingFactor: building.factor,

        upgradePurchased: upgrade.purchased,

        pienyritysAmount: pienyritys.amount,
        pienyritysFactor: pienyritys.factor,
        pienyritysCost: pienyritys.cost,

        yritysUpgradeCost: yritysUpgrade.cost,
        yritysUpgradeAmount: yritysUpgrade.amount,
        yritysUpgradePurchased: yritysUpgrade.purchased,

        lainaJäljellä: laina.jäljellä,
        lainaAmount: globalVariable.lainaAmount,
        active: globalVariable.active,

        course: globalVariable.course,

        ascensionCurrency: ascension.currency,
        ascended: ascension.ascended,
        ascendUpgradeAmount: ascendUpgrade.amount,
        ascendVoimaMultiplier: ascendUpgrade.ascendVoimaMultiplier,

        eventsUseCoolDown: events.useCoolDown,
        eventsUseDuration: events.useDuration,
        eventsActive: events.active,
        eventsUnlocked: events.unlocked,
    };
    localStorage.setItem("gameSave", JSON.stringify(gameSave));
    document.getElementById("saving").innerHTML = "Saving...";
    document.getElementById("saved").innerHTML = "✓";
    setTimeout(display.changeSaved,2000);
}

function loadGame() {
    var savedGame = JSON.parse(localStorage.getItem("gameSave"));
    if (localStorage.getItem("gameSave") !== null) {
        //if (typeof savedGame. !== "undefined")  = savedGame. ;
        if (typeof savedGame.score !== "undefined") game.score = savedGame.score;
        if (typeof savedGame.scorePerSecond !== "undefined") game.scorePerSecond = savedGame.scorePerSecond;
        if (typeof savedGame.totalScore !== "undefined") game.totalScore = savedGame.totalScore;
        if (typeof savedGame.voima !== "undefined") game.voima = savedGame.voima;
        if (typeof savedGame.rahaClicked !== "undefined") game.rahaClicked = savedGame.rahaClicked;
        if (typeof savedGame.versio !== "undefined") game.versio = savedGame.versio;
        if (typeof savedGame.veroprosentti !== "undefined") game.veroprosentti = savedGame.veroprosentti;
        if (typeof savedGame.topScore !== "undefined") game.topScore = savedGame.topScore;
        if (typeof savedGame.pienyritysAmount !== "undefined") pienyritys.amount = savedGame.pienyritysAmount;
        if (typeof savedGame.pienyritysFactor !== "undefined") pienyritys.factor = savedGame.pienyritysFactor;
        if (typeof savedGame.pienyritysCost !== "undefined") pienyritys.cost = savedGame.pienyritysCost;
        if (typeof savedGame.lainaJäljellä !== "undefined") laina.jäljellä = savedGame.lainaJäljellä;
        if (typeof savedGame.lainaAmount !== "undefined") globalVariable.lainaAmount = savedGame.lainaAmount;
        if (typeof savedGame.active !== "undefined") globalVariable.active = savedGame.active;
        if (typeof savedGame.course !== "undefined") globalVariable.course = savedGame.course;
        if (typeof savedGame.ascensionCurrency !== "undefined") ascension.currency = savedGame.ascensionCurrency;
        if (typeof savedGame.ascended !== "undefined") ascension.ascended = savedGame.ascended;
        if (typeof savedGame.maxVero !== "undefined") globalVariable.maxVero = savedGame.maxVero;
        if (typeof savedGame.ascendVoimaMultiplier !== "undefined") ascendUpgrade.ascendVoimaMultiplier = savedGame.ascendVoimaMultiplier;


        if (typeof savedGame.buildingAmount !== "undefined") {
            for ( let i = 0; i < savedGame.buildingAmount.length; i++) {
                building.amount[i] = savedGame.buildingAmount[i];
            }
        }

        if (typeof savedGame.buildingFactor !== "undefined") {
            for ( let i = 0; i < savedGame.buildingFactor.length; i++) {
                building.factor[i] = savedGame.buildingFactor[i];
            }
        }

        if (typeof savedGame.upgradePurchased !== "undefined") {
            for ( let i = 0; i < savedGame.upgradePurchased.length; i++) {
                upgrade.purchased[i] = savedGame.upgradePurchased[i];
            }
        }

        if (typeof savedGame.yritysUpgradeCost !== "undefined") {
            for ( let i = 0; i < savedGame.yritysUpgradeCost.length; i++) {
                yritysUpgrade.cost[i] = savedGame.yritysUpgradeCost[i];
            }
        }

        if (typeof savedGame.yritysUpgradeAmount !== "undefined") {
            for ( let i = 0; i < savedGame.yritysUpgradeAmount.length; i++) {
                yritysUpgrade.amount[i] = savedGame.yritysUpgradeAmount[i];
            }
        }

        if (typeof savedGame.yritysUpgradePurchased !== "undefined") {
            for ( let i = 0; i < savedGame.yritysUpgradePurchased.length; i++) {
                yritysUpgrade.purchased[i] = savedGame.yritysUpgradePurchased[i];
            }
        }

        if (typeof savedGame.ascendUpgradeAmount !== "undefined") {
            for ( let i = 0; i < savedGame.ascendUpgradeAmount.length; i++) {
                ascendUpgrade.amount[i] = savedGame.ascendUpgradeAmount[i];
            }
        }

        if (typeof savedGame.eventsUseCoolDown !== "undefined") {
            for ( let i = 0; i < savedGame.eventsUseCoolDown.length; i++) {
                events.useCoolDown[i] = savedGame.eventsUseCoolDown[i];
            }
        }

        if (typeof savedGame.eventsUseDuration !== "undefined") {
            for ( let i = 0; i < savedGame.eventsUseDuration.length; i++) {
                events.useDuration[i] = savedGame.eventsUseDuration[i];
            }
        }

        if (typeof savedGame.eventsActive !== "undefined") {
            for ( let i = 0; i < savedGame.eventsActive.length; i++) {
                events.active[i] = savedGame.eventsActive[i];
            }
        }

        if (typeof savedGame.eventsUnlocked !== "undefined") {
            for ( let i = 0; i < savedGame.eventsUnlocked.length; i++) {
                events.unlocked[i] = savedGame.eventsUnlocked[i];
            }
        }
    }
}

let clickTimer = null;

function onClickStop() {
    console.log("klikkaus loppui");
    startInterval_comboClear();
}

let intervalId1;

function startInterval_comboClear() {
    intervalId1 = setInterval(() => {
        if (game.combo >= 2) {
            game.combo /= 1.05;
            game.combo--;
        } else {
            game.combo = 0;
            clearInterval(intervalId1);
        }
    }, 100);
}

document.getElementById("clicker").addEventListener("click", function(event) {
    game.rahaClicked++;
    game.addToScore(game.getVoima());

    if(event.target.id != "clicker") return;
    //clickEffect(event);
    clickEffect2(event);

    for (let i = 0; i < upgrade.name.length; i++) {
        if (upgrade.name[i] == "Clicking Combo" && upgrade.purchased[i]) {
            game.combo++;
            if (clickTimer) {
                clearTimeout(clickTimer);
            }
            clickTimer = setTimeout(onClickStop, 1000);
            clearInterval(intervalId1);
        }
    }
}, false);

document.addEventListener('keydown', (e) => {
    if (e.code === "Space") {
        game.rahaClicked++;
        game.addToScore(game.getVoima());
    }
});

setInterval (function() {
    saveGame();
}, 30000);

function resetGame () {
if (confirm("Ootko ihan varma")) {
    var gameSave = {};
    localStorage.setItem("gameSave", JSON.stringify(gameSave));
    location.reload();
    }
}	

window.onload = function() {
    loadGame();
    display.updateClicker();
    display.updateScore();
    display.applySuffix();
    display.updateUpgrades();
    display.updateShop();
    display.updateCheat();
    display.updateEvents();
    display.updateNotes();

    //display.show(4, '300px','notes','notesAvausNappi','leftButton');
    leftButton.check();

    laina.startInterval();
    laina.checkLaina();
    ascension.progressBar();
    display.updateYritysUpgrades();
    updateCourse();
    display.updateAscensionUpgrades();
    ascendUpgrade.refreshUnlocks();

    building.switch("purchase");

    setInterval(function() {
        var t = new Date().getTime();
        game.addToScore(game.getScorePerSecond() * ((t - globalVariable.current) / 1000));
        globalVariable.current = t

        display.updateScore();
        ascension.progressBar();
        document.getElementById("combo").innerHTML = display.applySuffix(Math.floor(game.combo), 2);
        document.getElementById("comboMultiplier").innerHTML = (game.getComboMultiplier()).toFixed(2) + "x";
        document.getElementById("comboContainer").style.opacity = Math.min(1, game.combo / 10);
    }, 1000 / globalVariable.fps);

    console.log(globalVariable.lainaAmount);
    document.getElementById("laina-amount").innerHTML = globalVariable.lainaAmount;
    document.getElementById("course").innerHTML = globalVariable.course;
    document.getElementById("ascensionCurrency").innerHTML = ascension.currency;
    document.getElementById("laina-jäljellä").innerHTML = Math.trunc(laina.jäljellä / 60) + " minuuttia";
    document.getElementById("version").innerHTML ="v." + (game.versio).toFixed(3);
}

function randomNumber(min, max) {
    return Math.round(Math.random() * (max-min) + min);
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
  }

function fadeOut(element, duration, finalOpacity, callback) {
    let opacity = 1;

    let elementFadingInterval = window.setInterval (function() {
        opacity -= 50 / duration;

        if (opacity <= finalOpacity) {
            clearInterval(elementFadingInterval);
            callback();
        }

        element.style.opacity = opacity;
    }, 50);
}

/*function clickEffect(event) {
    let clicker = document.getElementById("clicker");
    let element = document.createElement("div");

    let clickerOffset = clicker.getBoundingClientRect();
    let position = {
        x: event.pageX - clickerOffset.left + randomNumber(-25, -15),
        y: event.pageY - clickerOffset.top
    };

    element.textContent = "+" + game.voima;
    element.classList.add("number", "unselectable", "click-numero");
    element.classList.remove("päänapukka");
    element.style.left = position.x + "px";
    element.style.top = position.y + "px";

    clicker.appendChild(element);

    let movementInterval = window.setInterval (function() {
        if (typeof element == "undefined" && element == null) clearInterval(movementInterval);
        
        position.y--;
        element.style.top = position.y + "px";
    }, 10);

    fadeOut(element, 3000, 0.5, function() {
        element.remove();
    });
}*/

function clickEffect2(event) {
    let suunta = randomNumber(1,360);

    let clicker = document.getElementById("clicker");
    let element = document.createElement("div");

    let clickerOffset = clicker.getBoundingClientRect();
    let position = {
        x: event.pageX - clickerOffset.left + randomNumber(-25, -15),
        y: event.pageY - clickerOffset.top
    };

    element.textContent = "+" + display.applySuffix(game.getVoima(), 2);
    element.classList.add("number", "unselectable", "click-kuva");
    element.classList.remove("päänapukka");
    element.style.left = position.x + "px";
    element.style.top = position.y + "px";

    clicker.appendChild(element);

    let movementInterval = window.setInterval (function() {
        if (typeof element == "undefined" && element == null) clearInterval(movementInterval);

        position.y -= Math.sin(suunta) * 8;
        position.x += Math.cos(suunta) * 8;

        element.style.top = position.y + "px";
        element.style.left = position.x + "px";
    }, 10);

    fadeOut(element, 500, 0.5, function() {
        element.remove();
    });
}

function changeEffect(id, amount) {
        let clicker = document.getElementById(id);

    let element = document.createElement("div");

    let clickerOffset = clicker.getBoundingClientRect();
    let position = {
        x: id.pageX - clickerOffset.left,
        y: id.pageY - clickerOffset.top
    };

    element.textContent = amount;
    element.style.left = position.x + "px";
    element.style.top = position.y + "px";

    clicker.appendChild(element);

    let movementInterval = window.setInterval (function() {
        if (typeof element == "undefined" && element == null) clearInterval(movementInterval);
        
        position.y--;
        element.style.top = position.y + "px";
    }, 10);

    fadeOut(element, 3000, 0.5, function() {
        element.remove();
    });
}

var uhkapelaus = {
    bet: 1000,
    factor: 10,
    voitot: 0,
    profit: 0,
    purchased: false,

    allIn: function() {
        if (game.checkScore(1000)) {
            this.bet = Math.floor(game.score);
            document.getElementById("bet").innerHTML = this.bet;
        }
    },
    allOut: function() {
        this.bet = 1000;
        document.getElementById("bet").innerHTML = this.bet;
    },
    kasvataBet: function() {
        if (this.bet < game.score) {
            this.bet += 1000;
        }
        document.getElementById("bet").innerHTML = this.bet;
    },
    vähennäBet: function() {
        if (this.bet > 1000) {
            this.bet -= 1000;
        }
        if (this.bet < 1000) {
            this.bet = 1000;
        }
        document.getElementById("bet").innerHTML = this.bet;
    },
    kasvataFactor: function() {
        this.factor++;
        document.getElementById("factor").innerHTML = this.factor;
        document.getElementById("factor2").innerHTML = this.factor;
    },
    vähennäFactor: function() {
        if (this.factor > 2) {
            this.factor--;
        }
        document.getElementById("factor").innerHTML = this.factor;
        document.getElementById("factor2").innerHTML = this.factor;
    },
    pelaa: function() {
        if (game.checkScore(this.bet)) {
            game.takeFromScore(this.bet);
            display.updateScore();

            let numero = randomNumber(1, this.factor);

            if (numero == 1) {
                let voitto = this.bet * this.factor;
                game.addToScore(voitto);
                this.voitot += 1;
                document.getElementById("tulos").innerHTML = " YOU WON " + voitto;
                document.getElementById("voitot").innerHTML += "(" + this.voitot + ")" + " YOU WON " + voitto + '<br>';
                this.profit += voitto;
                this.profit -= this.bet;
            } else {
                document.getElementById("tulos").innerHTML = " you lost " + this.bet;
                this.profit -= this.bet;
            }
            document.getElementById("profit").innerHTML = this.profit;
        }
    },
}
var cheat = {
    cheat: function() {
        game.score += 1000;
        game.score *= 100;
        game.topScore += 10000000;
        game.totalScore = game.score;
        display.updateScore();
    },

};
const input = document.getElementById("myInput");
const inputValue = input.value;
console.log(inputValue);

function reload() {
    saveGame();
    location.reload();  
}

setInterval (function() {
    globalVariable.course += randomNumber(-2, 2);
    if (globalVariable.course < -20) {
        globalVariable.course = -20;
    } else if (globalVariable.course > 20) {
        globalVariable.course = 20;
    }
    updateCourse();
}, 60000);

function getCourse() {
    if (globalVariable.course == 0) {
        return 1;
    } else {
        return (1 + (globalVariable.course / 100));
    }
}
function updateCourse() {
    document.getElementById("course").innerHTML = globalVariable.course;
    if (globalVariable.course >= 0) {
        document.getElementById("coursePrefix").innerHTML = "+";
        document.getElementById("courseStyle").style.color = "green";
    } else if (globalVariable.course < 0) {
        document.getElementById("coursePrefix").innerHTML = "";
        document.getElementById("courseStyle").style.color = "red";
    }
}

document.addEventListener("mousemove", (event) => {
    globalVariable.mouseX = event.clientX;
    globalVariable.mouseY = event.clientY;
});

function infoCard(index, type) {

    document.getElementById("infoCard").style.visibility = "visible";
    if (type == "building") {
        document.getElementById("textField").innerHTML = '<div><span class="infoCardBuildingName">'+building.name[index]+'</span><div class="infoCardProduction">In total '+display.applySuffix(building.factor[index], 2)+' * '+display.applySuffix(building.amount[index], 2)+' = '+display.applySuffix(building.factor[index] * building.amount[index], 2)+'/s untaxed</div> <br> '+((building.factor[index] * building.amount[index] * (1 - game.getVeroprosentti() / 100) / game.getScorePerSecond()) * 100).toFixed(1)+'% of total production</div>';
    } else if (type == "pienyritys") {
        document.getElementById("textField").innerHTML = '<div><span class="infoCardBuildingName">'+display.updateYritysTitle()+'</span><div class="infoCardProduction">In total '+pienyritys.factor+' * '+pienyritys.amount+' * '+yritysUpgrade.getFactor().toFixed(2)+' = '+display.applySuffix(Math.ceil(pienyritys.factor * pienyritys.amount * yritysUpgrade.getFactor()), 2)+'/s untaxed</div> <br> '+((pienyritys.factor * pienyritys.amount * yritysUpgrade.getFactor() * (1 - game.getVeroprosentti() / 100) / game.getScorePerSecond()) * 100).toFixed(1)+'% of total production</div>';
    } else if (type == "yritysUpgrade") {
        document.getElementById("textField").innerHTML = '<div><span class="infoCardBuildingName">'+yritysUpgrade.name[index]+'</span>'+yritysUpgrade.description[index]+'</div>';
    } else if (type == "upgrade") {
        document.getElementById("textField").innerHTML = '<div><span class="infoCardBuildingName">'+upgrade.name[index]+'</span>'+upgrade.description[index]+', '+display.applySuffix(upgrade.cost[index],2)+' money</div>';
    } else if (type == "building-unaffordable") {
        document.getElementById("textField").innerHTML = '<div><span class="infoCardBuildingName">'+building.name[index]+'</span><div class="infoCardProduction">In total '+display.applySuffix(building.factor[index], 2)+' * '+display.applySuffix(building.amount[index], 2)+' = '+display.applySuffix(building.factor[index] * building.amount[index], 2)+'/s untaxed</div> <br> '+((building.factor[index] * building.amount[index] * (1 - game.getVeroprosentti() / 100) / game.getScorePerSecond()) * 100).toFixed(1)+'% of total production</div>';
    } else if (type == "pienyritys-unaffordable") {
        document.getElementById("textField").innerHTML = '<div><span class="infoCardBuildingName">'+display.updateYritysTitle()+'</span><div class="infoCardProduction">In total '+pienyritys.factor+' * '+pienyritys.amount+' * '+yritysUpgrade.getFactor().toFixed(2)+' = '+display.applySuffix(Math.ceil(pienyritys.factor * pienyritys.amount * yritysUpgrade.getFactor()), 2)+'/s untaxed</div> <br> '+((pienyritys.factor * pienyritys.amount * yritysUpgrade.getFactor() * (1 - game.getVeroprosentti() / 100) / game.getScorePerSecond()) * 100).toFixed(1)+'% of total production</div>';
    } else if (type == "upgrade-unaffordable") {
        document.getElementById("textField").innerHTML = '<div><span class="infoCardBuildingName">'+upgrade.name[index]+'</span>'+upgrade.description[index]+', '+display.applySuffix(upgrade.cost[index],2)+' money</div>';
    } else if (type == "veroProsentti") {
        document.getElementById("textField").innerHTML = '<div>You get taxed in proportion to the amount of your total production, current percentage '+game.getVeroprosentti()+'%</div>';
    } else if (type == "course") {
        document.getElementById("textField").innerHTML = '<div>The currency exchange changes randomly and determines the value of your money</div>';
    } else if (type == "ascend") {
        document.getElementById("textField").innerHTML = '<div>You can sell your company and get '+Math.floor(ascension.getReward())+' ascension points, which you can buy extra upgrades with</div>';
    } else if (type == "ascensionUpgrade") {
        document.getElementById("textField").innerHTML = '<div>'+ascendUpgrade.description[index]+'</div>';
    } else if (type == "events") {
        document.getElementById("textField").innerHTML = '<div>'+events.description[index]+'</div>';
    }  
    else if (type == "???") {
        document.getElementById("textField").innerHTML = '<div>???</div>';
    } else if (type == "off") {
        document.getElementById("textField").innerHTML = "";
        document.getElementById("infoCard").style.visibility = "hidden";
    }
    document.getElementById("infoCard").style.top = Math.min(520, Math.max(50, globalVariable.mouseY - 60)) + "px";

}

/*var infocard = {
    type: [
        "building","building-unaffordable",
        "pienyritys","pienyritys-unaffordable",
        "yritysUpgrade","yritysUpgrade-unaffordable",
        "upgrade","upgrade-unaffordable",
        "veroprosentti",
        "course",
        "ascend",
        "ascensionUpgrade",
        "???",
        "off",
    ],
    content: this.createContent(),
    createContent: function() {
        return ['<div><span class="infoCardBuildingName">'+building.name[index]+'</span><div class="infoCardProduction">In total '+display.applySuffix(building.factor[index], 2)+' * '+display.applySuffix(building.amount[index], 2)+' = '+display.applySuffix(building.factor[index] * building.amount[index], 2)+'/s untaxed</div> <br> '+((building.factor[index] * building.amount[index] * (1 - game.getVeroprosentti() / 100) / game.getScorePerSecond()) * 100).toFixed(1)+'% of total production</div>','<div><span class="infoCardBuildingName">'+building.name[index]+'</span><div class="infoCardProduction">In total '+display.applySuffix(building.factor[index], 2)+' * '+display.applySuffix(building.amount[index], 2)+' = '+display.applySuffix(building.factor[index] * building.amount[index], 2)+'/s untaxed</div> <br> '+((building.factor[index] * building.amount[index] * (1 - game.getVeroprosentti() / 100) / game.getScorePerSecond()) * 100).toFixed(1)+'% of total production</div>',
            '<div><span class="infoCardBuildingName">'+display.updateYritysTitle()+'</span><div class="infoCardProduction">In total '+pienyritys.factor+' * '+pienyritys.amount+' * '+yritysUpgrade.getFactor().toFixed(2)+' = '+display.applySuffix(Math.ceil(pienyritys.factor * pienyritys.amount * yritysUpgrade.getFactor()), 2)+'/s untaxed</div> <br> '+((pienyritys.factor * pienyritys.amount * yritysUpgrade.getFactor() * (1 - game.getVeroprosentti() / 100) / game.getScorePerSecond()) * 100).toFixed(1)+'% of total production</div>','<div><span class="infoCardBuildingName">'+display.updateYritysTitle()+'</span><div class="infoCardProduction">In total '+pienyritys.factor+' * '+pienyritys.amount+' * '+yritysUpgrade.getFactor().toFixed(2)+' = '+display.applySuffix(Math.ceil(pienyritys.factor * pienyritys.amount * yritysUpgrade.getFactor()), 2)+'/s untaxed</div> <br> '+((pienyritys.factor * pienyritys.amount * yritysUpgrade.getFactor() * (1 - game.getVeroprosentti() / 100) / game.getScorePerSecond()) * 100).toFixed(1)+'% of total production</div>',
            '<div><span class="infoCardBuildingName">'+yritysUpgrade.name[index]+'</span>'+yritysUpgrade.description[index]+'</div>','<div><span class="infoCardBuildingName">'+yritysUpgrade.name[index]+'</span>'+yritysUpgrade.description[index]+'</div>',
            '<div><span class="infoCardBuildingName">'+upgrade.name[index]+'</span>'+upgrade.description[index]+', '+display.applySuffix(upgrade.cost[index],2)+' money</div>','<div><span class="infoCardBuildingName">'+upgrade.name[index]+'</span>'+upgrade.description[index]+', '+display.applySuffix(upgrade.cost[index],2)+' money</div>',
            '<div>You get taxed in proportion to the amount of your total production, current percentage '+game.getVeroprosentti()+'%</div>',
            '<div>The currency exchange changes randomly and determines the value of your money</div>',
            '<div>You can sell your company and get '+Math.floor(ascension.getReward())+' ascension points, which you can buy extra upgrades with</div>',
            '<div>'+ascendUpgrade.description[index]+'</div>',
            '<div>???</div>',]
    },
    getContent: function(index, type) {
        for (let i = 0; i < this.type.length; i++) {
            if (type == this.type[i] && type != "off") {
                return this.content[i];
            }
        }
    },
    get: function(index, type) {
        for (let i = 0; i < this.type.length; i++) {
            if (type == this.type[i] && type != "off") {
                document.getElementById("infoCard").style.visibility = "visible";
                document.getElementById("infoCard").style.top = Math.min(520, Math.max(50, globalVariable.mouseY - 60)) + "px";
                document.getElementById("textField").innerHTML = this.getContent(index, type);
            } else if (type == "off") {
                document.getElementById("textField").innerHTML = "";
                document.getElementById("infoCard").style.visibility = "hidden";
            }
        }
    },
}*/

function confirmCard(name) {
    document.getElementById("confirmCard").style.display = "block";
    document.getElementById("confirmText").innerHTML = '';
    document.getElementById("confirmButton").innerHTML = '';
    if (name == "off") {
        document.getElementById("confirmCard").style.display = "none";
    } else if (name == "ascend") {
        document.getElementById("confirmText").innerHTML = "Do you want to sell your company? You will lose all of your progress and gain " + Math.floor(ascension.getReward()) + " ascension points";
        document.getElementById("confirmButton").innerHTML = '<button id="innerConfirmButton" onClick="ascension.ascend(); confirmcard(\'off\');">OK</button>';
    } else if (name == "reload") {
        document.getElementById("confirmText").innerHTML = "Do you want to reload?";
        document.getElementById("confirmButton").innerHTML = '<button id="innerConfirmButton" onClick="reload(); confirmCard(\'off\');">OK</button>';
    } else if (name == "laina") {
        document.getElementById("confirmText").innerHTML = "Do you want to take the loan?";
        document.getElementById("confirmButton").innerHTML = '<button id="innerConfirmButton" onClick="laina.otaLaina(); confirmCard(\'off\');">OK</button>';
    }
}

var laina = {
    jäljellä: 1800,
    muutaLaina: function(type) {
        if (!globalVariable.active) {
            console.log(globalVariable.active);
            if (type == "+") {
                if (globalVariable.lainaAmount < game.getScorePerSecond() * 1800) {
                    globalVariable.lainaAmount += 10000;
                    console.log(globalVariable.lainaAmount);
                }
            } else if (type == "-") {
                if (globalVariable.lainaAmount > 0) {
                    globalVariable.lainaAmount -= 10000;
                    console.log(globalVariable.lainaAmount);
                }
            } else if (type == "max") {
                globalVariable.lainaAmount = Math.ceil(game.getScorePerSecond() * 1800);
            } else if (type == "min") {
                globalVariable.lainaAmount = 0;
            }
            document.getElementById("laina-amount").innerHTML = globalVariable.lainaAmount;
        } else {
            document.getElementById("laina-amount").innerHTML = globalVariable.lainaAmount;
        }
    },
    otaLaina: function() {
        if (!globalVariable.active && globalVariable.lainaAmount >= 10000) {
            this.jäljellä = 1800;
            console.log(globalVariable.active);

                console.log(globalVariable.lainaAmount);
                globalVariable.active = true;
                console.log(globalVariable.active);
                this.startInterval();
                changeEffect("muutos", "+" + globalVariable.lainaAmount);
                document.getElementById("muutos").style.color = "green";
                syötäKorko();
                this.checkLaina();
                game.addToScore(globalVariable.lainaAmount);
                console.log("päällä");
        
        } else if (globalVariable.active) {
            console.log("on jo");
        }
    },
    startInterval() {
        if (globalVariable.active) {
            this.intervalId = setInterval(() => {
                if (game.checkScore(globalVariable.lainaAmount / 30 * syötäKorko())) {
                    game.takeFromScore(globalVariable.lainaAmount / 30 * syötäKorko());
                    changeEffect("muutos", "-" + Math.trunc(globalVariable.lainaAmount / 30 * syötäKorko()));
                    document.getElementById("muutos").style.color = "red";
                } else {
                    this.removeRandomBuilding();
                }
                console.log("-", globalVariable.lainaAmount / 30 * syötäKorko());
                this.jäljellä -= 60;
                document.getElementById("laina-jäljellä").innerHTML = Math.trunc(this.jäljellä / 60) + " Minutes";
                if (this.jäljellä <= 0) {
                    this.stopInterval();
                    globalVariable.active = false;
                    document.getElementById("laina-jäljellä").innerHTML = "Loan paid off!";
                    this.checkLaina();
                }
            }, 60000);
        }
    },
    stopInterval() {
        clearInterval(this.intervalId);
        this.intervalId = null;
        console.log("loppu");
        globalVariable.lainaAmount = 0;
        document.getElementById("laina-amount").innerHTML = globalVariable.lainaAmount;
    },
    removeRandomBuilding: function(index) {
        let x = randomNumber(0,4)
        if (building.amount[x] > 0) {
            building.amount[x] -= 1;
        } else {
            this.removeRandomBuilding(i);
        }

    },
    checkLaina: function() {
        if (globalVariable.active) {
            document.getElementById("lainanOtto").style.display = "none";
        } else {
            document.getElementById("lainanOtto").style.display = "block";
        }
    }
}
function syötäKorko() {
    if (document.getElementById("valitseKiinteä").checked) {
        console.log("kiinteä");
        return 1.03;
    } else {
        console.log("muuttuva");
        return 1 + ((1 - globalVariable.course) / 100);
    }
}

var ascension = {
    ascended: false,
    currency: 0,

    getReward: function () {
        if ((game.totalScore / 1000000000) <= 1) {
            return Math.max(0, game.totalScore / 1000000000); 
        } else if ((game.totalScore / 1000000000) > 1) {
            return Math.max(0, getBaseLog(1.5, game.totalScore / 1000000000)) + 1;
        }
    },

    getProgress: function() {
        return Math.max(0, (this.getReward() - Math.trunc(this.getReward())) * 100);
    },

    progressBar: function() {
        document.getElementById("innerProgressBar").style.width = "0%";

        document.getElementById("ascendTrackerPercentage").innerHTML = (this.getProgress()).toFixed(2);
        document.getElementById("ascensionReward").innerHTML = "+" + display.applySuffix(Math.floor(this.getReward()), 3);
        document.getElementById("innerProgressBar").style.width = Math.max(0, this.getProgress() - 2) + "%";
    },

    ascend: function() {
        if ((this.getReward() >= 1)) {
            this.currency += Math.floor(this.getReward());
            this.ascended = true;


            var gameSave = {ascensionCurrency: ascension.currency,
                            ascended: ascension.ascended,
                            ascendUpgradeAmount: ascendUpgrade.amount,
                            };
            localStorage.setItem("gameSave", JSON.stringify(gameSave));
            location.reload();

            document.getElementById("ascensionCurrency").innerHTML = ascension.currency; 
            ascendUpgrade.refreshUnlocks();      
        }
    },
}

var ascendUpgrade = {
    ascendVoimaMultiplier: 0,
    name: [
        "Tax Evasion",

        "Income",

        "Clicking",

        "Gambling",
        "Loans",
        "Events",
    ],
    description: [
        "You evade the top 10% of taxes",

        "You produce 10% more",

        "Your clicking power gains 0,1% of your automatic production",

        "You can gamble",
        "You can take loans",
        "You can trigger events",
    ],
    amount: [
        0,

        0,

        0,

        0,
        0,
        0,
    ],
    cost: [
        1,

        1,

        1,

        10,
        10,
        10,
    ],
    type: [
        "Tax",

        "Income",

        "Clicking",

        "Unlock",
        "Unlock",
        "Unlock",
    ],
    bonus: [
        10,

        1.1,

        1,

        "outerUhkapelaus",
        "laina",
        "events",
    ],
    
    purchase: function(index) {
        if (ascension.currency >= this.getCost(index)) {
            if (this.type[index] == "Unlock") {
                if (this.amount[index] < 1) {
                    ascension.currency -= this.getCost(index);
                    this.amount[index]++;
                    this.refreshUnlocks();
                }
            } else if (this.type[index] != "Unlock") {
                ascension.currency -= this.getCost(index);
                this.amount[index]++;
                if (this.type[index] == "Tax") {
                    globalVariable.maxVero -= this.bonus[index];
                } else if (this.type[index] == "Income") {
                    game.ascensionBonus *= this.bonus[index];
                } else if (this.type[index] == "Clicking") {
                    this.ascendVoimaMultiplier += this.bonus[index];
                }
            }
        }
        display.updateAscensionUpgrades();
    },

    getCost: function(index) {
        return this.cost[index] * 10 ** this.amount[index];
    },

    misc: function(name) {
        console.log(name);
    },

    refreshUnlocks: function() {
        for (let i = 0; i < this.name.length; i++) {
            if (this.type[i] == "Unlock" && this.amount[i] > 0) {
                document.getElementById(this.bonus[i]).style.display = "block";
            }
        }
    }
}

var events = {
    name: [
        "Birthday",
        "Friday Night",
        "Grass Growth Spurt",
        "Repeated FLSA Violations",
        "Worker Shortage",
        "Black Friday",
    ],
    description: [
        "Your parents giving you birthday presents boosts manual production by 2x!",
        "Increased amounts of bottles boosts manual production by 2x!",
        "More grass to cut boosts manual production by 2x!",
        "Forfeiting your rights boosts manual production by 2x!",
        "Higher wages due to a worker shortage boosts manual production by 2x!",
        "Increased amounts of demand boosts manual production by 2x!",
    ],
    //type: [
    //    "testi1",
    //    "testi2",
    //],
    cost: [
        100000000,
        100000000,    
        100000000,    
        100000000,    
        100000000,    
        100000000,    
    ],
    bonus: [
        2,
        2,
        2,
        2,
        2,
        2,
    ],
    coolDown: [
        1800,
        1800,
        1800,
        1800,
        1800,
        1800,
    ],
    useCoolDown: [
        0,
        0,
        0,
        0,
        0,
        0,
    ],
    duration: [
        30,
        30,
        30,
        30,
        30,
        30,
    ],
    useDuration: [
        0,
        0,
        0,
        0,
        0,
        0,
    ],
    active: [
        false,
        false,
        false,
        false,
        false,
        false,
    ],
    unlocked: [
        false,
        false,
        false,
        false,
        false,
        false,
    ], 

    unlock: function(index) {
        if (building.amount[index] >= 100) {
            building.amount[index] -= 100;
            this.unlocked[index] = true;
        }
        display.updateEvents();
    },

    purchase: function(index) {
        if (game.checkScore(this.cost[index])) {
            game.takeFromScore(this.cost[index]);
            this.active[index] = true;
            this.useDuration[index] = this.duration[index];
            display.updateEvents();

            console.log("ostaminen toimi");
            console.log(game.getVoima());
        }
    },
    getTotalBonus: function() {
        let totalBonus = 1;
        for (let i = 0; i < this.name.length; i++) {
            if (this.active[i]) {
                totalBonus *= this.bonus[i];
            }
        }
        return Math.max(1, totalBonus);
    },
    getCoolDown: function(index) {
        if (this.useCoolDown[index] > 60) {
            return Math.trunc(this.useCoolDown[index] / 60) + "min.";
        } else if (this.useCoolDown[index] <= 60) {
            return this.useCoolDown[index] + "sec.";
        }
    },
}
setInterval( function() {
    for (let i = 0; i < events.name.length; i++) {
        if (events.active[i] && events.useDuration[i] > 0) {
            events.useDuration[i] -= 1;
            events.useCoolDown[i] = events.coolDown[i];

            //console.log(events.useDuration[i]);
            //console.log("eka vaihe " + events.name[i]);
        } else if (events.useDuration[i] <= 0 && events.useCoolDown[i] > 0) {
            events.active[i] = false;
            events.useCoolDown[i] -= 1;

            //console.log(events.useCoolDown[i]);
            //console.log("toka vaihe " + events.name[i]);
        } else if (events.useCoolDown[i] <= 0) {
            events.useCoolDown[i] = 0;

            //console.log("kolmas vaihe " + events.name[i]);
        }
    }
    display.updateEvents();
}, 1000)