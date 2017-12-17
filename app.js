'use strict';
const fs = require('fs');
const readline = require('readline');
const rs = fs.ReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });
const map = new Map();// key: 都道府県 value: 集計データのオブジェクト
// lineStringは無名関数の引数名
rl.on('line', (lineString) => {

    // lineStringをカンマで区切ったものを配列columnsに入れる
    const columns = lineString.split(',');
    // 配列columnsの[0]を文字列から整数値に変換して変数yearに格納
    const year = parseInt(columns[0]);
    // prefectureは文字列なのでそのまま格納
    const prefecture = columns[2];
    // 人口を整数値に直して変数popuに格納
    const popu = parseInt(columns[7]);
    if (year === 2010 || year === 2015) {
        // 県の名前をmapから取ってくる
        // なければvalueに偽が入る
        let value = map.get(prefecture);
        // 県の名前がなければ（初めて登場したら）
        if (!value) {
            // valueオブジェクトを初期化
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        // valueオブジェクトに人口を加算する
        if (year === 2010) {
            value.popu10 += popu;
        }
        if (year === 2015) {
            value.popu15 += popu;
        }
        // mapオブジェクトにkeyを県名、valueにオブジェクトで格納
        map.set(prefecture, value);
    }
});
rl.resume();
// closeイベントは全ての行を読み終わった後に呼ばれる
rl.on('close', () => {

    // 変化率は集計が終わった後出ないと計算できないので
    // ここで計算する

    // for-of構文
    // mapの中身を配列にして取得する
    // pair[0]は県名が入っている
    // pair[1]には集計オブジェクトが入っている
    for (let pair of map) {
        const value = pair[1];
        value.change = value.popu15 / value.popu10;
    }

    // 並べ替え

    // 連想配列を普通の配列に変換する
    // sortした値を配列rankignArrayに入れる
    // sortには比較関数として無名関数を入れる
    const rankingArray = Array.from(map).sort((pair1, pair2) => {
        // pair1,pair2は引数名だけど、どうやって値が入る？
        // 変化率を降順で並べ替えるため、正の数か負の数、を返す必要がある
        return pair2[1].change - pair1[1].change;
    })
    // ここで出てくるのはmap関数
    const rankingStrings = rankingArray.map((pair) => {
        // 県名:2010年の人口 => 2015年の人口 => 変化率 、という文字列が配列に入る
        return pair[0] + ': ' + pair[1].popu10 + '=>' + pair[1].popu15 + '=>' + ' 変化率:' + pair[1].change;
    })
    // オブジェクトmapの中身を表示
    console.log(rankingStrings);
}) 