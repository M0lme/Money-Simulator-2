var current = new Date().getTime();

var game = {
    moneesi: 0,
    totalMoneesi: 0,
    voima: 1,
    ostovoima: 1,
    rahaClicked: 0,
    versio: 0.001,
    topScore: 0,

    addToScore: function(amount) {
        this.moneesi += amount;
        this.totalMoneesi += amount;
        display.updateScore();
        if (this.topScore <= this.moneesi) {
            this.topScore += amount;
            document.getElementById("topScore").innerHTML = this.topScore;
        }
    },

    getVerotonScorePerSecond: function() {
        var moneesiPerSecond = 0;
        for (i = 0; i < building.nimi.length; i++) {
            moneesiPerSecond += building.kerroin[i] * building.määrä[i];
        }
        return moneesiPerSecond;
    },

    getScorePerSecond: function() {
        return this.getVerotonScorePerSecond() * (1 - this.getVeroprosentti() / 100);
    },

    getVeroprosentti: function() {
        var maxVero = 80;
        var veroprosentti = Math.ceil(Math.min(maxVero, Math.max(1, Math.log(this.getVerotonScorePerSecond()) * 8.5)));
        return veroprosentti;
    },
};

setInterval (function() {
    display.updateUpgrades();
    display.updateScore();
    display.updateShop();
    /*display.updatePurchasedUpgrade();*/
    display.updateCheat();
    document.getElementById("version").innerHTML = game.versio;
}, 500);

setInterval (function() {
    document.getElementById("rahaClickedCheat").innerHTML = game.rahaClicked;
    document.getElementById("topScoreCheat").innerHTML = Math.ceil(game.topScore);
    document.getElementById("moneesiCheat").innerHTML = Math.ceil(game.moneesi);
    document.getElementById("moneesiPerSecondCheat").innerHTML = Math.ceil(game.getScorePerSecond());
    document.getElementById("veroprosenttiCheat").innerHTML = game.getVeroprosentti();
    document.getElementById("totalMoneesiCheat").innerHTML = game.totalMoneesi;
    document.getElementById("voimaCheat").innerHTML = game.voima;
}, 500);

function testiFunktio() {
    document.getElementById("testiDIV").style.height += "100px";
}

var building = {
    nimi: [
        "Viikkorahat",
        "Pullonkeräys",
        "Ruohonleikkaus",
        "Kesätyö",
        "Minimipalkkatyö",
        "Pienyritys",
    ],
    hinta: [
        50,
        500,
        10000,
        50000,
        150000,
        250000,
    ],
    kuva: [
        "images/viikkoraha-1.png",
        "images/pullonkeräys-1.png",
        "images/ruohonleikkaus-template.png",
        "images/kesätyö-template.png",
        "images/minimipalkkatyö-template.png",
        "images/pienyritys-template.png",
    ],
    määrä: [
        0,
        0,
        0,
        0,
        0,
        0
    ],
    kerroin: [
        1,
        5,
        15,
        30,
        75,
        120
    ],

    purchase: function(index) {
    if (game.moneesi >= this.hinta[index]) {
        game.moneesi -= this.hinta[index];
        this.määrä[index]++;
        this.hinta[index] = Math.ceil(this.hinta[index] * 1.15);

        display.updateScore();
        display.updateShop();
        display.updateUpgrades();
    } 
}
};

