
function getDataFromApi(type, arg, cb) {
//*****************************************************************************************************************************************************************//
//                      function to connect to the API of World of tanks, extended with the search type and parameter                                              //
//                      option 1: search player name to Get Account ID                                                                                             //
//                      option 2: search account_id to get player statistics                                                                                       //
//                      option 3: search account_id to get player vs vehicle stats                                                                                 //
//                      option 4: search for all tanks to get the tank name, tier, nation                                                                         //
//                      Option 5: search for specific tank stats                                                                                                   //
//*****************************************************************************************************************************************************************//    
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            cb(JSON.parse(this.responseText));
        }
    };

    if (type == 'nickname') {
        xhr.open("GET", "https://api.worldoftanks.eu/wot/account/list/?application_id=5d6d1657c5bc736658f1e6aa3dcb5f6e&search=" + arg);
    }
    else if (type == 'account_id') {
        xhr.open("GET", "https://api.worldoftanks.eu/wot/account/info/?application_id=5d6d1657c5bc736658f1e6aa3dcb5f6e&account_id=" +  arg + "&fields=statistics%2C+global_rating%2C+last_battle_time");
    }
    else if (type == 'Player-vehicle') {
        xhr.open("GET", "https://api.worldoftanks.eu/wot/account/tanks/?application_id=5d6d1657c5bc736658f1e6aa3dcb5f6e&account_id=" + arg);
    }
    else if (type == 'vehicle') {
        xhr.open("GET", "https://api.worldoftanks.eu/wot/encyclopedia/vehicles/?application_id=5d6d1657c5bc736658f1e6aa3dcb5f6e&fields=tier%2C+nation%2C+type%2C+name%2C+tank_id");
    }
    else if (type == 'vehicle-stats') {
        xhr.open("GET", "https://api.worldoftanks.eu/wot/tanks/stats/?application_id=5d6d1657c5bc736658f1e6aa3dcb5f6e&account_id="+ arg + "&fields=all%2C+tank_id");
    }
    else  {
       
    }
    xhr.send();
}

function loadJSON(file, callback) {   

    var xobj = new XMLHttpRequest();
    // xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true); 
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }
 
function getJSONFile(TankStats) {
//*********************************************************************************************************************//
//          This function will import a JSON FILE which contains expected tank values in order to calculate WN8 scores.//
//          http://wiki.wnefficiency.net/pages/WN8                                                                     //
//          http://www.wnefficiency.net/wnexpected/                                                                   //
//********************************************************************************************************************//
    var Wn8Obj = [];
    loadJSON("./assets/data/WN8.json", function(callback) {
        var actual_JSON = JSON.parse(callback);
        actual_JSON.forEach(function(item) {
            Wn8Obj.push({
            "IDNum" : item.IDNum,
            "expFrag" : item.expFrag,
            "expDmg" : item.expDamage,
            "expSpot" : item.expSpot,
            "expDef" : item.expDef,
            "expWin" : item.expWinRate,
            });
        });
        calculateWn8(TankStats, Wn8Obj);
    });
} 
   
function calculateWn8(TankStats, Wn8Obj){
//*********************************************************************************************************************//
//          This function will combine the object created from JSON import with the Tanks Stats and will calculate    //
//          the WN8 score per tank, and stores that in a new Object which contains now all Tank data + WN8 score      //
//********************************************************************************************************************//    
var TankWn8 = [];
    Object.keys(TankStats).forEach(function(key1){
        Object.keys(Wn8Obj).forEach(function(key2){
            if (TankStats[key1].TankID == Wn8Obj[key2].IDNum) {
                
                var rDAMAGE = (TankStats[key1].avg_dmg / Wn8Obj[key2].expDmg);
                var rSPOT = (TankStats[key1].avg_spot / Wn8Obj[key2].expSpot);
                var rFRAG = (TankStats[key1].avg_frags / Wn8Obj[key2].expFrag);
                var rDEF = (TankStats[key1].avg_dcp / Wn8Obj[key2].expDef);
                var rWIN = (TankStats[key1].avg_wins / Wn8Obj[key2].expWin);
            
                var rWINc = Math.max(0,(rWIN - 0.71) / (1 - 0.71));
                var rDAMAGEc = Math.max(0,(rDAMAGE - 0.22) / (1 - 0.22));
                var rFRAGc = Math.max(0, Math.min(rDAMAGEc + 0.2, (rFRAG - 0.12) / (1 - 0.12)));
                var rSPOTc = Math.max(0, Math.min(rDAMAGEc + 0.1, (rSPOT - 0.38) / (1 - 0.38)));
                var rDEFc = Math.max(0, Math.min(rDAMAGEc + 0.1, (rDEF - 0.10) / (1 - 0.10)));
                
                var WN8 = (980*rDAMAGEc + 210*rDAMAGEc*rFRAGc + 155*rFRAGc*rSPOTc + 75*rDEFc*rFRAGc + 145*Math.min(1.8,rWINc)).toFixed(2);
                
                TankWn8.push({
                    "Tank_id": TankStats[key1].TankID,
                    "TankName" : TankStats[key1].Name,
                    "Tier":  TankStats[key1].Tier,
                    "Type":  TankStats[key1].Type,
                    "Nation":  TankStats[key1].Nation,
                    "Wins": TankStats[key1].wins,
                    "Battles": TankStats[key1].battles,
                    "Avg_wins":TankStats[key1].avg_wins,
                    "WN8" : WN8,
                    "All" : "All"
                });
                return;
            }
        });
        
    });
    MakeGraphs(TankWn8);
}

