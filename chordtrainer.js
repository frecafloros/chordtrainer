// 乱数生成器
let randomInt = (min, max) => {
	// 返値はmin以上max未満の整数
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
}

// ピッチクラスから音名への変換辞書
const pitch2keyname = {
	'0': 'C',
	'1': 'C#',
	'2': 'D',
	'3': 'D#',
	'4': 'E',
	'5': 'F',
	'6': 'F#',
	'7': 'G',
	'8': 'G#',
	'9': 'A',
	'10': 'A#',
	'11': 'B'
}

// scale
const scale = [
	'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
	'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
	'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'
]

// chord の pitch class
const chordTypes = [
	// triad
	{'chordName': '', 'chordKeys': [0,4,7]},
	{'chordName': 'm', 'chordKeys': [0,3,7]},
	{'chordName': 'dim', 'chordKeys': [0,3,6]},
	{'chordName': 'aug', 'chordKeys': [0,4,8]},
	{'chordName': 'sus4', 'chordKeys': [0,5,7]},
	{'chordName': 'sus2', 'chordKeys': [0,2,7]},
	// tetrad
	{'chordName': '7', 'chordKeys': [0,4,7,10]},
	{'chordName': 'm7', 'chordKeys': [0,3,7,10]},
	{'chordName': 'M7', 'chordKeys': [0,4,7,11]},
	{'chordName': 'mM7', 'chordKeys': [0,3,7,11]},
	{'chordName': 'm7b5', 'chordKeys': [0,3,6,10]},
	{'chordName': 'dim7', 'chordKeys': [0,3,6,9]},
	{'chordName': 'aug7', 'chordKeys': [0,4,8,10]},
	{'chordName': 'augM7', 'chordKeys': [0,4,8,11]},
	{'chordName': '6', 'chordKeys': [0,4,7,9]},
	{'chordName': 'm6', 'chordKeys': [0,3,7,9]},
	{'chordName': 'add9', 'chordKeys': [0,2,4,7]},
	{'chordName': 'blk', 'chordKeys': [0,6,10,14]},
	//pentad
	{'chordName': '9', 'chordKeys': [0,2,4,7,10]},
	{'chordName': 'm9', 'chordKeys': [0,2,3,7,10]},
	{'chordName': '7(b9)', 'chordKeys': [0,1,4,7,10]},
	{'chordName': 'm7(b9)', 'chordKeys': [0,1,3,7,10]},
	{'chordName': '7(#9)', 'chordKeys': [0,3,4,7,10]},
	{'chordName': 'm7(11)', 'chordKeys': [0,3,5,7,10]},
	{'chordName': '7(#11)', 'chordKeys': [0,4,6,7,10]},
	{'chordName': '7(13)', 'chordKeys': [0,4,7,9,10]},
	{'chordName': 'm7(13)', 'chordKeys': [0,3,7,9,10]},
]

// 変数
let chord = []; // コードの音高集合
let rootPc = 0; // 根音のdegree
let chordNum = 0; // コード番号
let checkChordTypes = []; // コード番号抽選用
let t = 100; // サウンドビジュアル描画用イテレーター
const rVisual = 140; // サウンドビジュアル描画半径
let size = 0; // ビジュアライズ半径

// constrellation のサイズ
const canvasWidth = 200;
const canvasHeight = 200;

// クリック判定用
const onclickSound = document.getElementById("btn-sound");
const onclickQA = document.getElementById("btn-qa");

// buttonQAの状態取得
const buttonQAId = document.getElementById("btn-qa");
let buttonQAClass = document.getElementsByClassName("qa-next");

// 状態判定用
let drawFlag = 1; // サウンドビジュアルを表示していい場合は0

// シンセ
let synth = new Tone.PolySynth().toDestination();

// chord constellationの描画
function setup(){
	createCanvas(canvasWidth, canvasHeight).parent('chord-constellation');

	textAlign(CENTER,CENTER);
	textSize(16);
	textFont('Optima');

	translate(canvasWidth/2, canvasHeight/2);
	const r = 80;
	for(let i=0;i<12;i++){
		text(pitch2keyname[i], r*sin(i*TAU/12), -1*r*cos(i*TAU/12));
	}

	// 描画停止
	noLoop();
}

// サウンドビジュアル描画（メインループ？）
function draw(){
	// user gesture
	onclickSound.onclick = buttonSound;
	onclickQA.onclick = buttonQA;

	if(t<60){
		// 描画
		drawConstellation();
		soundVisualizer();

		// buttonQAを非活性化
		buttonQAId.setAttribute("disabled", true);
	}else{
		// 描画停止
		noLoop();
		
		// buttonQAを活性化
		buttonQAId.removeAttribute("disabled");
	}
}

// 描画
let tmpTone = 0;
let tmpRad = 0;

function drawConstellation(){
	// constellation の棒消去
	erase();
	circle(canvasWidth/2, canvasHeight/2, 140);
	noErase();

	// constellation の棒描画
	const l = 55;
	let tmpPitch = rootPc;

	colorMode(RGB);

	strokeWeight(2);
	stroke(0);
	line(canvasWidth/2, canvasHeight/2, l*sin(tmpPitch*TAU/12)+canvasWidth/2, -1*l*cos(tmpPitch*TAU/12)+canvasHeight/2);
	
	strokeWeight(1);
	stroke(127);
	for(let i=1;i<chord.length;i++){
		tmpPitch = rootPc + chordTypes[chordNum]['chordKeys'][i];
		line(canvasWidth/2, canvasHeight/2, l*sin(tmpPitch*TAU/12)+canvasWidth/2, -1*l*cos(tmpPitch*TAU/12)+canvasHeight/2);
	}
}

