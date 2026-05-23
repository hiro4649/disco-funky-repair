class Congratulation {
    constructor($elm) {
        this.$area = $elm;
        this.id = 'congratulation-style';
        this.height;
        this.color = [ // 12カラー
            "#3181A8",
            "#FCEE3D",
            "#D4297E",
            "#D94724",
            "#93CBCE",
            "#3D9148",
            "#E79549",
            "#E397AD",
            "#93CBCE",
            "#D2B155",
            "#AC7DB1",
            "#F5C532"
        ];
        this.OPTION = {
            BREAK_POINT: 768,
            ADD_HEIGHT: 70, // 紙吹雪が降る範囲はエリア高＋この高さ
            SPEED_LEVEL: 10, // 小さくするほど速くなる
            PC_QUANTITY: 150, // BREAK_POINT以上での紙吹雪の総枚数
            SP_QUANTITY: 75 // BREAK_POINT以下での紙吹雪の総枚数
        }
        this.isPC;
    }
    updateDevice() {
        let width = window.innerWidth;
        if (width >= this.OPTION.BREAK_POINT) {
            if (this.isPC) return;
            this.isPC = true;
        } else {
            if (!this.isPC) return;
            this.isPC = false;
        }
    }
    addStyle() {
        // styleタグを作成
        const css = document.createElement('style');
        css.media = 'screen';
        css.type = 'text/css';
        css.id = this.id;
        let rulesStr = '';
        // 移動のkeyframes定義
        for (let i = -6; i < 6; i++) {
            // moving-1 ～ moving-12 を生成
            rulesStr +=
                '@keyframes moving-' + parseInt(i + 7, 10) + ' {' +
                '0% { opacity: 0; transform: translate(0, 0); }' +
                '10% { opacity: 1; }' +
                '90% { opacity: 1; }' +
                '100% { opacity: 0; transform: translate(' + i * 10 + 'px, ' + (this.height + this.OPTION.ADD_HEIGHT) + 'px); }' +
                '}';
        }
        // ルールをstyleタグに追加
        const rules = document.createTextNode(rulesStr);
        css.appendChild(rules);
        // head内に作成
        document.getElementsByTagName('head')[0].appendChild(css);
    }
    restart() {
        $(this.id).remove(); // <head>の<style>タグを削除
        this.$area.empty(); // 紙吹雪要素を削除
        this.create(); // <style>生成とHTMLタグ生成を再実行
    }
    create() {
        this.height = window.innerWidth//this.$area.height;
        // スタイルの生成
        this.addStyle();
        // 上から下まで落ちるミリ秒数（エリア高 * スピードレベル + ランダム<0~9> * 100<ミリ秒化>）
        const duration = this.height * this.OPTION.SPEED_LEVEL + (Math.floor(Math.random() * 10)) * 100;
        // durationを3分割して、アニメーション開始タイミングを3回に分ける
        let index = 0;
        const timer = setInterval(() => {
            const QUANTITY = this.isPC ? this.OPTION.PC_QUANTITY : this.OPTION.SP_QUANTITY;
            for (let i = 0; i < Math.floor(QUANTITY / 3); i++) {
                // 1階層目のスタイル生成
                const keyframe = 'moving-' + (Math.floor(Math.random() * 12) + 1); // 0の生成を防ぐ
                const delay = duration / (Math.floor(Math.random() * 10));
                // 2階層目・3階層目のスタイル生成
                const color = this.color[Math.floor(Math.random() * 12)];
                const rotateKeyframe = Math.floor(Math.random() * 2) ? 'rotateY' : 'rotate360';
                const innerRotateStyle = rotateKeyframe === 'rotateY' ? 'transform: rotate(' + Math.floor(Math.random() * 60) + 'deg);' : '';
                const bodyStyle = [
                    'background-color: ' + color + ';',
                    'animation: ' + rotateKeyframe + ' 500ms linear infinite;',
                    'animation-delay: ' + delay + 'ms;'
                ];
                const newElement = document.createElement('span');
                newElement.style.top = "-20px";
                newElement.style.left = Math.floor(Math.random() * 100) + '%';
                newElement.style.width = (Math.floor(Math.random() * 4) + 4) + 'px';
                newElement.style.height = (Math.floor(Math.random() * 4) + 4) + 'px';
                newElement.style.animation = keyframe + ' ' + duration + 'ms linear infinite';
                newElement.style.animationDelay = delay + 'ms';
                newElement.innerHTML = '<span style="' + innerRotateStyle + '">' +
                    '<span style="' + bodyStyle.join(' ') + '"></span>' +
                    '</span>';
                this.$area.appendChild(newElement);
            }
            // this.$area.append(html);

            index += 1;
            if (index >= 2) {
                clearInterval(timer);
            }
        }, duration / 3);
    }
    init() {
        this.isPC = window.innerWidth >= this.OPTION.BREAK_POINT;
        this.create();
        window.addEventListener('resize', function (event) {
            const w = window.innerWidth;
            setTimeout(() => {
                if (w === window.innerWidth) {
                    this.updateDevice();
                    this.restart(); // ウィンドウリサイズ時は紙吹雪を作り直し
                }
            }, 200);
        });
        // $(window).on('resize', () => {
        //     const w = window.innerWidth;
        //     setTimeout(() => {
        //         if (w === window.innerWidth) {
        //             this.updateDevice();
        //             this.restart(); // ウィンドウリサイズ時は紙吹雪を作り直し
        //         }
        //     }, 200);
        // });
    }
}

/*
 * 紙吹雪を舞わせる.
 */
const $congratulationElm = document.getElementsByClassName('confetti');

let congratulation = [];
for (var i = 0; i < $congratulationElm.length; i++) {
    congratulation.push(
        new Congratulation($congratulationElm[i])
    );
}

/**
 * 実行
 */
const start = () => {
    for (let i = 0; i < congratulation.length; i++) {
        congratulation[i].init();
    }
};

window.addEventListener('load', () => {
    const time = setInterval(() => {
        console.log("congratulationElm================>", $congratulationElm);
        if ($congratulationElm.length) {
            start();
            console.log("Started================>", $congratulationElm);
            clearInterval(time);
        }
    }, 100);
});