function getPlayerInfo() {
//*********************************************************************************************************************//
//          This function will call the API to get the Account ID back based on the requested Nickname search         //
//********************************************************************************************************************//
    var type = "nickname";
    var Accountid = "" ;
    
    // get the account_id from the player that from the input field//
    var arg = document.getElementById("inputNickname").value;
    getDataFromApi(type, arg,  function(data) {

        var respLen = data.meta.count;
        data = data.data["0"];
        
            if (respLen == 0) {
                alert('Invalid Name, please try again');
            }
            else {
                Accountid = data['account_id'];
                $('#NickName').html(`<h4>Overall player statistics for: <span class="red">${data['nickname']}</span></h4>`);
                $('#Comments').addClass("hidden");
                $('#stats-section').removeClass("hidden");
                getGenericAccountStats(Accountid);
            }
    return false;
    });
}

function getGenericAccountStats(acc_id) {
//*********************************************************************************************************************//
//          This function will call the API to get the General Account Statistics back based on the found Accound ID   //
//********************************************************************************************************************//
    var type = "account_id";
    var arg = acc_id.toString();
    getDataFromApi(type, arg, function(data) {
        var account = acc_id;
        
        var GlobalRating = data.data[account].global_rating;
        var LastBattle = data.data[account].last_battle_time;
        let timeValue = new Date(LastBattle);
        
        timeValue = timeValue * 1000;
        var d = new Date(timeValue);
        $('#Global_Rating').html(`<h4>Global Rating: <span class="red">${GlobalRating}</span></h4>`);
        $('#Last_Battle').html(`<h4>Last Battle played at: <span class="red">${d.toLocaleDateString()}</span></h4>`);
        // ------------------------------------------------------------Get now the data of the player on his specific tanks
        getAccountTankStats(account);
        
    return false;
    });
}

function getAccountTankStats(acc_id){
//****************************************************************************************************************************//
//          This function will call the API to get the Extended Tanks statistics results back based on the found Accound ID   //
//          This information is needed to compare with the expected Tank stats in order to calculate the WN8 per Tannk vehicle//
//****************************************************************************************************************************//   
    var type = "vehicle-stats";
    var arg = acc_id.toString();
    var Battles = 0;
    getDataFromApi(type, arg, function(data) {

        var account = acc_id;
        var myTankStats = [];
        data = data.data[account];
        Object.keys(data).forEach(function(key) {
                Battles = parseInt(data[key].all.battles);
                if (Battles > 0) {
                    myTankStats.push({
                        "battles": data[key].all.battles,
                        "capture_points":data[key].all.capture_points,
                        "avg_cp":(data[key].all.capture_points / data[key].all.battles).toFixed(3),
                        "damage_dealt":data[key].all.damage_dealt,
                        "avg_dmg": (data[key].all.damage_dealt / data[key].all.battles).toFixed(3),
                        "spotted": data[key].all.spotted,
                        "avg_spot": (data[key].all.spotted / data[key].all.battles).toFixed(3),
                        "frags": data[key].all.frags,
                        "avg_frags": (data[key].all.frags / data[key].all.battles).toFixed(3),
                        "dropped_capture_points": data[key].all.dropped_capture_points,
                        "avg_dcp":(data[key].all.dropped_capture_points / data[key].all.battles).toFixed(3),
                        "wins": data[key].all.wins,
                        "avg_wins":(data[key].all.wins / data[key].all.battles*100).toFixed(3),
                        "tank_id": data[key].tank_id
                    });
                }
            });
    getTankData(myTankStats);
    return false;
    });
}