var upgrade = {
    name: [
        /*"Verovapautukset",*/
        "Tahmeat kädet", "Tahmeat kädet 2",
        "Anteliaat vanhemmat","Anteliaat vanhemmat 2","Anteliaat vanhemmat 3","Anteliaat vanhemmat 4",
        "330ml tölkit",
        "Rautainen terä",
    ],
    description: [
        /*"Maksat maksimissaan 10%-yks. vähemmän veroja",*/
        "Rahan hiplaaminen tuottaa tuplasti enemmän", "Rahan hiplaaminen tuottaa tuplasti enemmän",
        "Viikkorahat tuottavat tuplasti enemmän","Viikkorahat tuottavat tuplasti enemmän","Viikkorahat tuottavat tuplasti enemmän","Viikkorahat tuottavat tuplasti enemmän",
        "Pullonkeräys tuottaa tuplasti enemmän",
        "Ruohonleikkuri tuottaa tuplasti enemmän",
    ],
    image: [
        /*"images/stickyfingers-template.png",*/
        "images/stickyfingers-template.png", "images/stickyfingers-template.png",
        "images/viikkoraha-1.png", "images/viikkoraha-2.png","images/viikkoraha-3.png", "images/viikkoraha-4.png",
        "images/pullonkeräys-1.png",
        "images/ruohonleikkaus-template.png",
    ],
    type: [
        /*"tax",*/
        "click","click",
        "building","building","building","building",
        "building",
        "building",
    ],
    cost: [
        /*1000,*/
        200,1000,
        500,500,500,500,
        5000,
        5000,
    ],
    buildingIndex: [
        /*-2,*/
        -1,-1, 
        0,0,0,0,
        1,
        2,
    ],
    requirement: [
        /*100,*/
        100,500,
        10,20,30,40,
        10,
        10,
    ],
    bonus: [
        /*10,*/
        2,2,
        2,2,2,2,
        2,
        2,
    ],
    purchased: [
        /*false,*/
        false,false,
        false,false,false,false,
        false,
        false,
    ],
    tier: [
        /*1,*/
        1,2,
        1,2,3,4,
        1,
        1,
    ],

    purchase: function(index) {
        if (!this.purchased[index] && game.moneesi >= this.cost[index]) {
            if (this.type[index] == "building" && building.määrä[this.buildingIndex[index]] >= this.requirement[index]) {
                game.moneesi -= this.cost[index];
                building.kerroin[this.buildingIndex[index]] *= this.bonus[index];
                this.purchased[index] = true;

            } else if (this.type[index] == "click" && game.rahaClicked >= this.requirement[index]) {
                game.moneesi -= this.cost[index];
                game.voima *= this.bonus[index];
                this.purchased[index] = true;

            } else if (this.type[index] == "tax" && game.getScorePerSecond() >= this.requirement[index]) {
                game.moneesi -= this.cost[index];
                game.maxVero -= this.bonus[index];
                this.purchased[index] = true;

            }
        }
        display.updateUpgrades();
        display.updateScore();
        /*display.updatePurchasedUpgrade();*/
    },
};

var yritysUpgrade = {
    name: [

    ],
    description: [

    ],
    price: [

    ],
    amount: [

    ],
    factor: [

    ],
    type: [

    ],
    buildingIndex: [

    ]
}

