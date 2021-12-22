import Phaser from 'phaser';
import { sharedInstance as events } from '~/EventCenter';
export default class GameOver extends Phaser.Scene{
  constructor(){
    super('game-over');
  }

  create(){
    const {width, height} = this.scale;

    const game_over = this.add.text(width * 0.5, height * 0.3 , "Game Over",{
      fontSize:'52px',
      color:'#ff0000'
    });
    game_over.setOrigin(0.5);

    const play_again = this.add.rectangle(width *0.5, height * 0.55, 150, 75, 0xffffff);
    play_again.setInteractive();
    play_again.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      this.scene.start('game');
      events.emit('game-start');
    });
    var parentObj = this;
    this.input.keyboard.on('keydown-' + 'C', function (event) {
      parentObj.scene.start('game');
      events.emit('game-start');
    });

    const play_again_text = this.add.text(play_again.x,play_again.y, 'Play Again (C)', {
      color: '#000000'
    });
    play_again_text.setOrigin(0.5);
  }
}