import { useCallback, useEffect, useRef, useState } from "react";

type CongratulationOptions = {
  BREAK_POINT: number;
  ADD_HEIGHT: number;
  SPEED_LEVEL: number;
  PC_QUANTITY: number;
  SP_QUANTITY: number;
};

class Congratulation {
  private area: HTMLElement;
  private id: string;
  private height: number;
  private color: string[];
  private OPTION: CongratulationOptions;
  private isPC: boolean | undefined;

  constructor(elm: HTMLElement) {
    this.area = elm;
    this.id = "confetti";
    this.height = 0;
    this.color = [
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
      "#F5C532",
    ];
    this.OPTION = {
      BREAK_POINT: 765,
      ADD_HEIGHT: 0, // 紙吹雪が降る範囲はエリア高＋この高さ
      SPEED_LEVEL: 10, // 小さくするほど速くなる
      PC_QUANTITY: 100, // BREAK_POINT以上での紙吹雪の総枚数
      SP_QUANTITY: 130 // BREAK_POINT以下での紙吹雪の総枚数
    };
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
        '@keyframes moving-' + parseInt((i + 7).toString(), 10) + ' {' +
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
    // this.area.empty(); // 紙吹雪要素を削除
    const element = document.getElementById(this.id);
    if (element) {
      element.remove();
    }
    this.area.innerHTML = "";
    this.create(); // <style>生成とHTMLタグ生成を再実行
  }
  create() {
    this.height = 700//this.area?.scrollHeight();
    // スタイルの生成
    // 上から下まで落ちるミリ秒数（エリア高 * スピードレベル + ランダム<0~9> * 100<ミリ秒化>）
    const duration = this.height * this.OPTION.SPEED_LEVEL + (Math.floor(Math.random() * 10)) * 100;
    // durationを3分割して、アニメーション開始タイミングを3回に分ける
    let index = 0;
    const appendConfetti = () => {
      const QUANTITY = this.isPC ? this.OPTION.PC_QUANTITY : this.OPTION.SP_QUANTITY;
      for (let i = 0; i < Math.floor(QUANTITY / 3); i++) {
        // 1階層目のスタイル生成
        const keyframe = 'moving-' + (Math.floor(Math.random() * 12) + 1); // 0の生成を防ぐ
        const delay = duration / (Math.floor(Math.random() * 10));
        const outerStyle = [
          'top: -20px;',
          'left: ' + Math.floor(Math.random() * 100) + '%;',
          'width: ' + (Math.floor(Math.random() * 4) + 4) + 'px;',
          'height: ' + (Math.floor(Math.random() * 4) + 4) + 'px;',
          'animation: ' + keyframe + ' ' + duration + 'ms linear infinite;',
          'animation-delay: ' + delay + 'ms;',
        ];
        // 2階層目・3階層目のスタイル生成
        const color = this.color[Math.floor(Math.random() * 12)];
        const rotateKeyframe = Math.floor(Math.random() * 2) ? 'rotateY' : 'rotate360';
        const innerRotateStyle = rotateKeyframe === 'rotateY' ? 'transform: rotate(' + Math.floor(Math.random() * 60) + 'deg);' : '';
        const bodyStyle = [
          'background-color: ' + color + ';',
          'animation: ' + rotateKeyframe + ' 500ms linear infinite;',
          'animation-delay: ' + delay + 'ms;'
        ];
        // html生成

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
        this.area.appendChild(newElement);

      }

      index += 1;
      if (index >= 2) {
        clearInterval(timer);
      }
    }
    appendConfetti();
    const timer = setInterval(appendConfetti, duration / 3);
  }
  public init() {
    this.isPC = window.innerWidth >= this.OPTION.BREAK_POINT;
    this.create();
    this.addStyle();
    console.log(new Date());

    const handleResize = () => {
      const width = window.innerWidth;
      setTimeout(() => {
        if (width === window.innerWidth) {
          this.updateDevice();
          this.restart();
        }
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }
}


/**
 * 実行
 */
const start = () => {
  const congratulationElm = document.getElementById('confetti');
  if (congratulationElm) {
    console.log("3================>");

    let congratulation = new Congratulation(congratulationElm);
    congratulation.init();
  }
};


const Confetti: React.FC = () => {
  const confettiRef = useRef<HTMLDivElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const init = () => {
    if (confettiRef.current) {
      const congratulation = new Congratulation(confettiRef.current);
      congratulation.init();
      setDrawing(true);
    }
  }

  useEffect(() => {
    if (!drawing) {
      const timer = setTimeout(() => {
        init();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [drawing]);

  return <div className="confetti" id="confetti" ref={confettiRef}>
  </div>;

};

export default Confetti;