var display = {
    suffix: [
        "k", "mil.", "Mrd.", "Bil.", "Trl.","Qdr.", "Qnt.", "Sxt.", "Spt.", "Oct.",/* "Non.", "Dec.",*/
    ].reverse(),
    amount: [
        1000,
        1000000,
        1000000000,
        1000000000000,
        1000000000000000,
        1000000000000000000n,
        1000000000000000000000n,
        1000000000000000000000000n,
        1000000000000000000000000000n,
        1000000000000000000000000000000n,
    ].reverse(),

    updateScore: function() {
        this.applySuffix();
        this.applySuffix2();
        /*document.getElementById("game.moneesi").innerHTML = Math.ceil(game.moneesi);*/
        /*document.getElementById("game.moneesiPerSecond").innerHTML = Math.ceil(game.getScorePerSecond());*/
        document.getElementById("rahaClicked").innerHTML = game.rahaClicked;
        document.getElementById("veroprosentti").innerHTML = game.getVeroprosentti();
    },

    updateShop: function() {
        document.getElementById("shopContainer").innerHTML = "";
        for (i = 0; i < building.nimi.length; i++) {
            /*SAA OSTAA*/
            if (game.topScore >= building.hinta[i] * 0.6 && game.moneesi >= building.hinta[i]) {
                document.getElementById("shopContainer").innerHTML += '<table class="rakennusnappi unselectable" title="'+building.kerroin[i]+' * '+building.määrä[i]+' = '+building.kerroin[i] * building.määrä[i]+' moneesia sekunnissa verotonta" onClick="building.purchase('+i+')"><tr><td id="image"><img draggable="false" class="building-kuva" src="'+building.kuva[i]+'"></td><td class="building-nimiJaHinta"><p><span class="building-nimi">'+building.nimi[i]+'</span><span class="building-kerroin">'+building.kerroin[i]+' /s</span></p><p><span class="building-hinta">'+building.hinta[i]+'</span><span class="ostonappi-upgrade-image"></span></p></td><td class="outer-building-määrä"><span class="building-määrä">'+building.määrä[i]+'</span></td></tr></table>';
            /*NÄKYY INFO MUTTA EI SAA OSTAA*/
            } else if (game.topScore >= building.hinta[i] * 0.6 && game.moneesi < building.hinta[i]) {
                document.getElementById("shopContainer").innerHTML += '<table class="rakennusnappi-unaffordable unselectable" title="'+building.kerroin[i]+' * '+building.määrä[i]+' = '+building.kerroin[i] * building.määrä[i]+' moneesia sekunnissa verotonta" onClick="building.purchase('+i+')"><tr><td id="image"><img draggable="false" class="building-kuva" src="'+building.kuva[i]+'"></td><td class="building-nimiJaHinta"><p><span class="building-nimi">'+building.nimi[i]+'</span><span class="building-kerroin">'+building.kerroin[i]+' /s</span></p><p><span class="building-hinta">'+building.hinta[i]+'</span><span class="ostonappi-upgrade-image"></span></p></td><td class="outer-building-määrä"><span class="building-määrä">'+building.määrä[i]+'</span></td></tr></table>';
            /*EI NÄY INFO*/
            } else if (game.topScore >= building.hinta[i] * 0.4) {
                document.getElementById("shopContainer").innerHTML += '<table class="rakennusnappi-locked unselectable"><tr><td id="image"><img draggable="false" class="building-kuva" src="images/locked-template.png"></td><td class="building-nimiJaHinta"><p><span class="building-nimi">???</span><span class="building-kerroin">??? /s</span></p><p><span class="building-hinta">???</span><span id="ostonappi-upgrade-image"></span></p></td><td class="outer-building-määrä"><span class="building-määrä">?</span></td></tr></table>';
            }
           /*if (upgrade.purchased[i] && upgrade.type[i] == "building") {
                document.getElementById("ostonappi-upgrade-image").innerHTML += '<img draggable="false" src="'+upgrade.image[i]+'">';
            }*/
        }
        /*if (document.getElementsByClassName("building-hinta")[i].innerHTML != "undefined") {
            for (i = 0; i < building.nimi.length; i++) {
                document.getElementsByClassName("building-hinta")[i].innerHTML = "";
                if (building.hinta[i] >= 1000000000000) {
                    document.getElementsByClassName("building-hinta")[i].innerHTML = (building.hinta[i] / 1000000000000).toFixed(2) + "Trl";
                } else if (building.hinta[i] >= 1000000000) {
                    document.getElementsByClassName("building-hinta")[i].innerHTML = (building.hinta[i] / 1000000000).toFixed(2) + "Mrd";
                } else if (building.hinta[i] >= 1000000) {
                    document.getElementsByClassName("building-hinta")[i].innerHTML = (building.hinta[i] / 1000000).toFixed(2) + "mil";
                } else if (building.hinta[i] >= 1000) {
                    document.getElementsByClassName("building-hinta")[i].innerHTML = (building.hinta[i] / 1000).toFixed(2) + "k";
                }
            }
        }*/
        /*this.updatePurchasedUpgrade();*/
    },

    updateUpgrades: function() {
        document.getElementById("upgradeContainer").innerHTML = "";
        for (i = 0; i < upgrade.name.length; i++) {
            if (!upgrade.purchased[i]) {
                if (upgrade.type[i] == "building" && building.määrä[upgrade.buildingIndex[i]] >= upgrade.requirement[i] && game.moneesi >= upgrade.cost[i]) {
                    document.getElementById("upgradeContainer").innerHTML += '<img draggable="false" class="upgrade" src="'+upgrade.image[i]+'" title="'+upgrade.name[i]+' &#10; '+upgrade.description[i]+', '+upgrade.cost[i]+' rahaa" onclick="upgrade.purchase('+i+')">';
                } else if (upgrade.type[i] == "building" && building.määrä[upgrade.buildingIndex[i]] >= upgrade.requirement[i] && game.moneesi < upgrade.cost[i]) {
                    document.getElementById("upgradeContainer").innerHTML += '<img draggable="false" class="upgrade-unaffordable" src="'+upgrade.image[i]+'" title="'+upgrade.name[i]+' &#10; '+upgrade.description[i]+', '+upgrade.cost[i]+' rahaa" onclick="upgrade.purchase('+i+')">';
                    /*väli*/
                } else if (upgrade.type[i] == "click" && game.rahaClicked >= upgrade.requirement[i] && game.moneesi >= upgrade.cost[i]) {
                    document.getElementById("upgradeContainer").innerHTML += '<img draggable="false" class="upgrade" src="'+upgrade.image[i]+'" title="'+upgrade.name[i]+' &#10; '+upgrade.description[i]+', '+upgrade.cost[i]+' rahaa" onclick="upgrade.purchase('+i+')">';
                } else if (upgrade.type[i] == "click" && game.rahaClicked >= upgrade.requirement[i] && game.moneesi < upgrade.cost[i]) {
                    document.getElementById("upgradeContainer").innerHTML += '<img draggable="false" class="upgrade-unaffordable" src="'+upgrade.image[i]+'" title="'+upgrade.name[i]+' &#10; '+upgrade.description[i]+', '+upgrade.cost[i]+' rahaa" onclick="upgrade.purchase('+i+')">';
                    /*väli*/
                } else if (upgrade.type[i] == "tax" && game.getScorePerSecond() >= upgrade.requirement[i] && game.moneesi >= upgrade.cost[i]) {
                    document.getElementById("upgradeContainer").innerHTML += '<img draggable="false" class="upgrade" src="'+upgrade.image[i]+'" title="'+upgrade.name[i]+' &#10; '+upgrade.description[i]+', '+upgrade.cost[i]+' rahaa" onclick="upgrade.purchase('+i+')">';
                } else if (upgrade.type[i] == "tax" && game.getScorePerSecond() >= upgrade.requirement[i] && game.moneesi < upgrade.cost[i]) {
                    document.getElementById("upgradeContainer").innerHTML += '<img draggable="false" class="upgrade-unaffordable" src="'+upgrade.image[i]+'" title="'+upgrade.name[i]+' &#10; '+upgrade.description[i]+', '+upgrade.cost[i]+' rahaa" onclick="upgrade.purchase('+i+')">';
                }
            }
        }
        /*this.updatePurchasedUpgrade();*/
    },

    /*updatePurchasedUpgrade: function() {
        document.getElementById("ostonappi-upgrade-image").innerHTML = "";
        for (i = 0; i < upgrade.name.length; i++) {
            if (upgrade.purchased[i] && upgrade.type[i] == "building") {
                document.getElementById("ostonappi-upgrade-image").innerHTML += '<img draggable="false" src="'+upgrade.image[i]+'">';
            }
        }
    },*/

    applySuffix: function() {
        for (i = 0; i < this.suffix.length; i++) {
            if (game.moneesi >= this.amount[i]) {
                document.getElementById("game.moneesi").innerHTML = (game.moneesi / this.amount[i]).toFixed(3) + this.suffix[i];
                break;
            } else if (game.moneesi < 1000) {
                document.getElementById("game.moneesi").innerHTML = Math.ceil(game.moneesi);
            }
            /*if (game.getScorePerSecond() >= this.amount[i]) {
                document.getElementById("game.moneesiPerSecond").innerHTML = (game.moneesiPerSecond / this.amount[i]).toFixed(3) + this.suffix[i];
            } else if (game.getScorePerSecond() < 1000) {
                document.getElementById("game.moneesiPerSecond").innerHTML = Math.ceil(game.moneesiPerSecond);
            }*/
        }
    },

    applySuffix2: function() {
        let x = game.getScorePerSecond();
        for (i = 0; i < this.suffix.length; i++) {
            if (x >= this.amount[i]) {
                document.getElementById("game.moneesiPerSecond").innerHTML = (x / this.amount[i]).toFixed(2) + this.suffix[i];
            } else if (x < 1000) {
                document.getElementById("game.moneesiPerSecond").innerHTML = Math.ceil(x);
            }
        }
    },

    displayUhkapelaus: function() {
        if (uhkapelaus.purchased) {
            /*document.getElementById("innerUhkapelaus").style.visibility = "visible";*/
            document.getElementById("avausnappi1").innerHTML = "";
            document.getElementById("avausnappi1").innerHTML = '<button onClick="display.toggleUhkapelausOn();" class="leftButton">Uhkapelaus [+]</button>';
            display.updateScore();
        }
    },

    toggleUhkapelausOn: function() {
        document.getElementById("innerUhkapelaus").style.visibility = "visible";
        document.getElementById("innerUhkapelaus").style.height = "auto";
        document.getElementById("avausnappi1").innerHTML = '<button onClick="display.toggleUhkapelausOff();" class="leftButton">Uhkapelaus [-]</button>';
    },
    toggleUhkapelausOff: function() {
        document.getElementById("innerUhkapelaus").style.visibility = "hidden";
        document.getElementById("innerUhkapelaus").style.height = "0px";
        document.getElementById("avausnappi1").innerHTML = '<button onClick="display.toggleUhkapelausOn();" class="leftButton">Uhkapelaus [+]</button>';
    },
    toggleHuijausOn: function() {
        document.getElementById("innerHuijaus").style.visibility = "visible";
        document.getElementById("innerHuijaus").style.height = "auto";
        document.getElementById("avausnappi2").innerHTML = '<button onClick="display.toggleHuijausOff();" class="leftButton">Huijaus [-]</button>';
    },
    toggleHuijausOff: function() {
        document.getElementById("innerHuijaus").style.visibility = "hidden";
        document.getElementById("innerHuijaus").style.height = "0px";
        document.getElementById("avausnappi2").innerHTML = '<button onClick="display.toggleHuijausOn();" class="leftButton">Huijaus [+]</button>';
    },
    updateCheat: function() {
        document.getElementById("huijaukset").innerHTML = "";
        for (i = 0; i < cheat.name.length; i++) {
            document.getElementById("huijaukset").innerHTML += '<div><span id="'+cheat.name[i]+'"> '+cheat.amount[i]+'</span>  '+cheat.name[i]+'<span id="currentCheatIndicator'+cheat.name[i]+'"></span></div>';
        }
        if (inputValue == "huijaa") {
            document.getElementById("huijaus").style.visibility = "visible";
            document.getElementById("huijaus").style.height = "auto";
        } else if (inputValue == "hane") {
            document.getElementById("clicker").style.backgroundImage = "url('images/hannes.png')";
        }
    },
    showUpgrades: function() {
        document.getElementById("upgradeContainer").style.overflowY = "visible";
        document.getElementById("upgradeContainer").style.height = "auto";
        document.getElementById("showUpgradesButton").innerHTML = '<button onClick="display.hideUpgrades();" class="pm">[-]</button>';
    },
    hideUpgrades: function() {
        document.getElementById("upgradeContainer").style.overflowY = "scroll";
        document.getElementById("upgradeContainer").style.height = "75px";
        document.getElementById("showUpgradesButton").innerHTML = '<button onClick="display.showUpgrades();" class="pm">[+]</button>';
    },
    showBuildings: function() {
        document.getElementById("shopContainer").style.overflowY = "visible";
        document.getElementById("shopContainer").style.height = "auto";
        document.getElementById("showBuildingsButton").innerHTML = '<button onClick="display.hideBuildings();" class="pm">[-]</button>';
    },
    hideBuildings: function() {
        document.getElementById("shopContainer").style.overflowY = "scroll";
        document.getElementById("shopContainer").style.height = "350px";
        document.getElementById("showBuildingsButton").innerHTML = '<button onClick="display.showBuildings();" class="pm">[+]</button>';
    },
    showMenu: function() {
        document.getElementById("menu").style.visibility = "visible";
        document.getElementById("menu").style.height = "auto";
        document.getElementById("showMenuButton").innerHTML = '<button onClick="display.hideMenu();" id="menuButton" class="pm">MENU [-]</button>';
    },
    hideMenu: function() {
        document.getElementById("menu").style.visibility = "hidden";
        document.getElementById("menu").style.height = "0px";
        document.getElementById("showMenuButton").innerHTML = '<button onClick="display.showMenu();" id="menuButton" class="pm">MENU [+]</button>';
    }

};

