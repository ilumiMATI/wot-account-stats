"use strict"

let nickname = 'ilumi';
let WOT_ACCOUNTS_API_URL = "https://api.worldoftanks.eu/wot/account/list/?application_id=c2e67f6438eacf8cfd51f256cd4b4c3c&limit=10&search=";
let WOT_TANKS_STATS_API_URL = "https://api.worldoftanks.eu/wot/tanks/stats/?application_id=c2e67f6438eacf8cfd51f256cd4b4c3c&fields=random%2Ctank_id&extra=random&account_id="
let WOT_ENCYCLOPEDIA_TANKS_API_URL = "https://api.worldoftanks.eu/wot/encyclopedia/vehicles/?application_id=c2e67f6438eacf8cfd51f256cd4b4c3c&fields=images%2Cname%2Cshort_name%2Ctier%2Ctype%2Ctank_id&tank_id="

async function getTanksStatsList(account_id) {
    let response = await fetch(WOT_TANKS_STATS_API_URL + account_id);
    let json = await response.json();
    return await json['data'][account_id];
}

async function getTankInfoObject(tank_id_list) {
    let tanksString = tank_id_list.join('%2C');
    let response = await fetch(WOT_ENCYCLOPEDIA_TANKS_API_URL + tanksString);
    let json = await response.json();
    return await json['data'];
}

async function getAccountList() {
    let response = await fetch(WOT_ACCOUNTS_API_URL + nickname);
    let json = await response.json();
    return await json['data'];
}
async function showAccountList() {
    let accountList = await getAccountList();

    accountList.forEach(player => {
        console.log(player.nickname)
    });
}

async function createAccountParagraphs() {
    let accounts = await getAccountList();

    let div = document.getElementById('found');
    let h1 = document.createElement('h1');
    h1.innerHTML = 'Znalezieni gracze';
    div.appendChild(h1);
    accounts.forEach((account) => {
        let text = document.createTextNode(account.nickname)
        let btn = document.createElement('button');
        btn.classList.add('player')
        btn.onclick = () => handlePlayer(account.account_id,account.nickname);
        btn.appendChild(text);
        div.appendChild(btn);
    })
    document.body.appendChild(div);
}

function handleSearch() {
    let inputElem = document.getElementById('inputText');
    nickname = inputElem.value;
    let foundElem = document.getElementById('found');
    foundElem.innerText = '';
    createAccountParagraphs();
}

async function handlePlayer(account_id, name) {
    let div = document.getElementById('found');
    div.textContent = '';
    let player = document.createElement('h1');
    player.innerText = `${name} | ${account_id}`;
    div.appendChild(player);

    let tanksStats = await getTanksStatsList(account_id);
    let table = document.createElement('table');
    let headerRow = document.createElement('tr');
    let column0 = document.createElement('th');
    column0.innerText = 'Icon';
    let column1 = document.createElement('th');
    column1.innerText = 'Tank';
    let column2 = document.createElement('th');
    column2.innerText = 'Battles';
    let column3 = document.createElement('th');
    column3.innerText = 'WR';
    let column4 = document.createElement('th');
    column4.innerText = 'KD';
    let column5 = document.createElement('th');
    column5.innerText = 'KB';
    headerRow.append(column0,column1,column2,column3,column4,column5);
    table.appendChild(headerRow);

    tanksStats.sort((b,a) => {
        let ba = a.random.battles;
        let bb = b.random.battles;
        if(ba > bb) return 1;
        if(ba < bb) return -1;
        return 0;
    })

    let tank_id_list = []
    for(let i = 0; 
        i < 100 && i < tanksStats.length; 
        i++) {
        let tank = tanksStats[i].tank_id; 
        tank_id_list.push(tank);
    }

    let tanksInfo = await getTankInfoObject(tank_id_list);

    for(let i = 0; i < 100 && i < tanksStats.length; i++) {
        let tank = tanksStats[i];
        let id = tank.tank_id;
        let battles = tank.random.battles;
        let wins = tank.random.wins;
        let survived = tank.random.survived_battles;
        let deaths = battles - survived;
        deaths = (deaths <= 0) ? 1 : deaths;
        let frags = tank.random.frags;

        let wr = wins / battles * 100;
        wr = Math.round((wr + Number.EPSILON) * 100) / 100;
        let kd = frags / deaths;
        kd = Math.round((kd + Number.EPSILON) * 100) / 100;
        let kb = frags / battles;
        kb = Math.round((kb + Number.EPSILON) * 100) / 100;

        let row = document.createElement('tr');
        let img_th = document.createElement('th')
        img_th.innerHTML = '<img src="'+tanksInfo[id].images.small_icon+'" alt="">';
        let name_th = document.createElement('th')
        name_th.innerHTML = tanksInfo[id].name;
        let battles_th = document.createElement('th')
        battles_th.innerHTML = battles;
        let wr_th = document.createElement('th')
        wr_th.innerHTML = wr;
        let kd_th = document.createElement('th')
        kd_th.innerHTML = kd;
        let kb_th = document.createElement('th')
        kb_th.innerHTML = kb;

        row.appendChild(img_th);
        row.appendChild(name_th);
        row.appendChild(battles_th);
        row.appendChild(wr_th);
        row.appendChild(kd_th);
        row.appendChild(kb_th);
        table.appendChild(row);
    }
    div.appendChild(table);
}

