import { BehaviorSubject } from "rxjs";
import { ballDefaultData, canvasDefaultData, playerOneDefaultData, playerStep, playerTwoDefaultData } from "./config";

import './assets/hit.mp3';
import './assets/score.mp3';
import './assets/wall.mp3';

interface IPlayerData {
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
}

interface IBallData {
    fill: string,
	r: number,
	cx: number,
	cy: number
}

interface IOptions {
    x?: number,  
    y?: number, 
    scores?: number,
    width?: number,
    height?: number,
    fill?: string,
    r?: number,
	cx?: number,
	cy?: number
}

interface ICanvas {
    width: number,
	height: number
}

interface IComponents {
    canvas: SVGElement, 
    playerOne: SVGRectElement, 
    playerTwo: SVGRectElement, 
    ball: SVGCircleElement, 
    playerOneScoreText: SVGTextElement, 
    playerTwoScoreText: SVGTextElement,
    infoPanel: SVGTextElement
}

interface IFeatureElements {
    playerSpeedInput: HTMLInputElement,
	ballSpeedInput: HTMLInputElement,
	maxScoresInput: HTMLInputElement,
	paddleWidthInput: HTMLInputElement,
	paddleHeightInput: HTMLInputElement
}

interface ISounds {
    hitSound: HTMLAudioElement,
	wallSound: HTMLAudioElement,
	scoreSound: HTMLAudioElement
}


/**
 * Get Common Elements
 */
const canvas = document.getElementById('canvas') as any as SVGAElement;
const ball = document.getElementById('circle') as any as SVGCircleElement;
const playerOne = document.getElementById('player-one') as any as SVGRectElement;
const playerTwo = document.getElementById('player-two') as any as SVGRectElement;
const playerOneScoreText = document.getElementById('player-one-scores') as any as SVGTextElement;
const playerTwoScoreText = document.getElementById('player-two-scores') as any as SVGTextElement;
const infoPanel = document.getElementById('info-panel') as any as SVGTextElement;

/**
 * Get Extra Elements
 */
const playerSpeedInput = document.getElementById('player-speed') as HTMLInputElement;
const ballSpeedInput = document.getElementById('ball-speed')as HTMLInputElement;
const maxScoresInput = document.getElementById('max-scores') as HTMLInputElement;
const paddleWidthInput = document.getElementById('paddle-width') as HTMLInputElement;
const paddleHeightInput = document.getElementById('paddle-height') as HTMLInputElement;

/**	
 * Audio
 */
const hitSound = document.getElementById('hit') as HTMLAudioElement;
const wallSound = document.getElementById('wall') as HTMLAudioElement;
const scoreSound = document.getElementById('score') as HTMLAudioElement;


/**
 * BehaviorSubjects
 */
const playerTwoData = new BehaviorSubject<IPlayerData>(playerTwoDefaultData);
const playerTwoScores = new BehaviorSubject<number>(0);
const playerOneData = new BehaviorSubject<IPlayerData>(playerOneDefaultData);
const playerOneScores = new BehaviorSubject<number>(0);
const maxPlayerScores = new BehaviorSubject<number>(7);
const infoData = new BehaviorSubject<string>('Press Space to Start');
const canvasData = new BehaviorSubject<ICanvas>(canvasDefaultData);
const isStarted = new BehaviorSubject<boolean>(false);
const ballData = new BehaviorSubject<IBallData>(ballDefaultData);
const xDir = new BehaviorSubject<number>(2);
const yDir = new BehaviorSubject<number>(2);

/**
 * Update ball data
 * 
 * @param {Object} data 
 * 
 * @return {Object}
 */
export function updateBall(data: IOptions) {
    return spreadObjectSubject(ballData, data);
}

/**
 * Update player params
 * 
 * @param {Object} data 
 * 
 * @return {Object}
 */
function updatePlayerOne(data: IOptions) {
    return spreadObjectSubject(playerOneData, data);
}

/**
 * Update player scores
 * 
 * @param {Number} n 
 * 
 * @return {Number}
 */
