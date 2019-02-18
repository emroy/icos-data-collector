#! /usr/bin/env node

var axios = require('axios');
var path = require('path');
var fs = require('fs');

var interests = ['BTC', 'ETH', 'LTC','BCH','ONX','WAVES']

var api = {
    front:'http://coincap.io/front',
    coins: 'http://coincap.io/coins',
    map: 'http://coincap.io/map',
    total: 'http://coincap.io/global',
    single: 'http://coincap.io/page/:coin:'
}

function main(type){
    
    switch(type) {

        case 'start':
            makeLayout();
        break
        
        case 'save':
            alternate();
        break

        case 'coins':
            saveSingle(interests);
        break

        case undefined:
            defaultProcess();
            setInterval(function(){
                try {
                    defaultProcess();
                } catch(error) {
                    console.log(error);
                }
            },60000);
            setInterval(function(){
                try {
                    alternate();
                } catch(error) {
                    console.log(error);
                }
            },120000);
        break;

        default:
            console.log('Invalid parameter... Usage: [coins | save | start | "blank" ]');
        break;
        

    }
}

function alternate(){
    saveIcos()
    mapCoins()
    updateTotal()
    console.log('Proceso Alterno finalizado... Durmiendo 2 minuto.');
}

function defaultProcess(){
    getFront();
    saveSingle(interests);
    console.log('Proceso Default finalizado... Durmiendo 1 minuto.');
}

function makeLayout(){

}

function getFront(){
    return axiosRequest(api.front, response => {
        storeData(response, 'front');
    });
}

function storeData(data, type){
    var time = (new Date()).getTime()
    var toSave = JSON.stringify(data.data);
    fs.appendFile('data_collections/'+type+'/'+String(time+'-'+type+'.json'), toSave, function(err) {
        if(err) throw err
        console.log('File '+type+' Saved Successfully')
        return
    });
}

function axiosRequest(url, callBack)
{
    axios.get(url).then(response => {
        callBack(response)
    }).catch(err => {
        throw err
    });
}

function saveIcos()
{
    return axiosRequest(api.coins, response => {
        storeData(response, 'coins');
    });
}

function saveSingle(int)
{
    int.forEach(function(element){
        axiosRequest(api.single.replace(':coin:',element), response => {
            var time = (new Date()).getTime();
            var toSave = JSON.stringify(response.data);
            fs.appendFile('data_collections/single/'+String(element)+'/'+String(time+'.json'), toSave, function(err) {
                if(err) throw err
                console.log('File '+element+' Saved Successfully')
                return
            });
        });  
    })
}

function mapCoins()
{
    return axiosRequest(api.map, response => {
        storeData(response, 'map');
    });
}

function updateTotal()
{
    return axiosRequest(api.total, response => {
        storeData(response, 'total');
    });
}

main(process.argv[2]);