function getTankData(myTankStats) {
//*************************************************************************************************************************//
//          This function will call the API to get the all available Tanks in game                                         //
//          This information is needed to enrich the data from the previous API with tank type, name, Nation and Tier     //
//          End result is a list that will be passed to a function to combine both                                         //
//*************************************************************************************************************************//
    var type = "vehicle";
    var arg = ""; //no need for an accountid
    getDataFromApi(type, arg, function(data) {
        data = data.data;
        var Tanks = [];
            Object.keys(data).forEach(function(key) {
                Tanks.push({
                    "Name": data[key].name,
                    "Nation":data[key].nation,
                    "Type":data[key].type,
                    "Tier": data[key].tier,
                    "Tank_Id": data[key].tank_id
                });
            });
        //combine the to datasets (player-vehicle with vehicle stats)
        Combine(Tanks, myTankStats);
        return false;
        });
}

function Combine(Tanks, myTankStats) {
//*****************************************************************************************************************************//
//          This function will combine the player tankss list with the tank list to get battle results per nation, Tier, type //
//          Also comverting the tank type to a short name which is mostly used and know by the players                         //
//          Also calculating the winrate per tank based on the wins and battles fought                                         //
//*****************************************************************************************************************************//    
    var TankStats = [];
    
    Object.keys(myTankStats).forEach(function(key1){
        Object.keys(Tanks).forEach(function(key2){
            var Type = Tanks[key2].Type;
            if (myTankStats[key1].tank_id == Tanks[key2].Tank_Id) {
                if (Type == "heavyTank") {
                    Type = "HT";
                } else if (Type == "AT-SPG") {
                    Type = "TD";
                } else if (Type == "mediumTank") {
                    Type = "MT";
                } else if (Type == "lightTank") {
                    Type = "LT";
                } 
                
                TankStats.push({
                    "TankID": Tanks[key2].Tank_Id,
                    "Name": Tanks[key2].Name,
                    "Nation":Tanks[key2].Nation,
                    "Type":Type,
                    "Tier": Tanks[key2].Tier,
                    "battles": myTankStats[key1].battles,
                    "capture_points":myTankStats[key1].capture_points,
                    "avg_cp":myTankStats[key1].avg_cp,
                    "damage_dealt":myTankStats[key1].damage_dealt,
                    "avg_dmg": myTankStats[key1].avg_dmg,
                    "spotted": myTankStats[key1].spotted,
                    "avg_spot": myTankStats[key1].avg_spot,
                    "frags": myTankStats[key1].frags,
                    "avg_frags": myTankStats[key1].avg_frags,
                    "dropped_capture_points": myTankStats[key1].dropped_capture_points,
                    "avg_dcp":myTankStats[key1].avg_dcp,
                    "wins": myTankStats[key1].wins,
                    "avg_wins":myTankStats[key1].avg_wins
                });
            }
        });
        
    });
    getJSONFile(TankStats);
    
    return false;
}

function getSecondPart(str) {
    return str.split(':')[1];
}

function getSecondPartOfSecondPart(str) {
    return str.split(/_(.+)/)[1];
}
// ******************************************************************************************************************//
//                                          Making the GRAPH Section                                                 //
// ******************************************************************************************************************//
function MakeGraphs(transactionsData) {

    transactionsData.forEach(function(d){
        d.Avg_wins = parseInt(d.Avg_wins);
        d.Wins = parseInt(d.Wins);
        d.Battles = parseInt(d.Battles);
        d.Tier = parseInt(d.Tier);
        d.WN8 = parseInt(d.WN8);
    });
    
    var ndx = crossfilter(transactionsData);
    
    Show_selectors(ndx);
    MakeGraphsWinRatePerTier(ndx);
    MakeGraphsWinRatePerType(ndx);
    MakeGraphsWN8(ndx);
    MakePieChart(ndx);
    MakePieChartTier(ndx);
    MakePieChartNation(ndx);
    MakeWN8(ndx);
    MakeDataTable(ndx);
    MakeDataTableSmall(ndx);
        
    dc.renderAll();
}

function Show_selectors(ndx) {
    var disciplineDimTier = ndx.dimension(dc.pluck("Tier"));
    var disciplineSelectTier = disciplineDimTier.group();
    
    var disciplineDimType = ndx.dimension(dc.pluck("Type"));
    var disciplineSelectType = disciplineDimType.group();
    
    var disciplineDimNation = ndx.dimension(dc.pluck("Nation"));
    var disciplineSelectNation = disciplineDimNation.group();
    
    dc.selectMenu("#Tier_selector")
        .dimension(disciplineDimTier)
        .group(disciplineSelectTier);

    dc.selectMenu("#Tier_selector2")
        .dimension(disciplineDimTier)
        .group(disciplineSelectTier) ;   
    
    dc.selectMenu("#Type_selector")
        .dimension(disciplineDimType)
        .group(disciplineSelectType);    
    
    dc.selectMenu("#Type_selector2")
        .dimension(disciplineDimType)
        .group(disciplineSelectType);
    
    dc.selectMenu("#Type_selector3")
        .dimension(disciplineDimType)
        .group(disciplineSelectType);
        
    dc.selectMenu("#Nation_selector")
        .dimension(disciplineDimNation)
        .group(disciplineSelectNation);  
}