function updatePlayerOneScores(n: number = 1) {
    return spreadNumberSubject(playerOneScores, n);
}

/**
 * Update player params
 * 
 * @param {Object} data 
 * 
 * @return {Object}
 */
function updatePlayerTwo(data: IOptions) {
    return spreadObjectSubject(playerTwoData, data);
}

/**
 * Move up player
 * 
 * @return {Void}
 */
function moveUp() {
    const y = playerTwoData.value.y + playerSpeed.value;
    updatePlayerTwo({ y })
}

/**
 * Move down player
 * 
 * @return {Void}
 */
function moveDown() {
    const y = playerTwoData.value.y - playerSpeed.value;
    updatePlayerTwo({ y })
}

/**
 * Move player on y velocity
 * 
 * @param {Number} y
 * 
 * @return {Void}
 */
function move(y: number) {
    const newY = y - playerTwoDefaultData.height / 2;

    updatePlayerTwo({ y: newY });
}

const playerSpeed = new BehaviorSubject<number>(playerStep);

/**
 * Update player scores
 * 
 * @param {Number} n 
 * 
 * @return {Number}
 */
function updatePlayerTwoScores(n: number = 1) {
    return spreadNumberSubject(playerTwoScores, n);
}

/**	
 * Init Game
 */
game({
	canvas,
	playerOne,
	playerTwo,
	ball,
	playerOneScoreText,
	playerTwoScoreText,
	infoPanel
})

addExtaFeatures({
	playerSpeedInput,
	ballSpeedInput,
	maxScoresInput,
	paddleWidthInput,
	paddleHeightInput
})

const playerActions = {
	ArrowUp: function () {
		moveDown();
	},
	ArrowDown: function () {
		moveUp();
	}
}

/**	
 * Handle actions and start game
 */
document.addEventListener('keydown', (e) => {
	if (typeof playerActions[e.code] === 'function' && isStarted.value) {
		playerActions[e.code]();
	}

	if (e.code === 'Space' && !isStarted.value) {
		isStarted.next(true);
		infoData.next('');
		animate({ hitSound, wallSound, scoreSound });
	}
})

/**	
 * Handle mouse move and move player two
 */
playerTwo.addEventListener('mousemove', (v) => {
	if (isStarted.value) {
		move(v.offsetY)
	}
})

/**
 * Spread old state with new one
 * 
 * @param {BehaviorSubject} subject 
 * @param {Object} data 
 */
function spreadObjectSubject(subject: BehaviorSubject<any>, data: IOptions) {
    const newData = { ...subject.value, ...data };
    subject.next(newData);

    return newData;
}

/**
 * Increase number in state
 * 
 * @param {BehaviorSubject} subject 
 * @param {Number} n 
 */
function spreadNumberSubject(subject: BehaviorSubject<any>, n: number) {
    const scores = subject.value + n;
    subject.next(scores);
    return scores;
}


/**
 * Subscribe for data and update UI
 * 
 * @param {Object} param
 * 
 * @return {Void}
 */
function game({ canvas, playerOne, playerTwo, ball, playerOneScoreText, playerTwoScoreText, infoPanel }: IComponents) {
    playerOneData.subscribe((data: IPlayerData) => {
        setDataParams(playerOne, data);
    })

    playerTwoData.subscribe((data: IPlayerData) => {
        setDataParams(playerTwo, data);
    })

    canvasData.subscribe((data: ICanvas) => {
        setDataParams(canvas, data);
    })

    ballData.subscribe((data: IBallData) => {
        setDataParams(ball, data);
    })

    playerOneScores.subscribe((scores: number) => {
        playerOneScoreText.textContent = `${scores}`;
    })

    playerTwoScores.subscribe((scores: number) => {
        playerTwoScoreText.textContent = `${scores}`;
    })

    infoData.subscribe((info: string) => {
        infoPanel.textContent = info;
    })
}

/**
 * Set Attributes
 * 
 * @param {SVGElement} player 
 * @param {Object} data 
 * 
 * @return {Void}
 */
function setDataParams(player: SVGElement | SVGRectElement | SVGCircleElement, data: IOptions) {
    Object.keys(data).forEach((key: string) => {
        player.setAttribute(key, `${data[key]}`);
    })
}


