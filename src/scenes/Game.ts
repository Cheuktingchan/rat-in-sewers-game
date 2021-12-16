import Phaser from 'phaser'

export default class Game extends Phaser.Scene{
  constructor(){
    super('game'); //identifier for extended class from Phase.Scene
  }

  preload(){
    this.load.atlas('rat', 'assets/rat.png', 'assets/rat.json');// loading rat sprite sheet
    this.load.image('tiles','assets/sheet.png');
    this.load.tilemapTiledJSON('tilemap','assets/level.json');
  }

  create(){
    this.createRatAnimations();
    const map = this.make.tilemap({key: 'tilemap'});
    const tileset = map.addTilesetImage('sheet', 'tiles');

    const ground = map.createLayer('ground', tileset);
    ground.setCollisionByProperty({collides:true});

    this.matter.world.convertTilemapLayer(ground);

    const {width,height} = this.scale;
    var rat = this.matter.add.sprite(width *0.5, height * 0.5, 'rat');
    rat.play('player-idle');
  }

  private createRatAnimations(){
    this.anims.create({
      key: 'player-walk',
      frameRate: 10,
      frames: this.anims.generateFrameNames('rat',{
        start:1,
        end:4, 
        prefix: 'rat_walkFrame',
        suffix: '_64.png'}),
      repeat: -1
    });

    this.anims.create({
      key: 'player-idle',
      frames: [{key: 'rat', frame: 'rat_64.png'}],
      repeat: -1
    });
  }
}