function saveGame() {
    var gameSave = {
        moneesi: game.moneesi,
        moneesiPerSecond: game.moneesiPerSecond,
        totalMoneesi: game.totalMoneesi,
        voima: game.voima,
        ostovoima: game.ostovoima,
        rahaClicked: game.rahaClicked,
        versio: game.versio,
        veroprosentti: game.veroprosentti,
        topScore: game.topScore,
        uhkapelausPurchased: uhkapelaus.purchased,
        buildingMäärä: building.määrä,
        buildingKerroin: building.kerroin,
        buildingHinta: building.hinta,
        upgradePurchased: upgrade.purchased,
    };
    localStorage.setItem("gameSave", JSON.stringify(gameSave));
}

function loadGame() {
    var savedGame = JSON.parse(localStorage.getItem("gameSave"));
    if (localStorage.getItem("gameSave") !== null) {
        if (typeof savedGame.moneesi !== "undefined") game.moneesi = savedGame.moneesi;
        if (typeof savedGame.moneesiPerSecond !== "undefined") game.moneesiPerSecond = savedGame.moneesiPerSecond;
        if (typeof savedGame.totalMoneesi !== "undefined") game.totalMoneesi = savedGame.totalMoneesi;
        if (typeof savedGame.voima !== "undefined") game.voima = savedGame.voima;
        if (typeof savedGame.ostovoima !== "undefined") game.ostovoima = savedGame.ostovoima;
        if (typeof savedGame.rahaClicked !== "undefined") game.rahaClicked = savedGame.rahaClicked;
        if (typeof savedGame.versio !== "undefined") game.versio = savedGame.versio;
        if (typeof savedGame.veroprosentti !== "undefined") game.veroprosentti = savedGame.veroprosentti;
        if (typeof savedGame.topScore !== "undefined") game.topScore = savedGame.topScore;
        if (typeof savedGame.uhkapelausPurchased !== "undefined") uhkapelaus.purchased = savedGame.uhkapelausPurchased;

        if (typeof savedGame.buildingMäärä !== "undefined") {
            for (i = 0; i < savedGame.buildingMäärä.length; i++) {
                building.määrä[i] = savedGame.buildingMäärä[i];
            }
        }

        if (typeof savedGame.buildingKerroin !== "undefined") {
            for (i = 0; i < savedGame.buildingKerroin.length; i++) {
                building.kerroin[i] = savedGame.buildingKerroin[i];
            }
        }

        if (typeof savedGame.buildingHinta !== "undefined") {
            for (i = 0; i < savedGame.buildingHinta.length; i++) {
                building.hinta[i] = savedGame.buildingHinta[i];
            }
        }

        if (typeof savedGame.upgradePurchased !== "undefined") {
            for (i = 0; i < savedGame.upgradePurchased.length; i++) {
                upgrade.purchased[i] = savedGame.upgradePurchased[i];
            }
        }
    }
}