function soundVisualizer(){
	t = t + 1;

	// 円弧の size 設定
	if(t<4){
		// Attack
		size = rVisual/4*t;
	}else if(t<10){
		// Decay
		size = rVisual - rVisual/4*(t-4)/6;
	}else{
		// Release
		size = rVisual*3/4 - rVisual*3/4*(t-10)/50;
	}

	//円弧を描く
	colorMode(HSB);
	for(let i=0;i<chord.length;i++){
		tmpTone = (rootPc + chordTypes[chordNum]['chordKeys'][i])%12;
		fill(30*tmpTone,60,85,0.4);
		stroke(30*tmpTone,60,85);
		tmpRad = tmpTone*TAU/12 - HALF_PI;
		arc(canvasWidth/2,canvasHeight/2,size,size,tmpRad-0.2,tmpRad+0.2,PIE);
	}
}

// config の checkbox (all)
const checkAll = document.getElementById("checkAll");
const checkTriad = document.getElementById("checkTriad");
const checkTetrad = document.getElementById("checkTetrad");
const checkPentad = document.getElementById("checkPentad");
const chordval = document.getElementsByName("chordval");

checkAll.addEventListener("click", ()=>{
	if(checkAll.checked){
		checkTriad.checked = true;
		checkTetrad.checked = true;
		checkPentad.checked = true;
		for(let i=0;i<=chordval.length;i++){
			chordval[i].checked = true;
		}
	}else{
		checkTriad.checked = false;
		checkTetrad.checked = false;
		checkPentad.checked = false;
		for(let i=0;i<=chordval.length;i++){
			chordval[i].checked = false;
		}
	}
});

checkTriad.addEventListener("click", ()=>{
	if(checkTriad.checked){
		for(let i=0;i<=5;i++){
			chordval[i].checked = true;
		}
	}else{
		for(let i=0;i<=5;i++){
			chordval[i].checked = false;
		}
	}
});

checkTetrad.addEventListener("click", ()=>{
	if(checkTetrad.checked){
		for(let i=6;i<=17;i++){
			chordval[i].checked = true;
		}
	}else{
		for(let i=6;i<=17;i++){
			chordval[i].checked = false;
		}
	}
});

checkPentad.addEventListener("click", ()=>{
	if(checkPentad.checked){
		for(let i=18;i<=26;i++){
			chordval[i].checked = true;
		}
	}else{
		for(let i=18;i<=26;i++){
			chordval[i].checked = false;
		}
	}
});

// tone.js っぽいところ
let buttonSound = () => {
	// 音声流す
	synth.triggerAttackRelease(chord, "4n");

	// サウンドビジュアライズ
	if(drawFlag == 0){
		t=0;
		loop();
	}
}

let buttonAnswer = () =>{
	// constellation の棒描画
	drawConstellation();

	// chord name表示
	const targetName = document.getElementById("chordname-txt");
	targetName.classList.add("chord-icon");
	targetName.classList.add("hue12-"+rootPc);

	const chordName1 = document.getElementById("chordname-1");
	chordName1.innerHTML = pitch2keyname[rootPc] + chordTypes[chordNum]['chordName'];

	const chordName2 = document.getElementById("chordname-2");
	const chordKeynames = chordTypes[chordNum]['chordKeys'].map(x => pitch2keyname[(x+rootPc)%12]);
	chordName2.innerHTML = chordKeynames;
}

let buttonNext = () => {
	// テキスト消去
	const targetName = document.getElementById("chordname-txt");
	targetName.classList.remove("chord-icon");
	targetName.classList.remove("hue12-"+rootPc);

	const chordName1 = document.getElementById("chordname-1");
	chordName1.innerHTML = "";

	const chordName2 = document.getElementById("chordname-2");
	chordName2.innerHTML = "";

	// constellation の棒消去
	erase();
	circle(canvasWidth/2, canvasHeight/2, 120);
	noErase();

	// checkbox 検知
	checkChordTypes = [];
	for(let i=0;i<chordval.length;i++){
		if(chordval[i].checked == true){
			checkChordTypes.push(chordval[i].value);
		}
	}

	// 根音と和音の種類を決定
	rootPc = randomInt(0,12);
	chordNum = checkChordTypes[randomInt(0,checkChordTypes.length)];

	// 和音生成
	chord = [];
	for (let j=0;j<chordTypes[chordNum]['chordKeys'].length; j++){
		let pitch = scale[rootPc+chordTypes[chordNum]['chordKeys'][j]];
		chord.push(pitch);
	}

	// 音声流す
	synth.triggerAttackRelease(chord, "4n");
}

// qaボタン制御
let buttonQA = ()=>{
	if(buttonQAClass.length == 0){
		// 現在のclassがqa-answer
		buttonAnswer();
		buttonQAId.classList.remove("qa-answer");
		buttonQAId.classList.add("qa-next");
		drawFlag = 0;
	}else{
		// 現在のclassがqa-next
		buttonNext();
		buttonQAId.classList.remove("qa-next");
		buttonQAId.classList.add("qa-answer");
		drawFlag = 1;
	}
}