function MakeGraphsWinRatePerTier(ndx) {

var divwidth = document.getElementById('bar-chart-winrate').offsetWidth;

var dim = ndx.dimension(dc.pluck('Tier'));
        var winrate_per_tier = dim.group().reduce(
            function (p, v) {
                p.Count++;
                p.Wins += v.Wins;
                p.Battles += v.Battles;
                p.Average = p.Wins / p.Battles;
                return p;
            },
            function (p, v) {
                p.Count--;
                if (p.Count == 0) {
                    p.Wins = 0;
                    p.Battles = 0;
                    p.Average = 0;
                } else {
                    p.Wins -= v.Wins;
                    p.Battles -= v.Battles;
                    p.Average = p.Wins / p.Battles;
                }
                return p;
            },
            function () {
                return {Wins: 0, Count: 0, Average: 0, Battles: 0};
            }
        );
    
    var chart = dc.barChart("#bar-chart-winrate");
    chart
        .width(divwidth - 50)
        .height(300)
        .margins({ top: 10, right: 30, bottom: 40, left: 40 })
        .dimension(dim)
        .group(winrate_per_tier)
        .renderHorizontalGridLines(true)
        .valueAccessor(function (p) {
            return p.value.Average.toFixed(4);
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .colorAccessor(function (d) {
            return d.key;
        })
        .xAxisLabel("Tier")
        .yAxis().ticks(9);

}

function MakeGraphsWinRatePerType(ndx) {

var divwidth = document.getElementById('bar-chart-winrate-per-type').offsetWidth;

var dim = ndx.dimension(dc.pluck('Type'));
        var winrate_per_tier = dim.group().reduce(
            function (p, v) {
                p.Count++;
                p.Wins += v.Wins;
                p.Battles += v.Battles;
                p.Average = p.Wins / p.Battles;
                return p;
            },
            function (p, v) {
                p.Count--;
                if (p.Count == 0) {
                    p.Wins = 0;
                    p.Battles = 0;
                    p.Average = 0;
                } else {
                    p.Wins -= v.Wins;
                    p.Battles -= v.Battles;
                    p.Average = p.Wins / p.Battles;
                }
                return p;
            },
            function () {
                return {Wins: 0, Count: 0, Average: 0, Battles: 0};
            }
        );
    
    var chart = dc.barChart("#bar-chart-winrate-per-type");
    chart
        .width(divwidth - 50)
        .height(300)
        .margins({ top: 10, right: 30, bottom: 40, left: 40 })
        .dimension(dim)
        .group(winrate_per_tier)
        .renderHorizontalGridLines(true)
        .valueAccessor(function (p) {
            return p.value.Average.toFixed(4);
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .colorAccessor(function (d) {
            return d.key;
        })
        .xAxisLabel("Tier")
        .yAxis().ticks(9);

}

function MakeGraphsWN8(ndx) {
var dim = ndx.dimension(dc.pluck('Type'));
        var average_wn8_per_type = dim.group().reduce(
            function (p, v) {
                p.Count++;
                p.Battles += v.Battles;
                p.WN8 += parseInt((v.WN8 * v.Battles).toFixed(2));
                p.Average = parseInt((p.WN8 / p.Battles).toFixed(2)); 
                return p;
            },
            function (p, v) {
                p.Count--;
                if (p.Count == 0) {
                    p.WN8 = 0;
                    p.Battles = 0;
                    p.Average = 0;
                } else {
                    
                    p.Battles -= v.Battles;
                    p.WN8 -= parseInt((v.WN8 * v.Battles).toFixed(2));
                    p.Average = parseInt((p.WN8) / p.Battles).toFixed(2);
                }
                return p;
            },
            function () {
                return {WN8: 0, Count: 0, Average: 0, Battles: 0};
            }
                
        );
    
    var divwidth = document.getElementById('bar-chart-wn8').offsetWidth;
    var chart = dc.barChart("#bar-chart-wn8");
    chart
        .width(divwidth - 50)
        .height(300)
        .margins({ top: 10, right: 30, bottom: 50, left: 40 })
        .dimension(dim)
        .group(average_wn8_per_type)
        .renderHorizontalGridLines(true)
        .valueAccessor(function (p) {
            return p.value.Average;
        })
        .x(d3.scale.ordinal())
        .y(d3.scale.linear())
        .xUnits(dc.units.ordinal)
        // .yUnits(dc.units.linear)
        .elasticY(true)
        .colorAccessor(function (d) {
            return d.key;
        })
        .xAxisLabel("Type")
        .yAxis().ticks();

}

function MakeWN8(ndx) {
var dim = ndx.dimension(dc.pluck('All'));
        var wn8_per_selection = dim.group().reduce(
            function (p, v) {
                p.Count++;
                p.Battles += v.Battles;
                p.WN8 += parseInt((v.WN8 * v.Battles).toFixed(2));
                p.Average = parseInt((p.WN8 / p.Battles).toFixed(2)); 
                return p;
            },
            function (p, v) {
                p.Count--;
                if (p.Count == 0) {
                    p.WN8 = 0;
                    p.Battles = 0;
                    p.Average = 0;
                } else {
                    
                    p.Battles -= v.Battles;
                    p.WN8 -= parseInt((v.WN8 * v.Battles).toFixed(2));
                    p.Average = parseInt((p.WN8) / p.Battles).toFixed(2);
                }
                return p;
            },
            function () {
                return {WN8: 0, Count: 0, Average: 0, Battles: 0};
            }
                
        );
    
    dc.numberDisplay(wn8)
        .formatNumber(d3.format(".2"))
        .valueAccessor(function (p) {
            return p.value.Average;
        })
        .group(wn8_per_selection)
        $('#wn8').removeClass("hidden");
}

function MakePieChart(ndx){
    var divwidth = document.getElementById('Type-chart').offsetWidth;
    var name_dim = ndx.dimension(dc.pluck('Type'));
    var total_battles_per_type = name_dim.group().reduceSum(dc.pluck('Battles'));
    
    dc.pieChart('#Type-chart')
        .height(300)
        .width(divwidth-10)
        .radius(90)
        .transitionDuration(1500)
        .dimension(name_dim)
        .group(total_battles_per_type)
        .legend(dc.legend().x(15).y(25).itemHeight(10).gap(5));

    
}

function MakePieChartTier(ndx){
    var divwidth = document.getElementById('Tier-chart').offsetWidth;
    var name_dim = ndx.dimension(dc.pluck('Tier'));
    var total_battles_per_tier = name_dim.group().reduceSum(dc.pluck('Battles'));
    
    dc.pieChart('#Tier-chart')
        .height(300)
        .width(divwidth-10)
        .radius(90)
        .transitionDuration(1500)
        .dimension(name_dim)
        .group(total_battles_per_tier)
        .ordering(function(d) { return d.key })
        .legend(dc.legend().x(15).y(25).itemHeight(10).gap(5));

    
}

function MakePieChartNation(ndx){
    var divwidth = document.getElementById('Nation-chart').offsetWidth;
    var name_dim = ndx.dimension(dc.pluck('Nation'));
    var total_battles_per_nation = name_dim.group().reduceSum(dc.pluck('Battles'));
    
    dc.pieChart('#Nation-chart')
        .height(300)
        .width(divwidth-10)
        .radius(90)
        .transitionDuration(1500)
        .dimension(name_dim)
        .group(total_battles_per_nation)
        .ordering(function(d) { return d.key })
        .legend(dc.legend().x(15).y(25).itemHeight(10).gap(5));

    
}

function MakeDataTable(ndx){

    var Dim = ndx.dimension(function (d) {return d.TankName;})
    dc.dataTable("#Table")
      .width(250).height(800)
      .dimension(Dim)
      .group(function(d) {return ' '})
      .size(205)             // number of rows to return
      .columns([
      function(d) { return d.TankName;},
      function(d) { return d.Type;},
      function(d) { return d.Tier;},
      function(d) { return d.Battles;},
      function(d) { return d.Avg_wins;},
      function(d) { return d.WN8;},
    ])
      .sortBy(function(d){ return d.Avg_wins;})
      .order(d3.descending);

}

function MakeDataTableSmall(ndx){

    var Dim = ndx.dimension(function (d) {return d.TankName;})
    dc.dataTable("#TableSmall")
      .width(250).height(800)
      .dimension(Dim)
      .group(function(d) {return ' '})
      .size(205)             // number of rows to return
      .columns([
      function(d) { return d.TankName;},
      function(d) { return d.Avg_wins;},
      function(d) { return d.WN8;},
    ])
      .sortBy(function(d){ return d.Avg_wins;})
      .order(d3.descending);

}
