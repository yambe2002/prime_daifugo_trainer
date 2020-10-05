const MAX_NUM = 2000000000;
const MAX_CARD_NUM = 7;

function primeChecker() {
    let inputElement = document.getElementById('prime_check_input');
    let msgElement = document.getElementById('prime_check_msg');
    msgElement.innerHTML = checkIsPrime(inputElement.value);
}

function checkIsPrime(value) {
    if(!value) return "Please enter a number greater than 2 to check its primality.";
    let parsed = parseInt(value);
    if(isNaN(parsed) || parsed < 2) return "Invalid Number";
    if(parsed > MAX_NUM) return "Too large to process";
    if(isPrime(parsed))
        return value + " is a prime number!";
    else
        return value + " is not prime."
}

// num guaranteed to be integer greater than 1
function isPrime(num) {
    if(num < 2) return false;
    if(num > MAX_NUM) return false;
    for(let i=2; i*i<=num; i++)
    {
        if(num % i == 0)
            return false;
    }
    return true;
}

function findCandidates() {
    let inputElement = document.getElementById('find_candidate_input');
    let msgElement = document.getElementById('find_candidate_msg');
    let resultElement = document.getElementById('find_candidate_result');

    resultElement.innerHTML = "";
    msgElement.innerHTML = "";

    if(!inputElement.value)
        return;
    else if(!isValidCards(inputElement.value))
        msgElement.innerHTML = "Not a valid card expression";
    else {
        resultElement.innerHTML = "please wait...";
        setTimeout(() => 
            runFindCandidates(resultElement, inputElement.value),
            5);
    }
}

// value guaranteed not to be an Empty
function isValidCards(value) {
    values = value.split(' ').map(x => x.trim());

    // more than 2 jokers
    if(values.filter(x => x == '*').length > 2)
        return false;

    // more than 4 same cards
    for(let i=1; i<=13; i++) {
        if(values.filter(x => x == i.toString()).length > 4)
            return false;
    }

    return values.length > 0 && values.every(x => isValidCard(x));
}

function isValidCard(value) {
    if(value === '*') return true;
    let parsed = parseInt(value);
    return !isNaN(parsed) && parsed >= 1 && parsed <= 13;
}

function runFindCandidates(element, value) {
    let ans = [];
    let cur = [];
    let values = value.split(' ').map(x => x.trim());
    let usedIndices = new Set();

    runFindCandidates_Dfs(element, ans, cur, values, usedIndices);
    updateResult(element, ans);
}

function runFindCandidates_Dfs(element, ans, cur, values, usedIndices) {
    evalCandidate(element, values, ans, cur);

    if(cur.length == MAX_CARD_NUM)
        return;
    
    for(let i=0; i<values.length; i++) {
        if(usedIndices.has(i))
            continue;
        usedIndices.add(i);
        cur.push(i);

        runFindCandidates_Dfs(element, ans, cur, values, usedIndices);

        usedIndices.delete(i);
        cur.pop();
    }
}

function evalCandidate(element, values, ans, cur, joker1=-1, joker2=-1) {
    if(cur.length == 0) return;
    let jokerNum = cur.filter(x => values[x] == '*').length;

    if(joker1 == -1 && jokerNum != 0) {
        for(let j1=0; j1<=13; j1++)
        {
            for(let j2=-1; j2<=13; j2++)
            {
                if(jokerNum == 1 && j2 != -1) break;
                if(jokerNum == 2 && j2 == -1) continue;
                evalCandidate(element, values, ans, cur, j1, j2);
            }
        }
    } else {
        let value = getValue(values, cur, joker1, joker2);
        if(isPrime(value)) {
            ans.push(getAns(values, cur, joker1, joker2));
        }
    }
}

function getValue(values, cur, joker1, joker2) {
    let v = cur.map(c => values[c]);
    if(joker1 != -1)
    {
        let j1 = v.indexOf('*');

        // should not start from zero
        if(j1 == 0 && joker1 == 0)
            return -1;

        v[j1] = joker1;
    }
    if(joker2 != -1)
    {
        let j2 = v.indexOf('*');

        // should not start from zero
        if(j2 == 0 && joker2 == 0)
            return -1;
        
        v[j2] = joker2;
    }
    return parseInt(v.join(''));
}

function getAns(values, cur, joker1, joker2) {
    let ret = [];
    let j1used = false;
    for(let i=0; i<cur.length; i++)
    {
        if(values[cur[i]] == '*') {
            if(j1used) ret.push('*(' + joker2 + ')');
            else {
                ret.push('*(' + joker1 + ')');
                j1used = true;
            } 
        } else {
            ret.push(values[cur[i]].toString());
        }
    }
    return ret;
}

function updateResult(element, ans) {
    ans.sort(ansCompare);
    ans = ans.map(x => x.toString());
    ans = distinct(ans);
    element.innerHTML = ans.join("<br>");
}

function distinct(ans) {
    let ret = [];
    let set = new Set();
    for(let i=0; i<ans.length; i++) {
        if(set.has(ans[i])) continue;
        ret.push(ans[i]);
        set.add(ans[i]);
    }
    return ret;
}

function ansCompare(a, b) {
    return getIntFromAns(b) - getIntFromAns(a);
}

function getIntFromAns(v) {
    let wk = v.map(c => getIntStrFromAns_Element(c)).join('');
    return parseInt(wk);
}

function getIntStrFromAns_Element(c) {
    if(!c.includes('(')) return c;
    let ret = c.substring(c.indexOf('(') + 1, c.length - c.indexOf('('));
    return ret;
}
