import Phaser from 'phaser'

export default class Game extends Phaser.Scene{
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; //! because in Phaser this will work fine
  
  private rat!: Phaser.Physics.Matter.Sprite;
  constructor(){
    super('game'); //identifier for extended class from Phase.Scene
  }

  init(){
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  preload(){
    this.load.atlas('rat', 'assets/rat.png', 'assets/rat.json');// loading rat sprite sheet
    this.load.image('tiles','assets/sheet.png');//loading tile sheet
    this.load.tilemapTiledJSON('tilemap','assets/level.json');//loading example tilemap
  }

  create(){
    this.createRatAnimations();
    const map = this.make.tilemap({key: 'tilemap'}); // making tilemap
    const tileset = map.addTilesetImage('sheet', 'tiles'); // setting a tileset using sheet. tileset from Tiled

    const ground = map.createLayer('ground', tileset); //creating a layer within the tilemap using Tiled layer

    ground.setCollisionByProperty({collides:true}); // collides in the Tiled embbed tileset is a boolean that has been ticked for ground tiles

    this.matter.world.convertTilemapLayer(ground); // adds MatterTileBody instances for all collides tiles in the layer

    const {width,height} = this.scale;
    this.rat = this.matter.add.sprite(width *0.5, height * 0.5, 'rat'); // adding the rat
    this.rat.setFixedRotation();
  }

  update(){
    const speed = 10;
      if (this.cursors.left.isDown){
        this.rat.flipX = true;
        this.rat.setVelocityX(-speed);
        this.rat.play('player-walk', true);
      }else if (this.cursors.right.isDown){
        this.rat.flipX = false;
        this.rat.setVelocityX(speed);
        this.rat.play('player-walk', true);
      }else{
        this.rat.play('player-idle', true);
      }
  }

  private createRatAnimations(){ // method for creating the rat animations including walking and idle

    this.anims.create({ // walking
      key: 'player-walk',
      frameRate: 10,
      frames: this.anims.generateFrameNames('rat',{
        start:1,
        end:4, 
        prefix: 'rat_walkFrame',
        suffix: '_64.png'}),
      repeat: -1
    });

    this.anims.create({ // idle
      key: 'player-idle',
      frames: [{key: 'rat', frame: 'rat_64.png'}],
      repeat: -1
    });
  }
}