import Phaser from 'phaser'

import Game from './scenes/Game'
import GameOver  from './scenes/GameOver'
import UI from './scenes/UI'
import Win from	'./scenes/Win'

import { DPR } from './dpr'

const width = 800;
const height = 600;

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: width,
	height: height,
	physics: {
		default: 'matter',// matter.js physics
		matter: {
			debug: false
		}
	},
	scene: [Game,GameOver, UI, Win],
	scale: {
		zoom: 1,
		width: width,
		height: height,
		autoCenter: Phaser.Scale.Center.CENTER_BOTH
	}
}

export default new Phaser.Game(config)