document.getElementById("clicker").addEventListener("click", function(event) {
    game.rahaClicked++;
    game.addToScore(game.voima);
    /*console.log(event.target);*/

    if(event.target.id != "clicker") return;
    clickEffect(event);
    clickEffect2(event);
}, false);

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

var fps = 30;

window.onload = function() {
    loadGame();
    display.updateScore();
    display.applySuffix();
    display.updateUpgrades();
    display.updateShop();
    display.displayUhkapelaus();
    display.updateCheat();

    setInterval(function() {
        var t = new Date().getTime();
        game.moneesi += game.getScorePerSecond() * ((t - current) / 1000);
        current = t
        game.totalMoneesi += Math.ceil(game.getScorePerSecond());
        display.updateScore();
        if (game.topScore <= game.moneesi) {
            game.topScore += Math.ceil(game.getScorePerSecond());
            document.getElementById("topScore").innerHTML = game.topScore;
        }
    }, 1000 / fps);

    if (game.topScore <= game.moneesi) {
        game.topScore = Math.ceil(game.moneesi);
    }
}

function luoKuva() {
    /*for (i = 0; i < building.nimi.length; i++) {
        document.getElementById("ostonappi-upgrade-image").innerHTML = '<img src="building.kuva[i]">';
    }*/
}