/**
 * Add Extra Features
 * 
 * @param {Object} param
 */
function addExtaFeatures({ playerSpeedInput, ballSpeedInput, maxScoresInput, paddleWidthInput, paddleHeightInput }: IFeatureElements) {
    playerSpeedInput.value = `${playerSpeed.value}`;
    playerSpeedInput.addEventListener('change', (e) => {
        playerSpeed.next(Number((e.target as any).value));
    })

    ballSpeedInput.value = `${xDir.value}`;
    ballSpeedInput.addEventListener('change', (e) => {
        const n = Number((e.target as any).value);

        xDir.next(n);
        yDir.next(n);
    })

    maxScoresInput.value = `${maxPlayerScores.value}`;
    maxScoresInput.addEventListener('change', (e) => {
        maxPlayerScores.next(Number((e.target as any).value));
    })

    paddleWidthInput.value = `${playerOneData.value.width}`;
    paddleWidthInput.addEventListener('change', (e) => {
        const width = Number((e.target as any).value);

        updatePlayerOne({ width });
        updatePlayerTwo({
            width,
            x: canvasData.value.width - width
        });
    })

    paddleHeightInput.value = `${playerOneData.value.height}`;
    paddleHeightInput.addEventListener('change', (e) => {
        const height = Number((e.target as any).value);

        updatePlayerOne({ height });
        updatePlayerTwo({ height });
    })
}


/**
 * Animate - Start Game
 * 
 * @param {Number} xDir 
 * @param {Number} yDir 
 * 
 * @return {Void}
 */
function animate({ hitSound, wallSound, scoreSound }: ISounds) {
	if (!isStarted.value) {
		infoData.next('Press Space to Start');
		return;
	}

	if(playerOneScores.value >= maxPlayerScores.value || playerTwoScores.value >= maxPlayerScores.value) {
		isStarted.next(false);

		const winner = playerOneScores.value < playerTwoScores.value
			? 'Player Two is Winner'
			: 'Player One is Winner';

		infoData.next(winner);

		setTimeout(() => {
			infoData.next('Press Space to Start');
			playerOneScores.next(0);
			playerTwoScores.next(0);
		}, 3000)

		return;
	}

	const canvasSize = canvasData.value;
	const ball = ballData.value;
	const playerOne = playerOneData.value;
	const playerTwo = playerTwoData.value;

	let cx = ball.cx;
	let cy = ball.cy;

	if (ball.cy - ball.r <= 0 || ball.cy + ball.r >= canvasSize.height) {
		const dir = -yDir.value;
		yDir.next(dir);
		wallSound.play();
	}

	if (ball.cx - ball.r <= 0) {
		cx = 300;
		cy = 300;
		updatePlayerTwoScores();
		const dir = -xDir.value;
		xDir.next(dir);
		scoreSound.play();
	}

	if (ball.cx + ball.r >= canvasSize.width) {
		cx = 300;
		cy = 300;
		updatePlayerOneScores(1);
		const dir = -xDir.value;
		xDir.next(dir);
		scoreSound.play();
	}

	if (
		(
			ball.cx - playerOne.width <= playerOne.x 
			&& ball.cy - ball.r > playerOne.y
			&& ball.cy + ball.r < playerOne.y + playerOne.height
		)
		|| (
			ball.cx + ball.r >= playerTwo.x
			&& ball.cy - ball.r > playerTwo.y
			&& ball.cy + ball.r < playerTwo.y + playerTwo.height
		)
	) {
		const dir = -xDir.value;
		xDir.next(dir);
		hitSound.play();
	}

	if(cx < cx + xDir.value) {
		const y = playerOne.y < cy
			? playerOne.y + playerSpeed.value
			: playerOne.y - playerSpeed.value

		updatePlayerOne({ y });
	}

	cx += -xDir.value;
	cy += -yDir.value;

	updateBall({ cx, cy });
	requestAnimationFrame(animate.bind(undefined, { hitSound, wallSound, scoreSound }));
}