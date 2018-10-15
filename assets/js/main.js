function getDataFromApi(type, arg, cb) {
//function to connect to the API of World of tanks, extended with the search type and parameter//
//option 1: search player name to Get Account ID//
//option 2: search account_id to get player statistics//
//option 3: search account_id to get player vs vehicle stats
//option 4: search for all tanks to get the tank name, level, nation//
    
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
        xhr.open("GET", "https://api.worldoftanks.eu/wot/encyclopedia/tanks/?application_id=5d6d1657c5bc736658f1e6aa3dcb5f6e&fields=level%2C+nation%2C+tank_id%2C+type%2C+name");
    }
    else if (type == 'vehicle-stats') {
        xhr.open("GET", "https://api.worldoftanks.eu/wot/tanks/stats/?application_id=5d6d1657c5bc736658f1e6aa3dcb5f6e&account_id="+ arg + "&fields=all%2C+tank_id");
    }
    else {
        //not a valid search
    }
    xhr.send();
}
function printDataToConsole(data) {
    console.log(data);
}
function sortNumber(a,b) {
    return a - b;
}
function getSecondPart(str) {
    return str.split(':')[1];
}
function getSecondPart2(str) {
    return str.split(/_(.+)/)[1];
}
function getTableHeaders(obj) {
    var tableHeaders = [];

    Object.keys(obj).forEach(function(key) {
        tableHeaders.push(`<td>${key}</td>`);
    });

    return `<tr>${tableHeaders}</tr>`;
}
//function that is called from the form on submition of a players nickname//
function getPlayerInfo() {
    
    //first type is always nickname
    var type = "nickname"
    var arg = document.getElementById("uname").value;
    //var type = "search=" + document.getElementById("uname").value;
    var Accountid = "" ;
    // get the account_id from the player that is filled in the input field//
    getDataFromApi(type, arg,  function(data) {
        console.log(data)
        var respLen = data.meta.count;
        data = data.data["0"];
        
            if (respLen == 0) {
                alert('Invalid Name, please try again');
            }
            else {
                Accountid = data['account_id']
                document.getElementById("NickName").innerHTML = "Overall player statistics for: " + data['nickname'] ;
                $('#Comments').addClass("hidden");
                $('#stats-section').removeClass("hidden");
                data = "";  
                getGenericAccountStats(Accountid);
            }
    return false;
    });
}
function getGenericAccountStats(acc_id) {

    //should trigger automatically to search the player stats based on the found account_id//
    var type = "account_id"
    var arg = acc_id.toString();
    getDataFromApi(type, arg, function(data) {
        var account = acc_id;
        
        var GlobalRating = data.data[account].global_rating;
        var LastBattle = data.data[account].last_battle_time;
        let timeValue = new Date(LastBattle);
        
        timeValue = timeValue * 1000;
        var d = new Date(timeValue);
        document.getElementById("Global_Rating").innerHTML = "Global Rating: " + GlobalRating ;
        document.getElementById("Last_Battle").innerHTML = "Last Battle played at: " + d ;
        data = data.data[account].statistics.all;
        var win = data['wins'] / data['battles'] ;
        
        var winpercent = (win * 100).toFixed(2) + "%";
        var losspercent = ((1-win) * 100).toFixed(2) + "%";
        var battlesFought = data['battles'];
        
        var error = "";
        // ------------------------------------------------------------Get now the data of the player on his specific tanks
        getAccountTankData(account)
        
    return false;
    });
}
function getAccountTankData(acc_id) {

    //should trigger automatically to search the player stats based on the found account_id//
    var type = "Player-vehicle"
    var arg = acc_id.toString();
    getDataFromApi(type, arg, function(data) {

        var account = acc_id;
        var myTankArray = [];
        
        data = data.data[account];
        
        data.forEach(function(item) {
            var MoM = item.mark_of_mastery;
            var tankid = item.tank_id;
            var battles = item.statistics.battles;
            var wins = item.statistics.wins;
            myTankArray.push({
            "Name": tankid,
            "WinAmount":  wins,
            "BattleAmount":battles,
            "Mastery": MoM
            });
            
        });
        //working code to get specific tank stats-----------------------------------------------------------------------------------------------
        getAccountTankStats(myTankArray);
        
    return false;
    });
}
//---------------------------------------------------------------------------------------get all the tank data
function getAccountTankStats(myTankArray) {

    //should trigger automatically to search the player stats based on the found account_id//
    var type = "vehicle"
    var arg = ""; //no need for an accountid
    getDataFromApi(type, arg, function(data) {
        data = data.data;
        var TankArray = [];
            Object.keys(data).forEach(function(key) {
                var Name = data[key].name;
                var Nation = data[key].nation;
                var Type = data[key].type;
                var Level = data[key].level;
                var Tank_id = data[key].tank_id; 
                TankArray.push({
                "Name": Name,
                "Nation":Nation,
                "Type":Type,
                "Level": Level,
                "Tank_Id": Tank_id
                });
            });
        //combine the to datasets (player-vehicle with vehicle stats)
        CombineArray(TankArray, myTankArray);
        return false;
        });
}
//---------------------------------------------------------------------------------------get all the tank data
function CombineArray(TankArray, myTankArray) {
    
    var TankStats = [];
    var TankStatsPie = [];
    Object.keys(myTankArray).forEach(function(key1){
    var TID = myTankArray[key1].Name;
    var Wins = myTankArray[key1].WinAmount;
    var Battles = myTankArray[key1].BattleAmount;
    var MoM = myTankArray[key1].Mastery;
        Object.keys(TankArray).forEach(function(key2){
            var TankID = TankArray[key2].Tank_Id;
            var Name = getSecondPart(TankArray[key2].Name);
            var Name = getSecondPart2(Name);
            var Nation = TankArray[key2].Nation;
            var Type = TankArray[key2].Type;
            var Level = TankArray[key2].Level;
            if (TID == TankID) {
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
                    "Name": Name,
                    "Nation":Nation,
                    "Type":Type,
                    "Level": Level,
                    // "Tank_Id":TankID,
                    "Wins": Wins,
                    "Battles": Battles,
                    "Mark": MoM,
                    "Winrate": ((Wins / Battles).toFixed(2)) * 100,
                }); 
            }
        });
        
    });
    
    var ArrayAsString =  JSON.stringify(TankStats)
    document.getElementById("trunkArray").value = ArrayAsString;
    
    var error = "";

    makeGraphs(error, TankStats);
    return false;
}
// ------------------------------------------------------------Get now the data of the player on his specific tanks
function makeGraphs(error, transactionsData) {
    var List = [];
    console.log(transactionsData)
    
    transactionsData.forEach(function(d){
        // d.Amount = parseInt(d.Amount);
        d.Winrate = parseInt(d.Winrate);
        d.Wins = parseInt(d.Wins);
        d.Battles = parseInt(d.Battles);
    });
    
    var ndx = crossfilter(transactionsData);
    
    show_selectors(ndx);
    MakePieChart(ndx);
    MakePieChartTier(ndx);
    MakePieChartNation(ndx);
    makeGraphsWinRate(ndx);
    MakeDataTable(ndx);
}
function show_selectors(ndx) {
    var disciplineDimNation = ndx.dimension(dc.pluck("Nation"));
    var disciplineSelectNation = disciplineDimNation.group();

    var disciplineDimLevel = ndx.dimension(dc.pluck("Level"));
    var disciplineSelectLevel = disciplineDimLevel.group();

    var disciplineDimType = ndx.dimension(dc.pluck("Type"));
    var disciplineSelectType = disciplineDimType.group();
    
    dc.selectMenu("#Nation_selector")
        .dimension(disciplineDimNation)
        .group(disciplineSelectNation);
        
    dc.selectMenu("#Tier_selector")
        .dimension(disciplineDimLevel)
        .group(disciplineSelectLevel)
        
    dc.selectMenu("#Type_selector")
        .dimension(disciplineDimType)
        .group(disciplineSelectType);
    
    dc.selectMenu("#Tier_selector2")
        .dimension(disciplineDimLevel)
        .group(disciplineSelectLevel)    
        
}
function MakePieChart(ndx){
    
    var name_dim = ndx.dimension(dc.pluck('Type'));
    var total_battles = name_dim.group().reduceSum(dc.pluck('Battles'));
    
    dc.pieChart('#Type-chart')
        .height(300)
        .width(380)
        .radius(90)
        .transitionDuration(1500)
        .dimension(name_dim)
        .group(total_battles)
        .legend(dc.legend().x(15).y(25).itemHeight(10).gap(5));
    dc.renderAll();
    
}
function MakePieChartTier(ndx){
    
    var name_dim = ndx.dimension(dc.pluck('Level'));
    var total_battles = name_dim.group().reduceSum(dc.pluck('Battles'));
    
    dc.pieChart('#Tier-chart')
        .height(300)
        .width(380)
        .radius(90)
        .transitionDuration(1500)
        .dimension(name_dim)
        .group(total_battles)
        .ordering(function(d) { return d.key })
        .legend(dc.legend().x(15).y(25).itemHeight(10).gap(5));
        
        
    dc.renderAll();
    
}
function MakePieChartNation(ndx){
    
    var name_dim = ndx.dimension(dc.pluck('Nation'));
    var total_battles = name_dim.group().reduceSum(dc.pluck('Battles'));
    
    dc.pieChart('#Nation-chart')
        // .width($('#Nation-chart').innerWidth())
        // .height($('#Nation-chart').innerHeight())
        
        .height(300)
        .width(380)
        .radius(90)
        .transitionDuration(1500)
        .dimension(name_dim)
        .group(total_battles)
        .legend(dc.legend().x(15).y(25).itemHeight(10).gap(5));
    dc.renderAll();
    
}
function makeGraphsWinRate(ndx) {
var dim = ndx.dimension(dc.pluck('Level'));
        var group = dim.group().reduce(
            function (p, v) {
                p.count++;
                p.wins += v.Wins;
                p.battles += v.Battles;
                p.average = p.wins / p.battles;
                return p;
            },
            function (p, v) {
                p.count--;
                if (p.count == 0) {
                    p.wins = 0;
                    p.Battles = 0;
                    p.average = 0;
                } else {
                    p.wins -= v.Wins;
                    p.battles -= v.Battles;
                    p.average = p.wins / p.battles;
                }
                return p;
            },
            function () {
                return {wins: 0, count: 0, total: 0, average: 0, battles: 0};
            }
        );
     
    var chart = dc.barChart("#bar-chart");
    chart
        .width(400)
        .height(300)
        .margins({ top: 10, right: 150, bottom: 50, left: 50 })
        .dimension(dim)
        .group(group)
        .valueAccessor(function (p) {
            return p.value.average.toFixed(4);
            // return p.value.average
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .colorAccessor(function (d) {
            return d.key;
        })
        .xAxisLabel("Level")
        .yAxis().ticks(9);
        
        dc.renderAll();
    }
function MakeDataTable(ndx){

    var Dim = ndx.dimension(function (d) {return d.Name;})
    dc.dataTable("#Table")
      .width(250).height(800)
      .dimension(Dim)
      .group(function(d) {return ' '})
      .size(205)             // number of rows to return
      .columns([
    //   function(d) { return d.Mouse;},
      function(d) { return d.Name;},
      function(d) { return d.Nation;},
      function(d) { return d.Type;},
      function(d) { return d.Level;},
      function(d) { return d.Wins;},
      function(d) { return d.Battles;},
      function(d) { return d.Mark;},
      function(d) { return d.Winrate;},
    ])
      .sortBy(function(d){ return d.Winrate;})
      .order(d3.descending);

dc.renderAll();
    
}