function randomNumber(min, max) {
    return Math.round(Math.random() * (max-min) + min);
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

function clickEffect(event) {
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
}

function clickEffect2(event) {
    let suunta = randomNumber(1,360);

    let clicker = document.getElementById("clicker");
    let element = document.createElement("div");

    let clickerOffset = clicker.getBoundingClientRect();
    let position = {
        x: event.pageX - clickerOffset.left + randomNumber(-25, -15),
        y: event.pageY - clickerOffset.top
    };

    element.textContent = "+";
    element.classList.add("number", "unselectable", "click-kuva");
    element.classList.remove("päänapukka");
    element.style.left = position.x + "px";
    element.style.top = position.y + "px";

    /*document.getElementsByClassName("click-kuva").innerHTML = "";
    document.getElementsByClassName("click-kuva").innerHTML = '<img src="images/kolikko-1.png">';*/

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

var uhkapelaus = {
    bet: 1000,
    kerroin: 10,
    voitot: 0,
    profit: 0,
    purchased: false,

    allIn: function() {
        if (game.moneesi >= 1000) {
            this.bet = Math.ceil(game.moneesi);
            document.getElementById("bet").innerHTML = this.bet;
        }
    },
    allOut: function() {
        this.bet = 1000;
        document.getElementById("bet").innerHTML = this.bet;
    },
    kasvataBet: function() {
        if (this.bet < game.moneesi) {
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
    kasvataKerroin: function() {
        this.kerroin++;
        document.getElementById("kerroin").innerHTML = this.kerroin;
        document.getElementById("kerroin2").innerHTML = this.kerroin;
    },
    vähennäKerroin: function() {
        if (this.kerroin > 2) {
            this.kerroin--;
        }
        document.getElementById("kerroin").innerHTML = this.kerroin;
        document.getElementById("kerroin2").innerHTML = this.kerroin;
    },
    pelaa: function() {
        if (game.moneesi >= this.bet) {
            game.moneesi -= this.bet;
            display.updateScore();

            let numero = randomNumber(1, this.kerroin);

            if (numero == 1) {
                let voitto = this.bet * this.kerroin;
                game.moneesi += voitto;
                this.voitot += 1;
                document.getElementById("tulos").innerHTML = " voitit " + voitto;
                document.getElementById("voitot").innerHTML += "(" + this.voitot + ")" + " voitit " + voitto + '<br>';
                this.profit += voitto;
                this.profit -= this.bet;
            } else {
                document.getElementById("tulos").innerHTML = " hävisit " + this.bet;
                this.profit -= this.bet;
            }
            document.getElementById("profit").innerHTML = this.profit;
        }
    },
    avaaUhkapelaus: function() {
        if (game.moneesi >= 1000) {
            game.moneesi -= 1000;
            display.updateScore();
            display.displayUhkapelaus();
            this.purchased = true;
        }
    }
}
var currentCheat = 0;
var cheat = {
    name: [
        "rahaClickedCheat",
        "topScoreCheat",
        "moneesiCheat",
        "moneesiPerSecondCheat",
        "veroprosenttiCheat",
        "totalMoneesiCheat",
        "voimaCheat",
    ],
    kerroin: [
        100,
        1000,
        1000,
        100,
        10,
        1000,
        1,
    ],
    amount: [
        game.rahaClicked,
        game.topScore,
        game.moneesi,
        game.getScorePerSecond(),
        game.getVeroprosentti(),
        game.totalMoneesi,
        game.voima,
    ],
    switch: function() {
        currentCheat++;
        if (currentCheat > 6) {
            currentCheat = 0;
        }
        console.log(currentCheat);
        console.log(cheat.name.at(currentCheat));
        for (i = 0; i < cheat.name.length; i++) {
            document.getElementById("currentCheatIndicator" + cheat.name.at(currentCheat)).innerHTML = "←";
        }
    },
    add: function() {
        let määrä = cheat.amount.at(currentCheat);
        määrä += cheat.kerroin.at(currentCheat);
        console.log(määrä);
    },
    deduct: function() {
        cheat.amount.at(currentCheat) -= cheat.kerroin.at(currentCheat);
    },
    cheat: function() {
        game.moneesi += 1000;
        game.moneesi *= 100;
        game.topScore += 10000000;
        display.updateScore();
    }
};
const input = document.getElementById("myInput");
const inputValue = input.value;
console.log(inputValue);
