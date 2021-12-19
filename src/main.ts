import Phaser from 'phaser'

import Game from './scenes/Game'
import GameOver  from './scenes/GameOver'
import UI from './scenes/UI'
import Win from	'./scenes/Win'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'matter',// matter.js physics
		matter: {
			debug: false
		}
	},
	scene: [Game,GameOver, UI, Win]
}

export default new Phaser.Game(config)
