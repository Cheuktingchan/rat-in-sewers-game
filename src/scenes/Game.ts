import Phaser from 'phaser'
import PlayerController from '~/PlayerController';

export default class Game extends Phaser.Scene{
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; //! because in Phaser this will work fine
  
  private rat!: Phaser.Physics.Matter.Sprite;

  private playerController?: PlayerController;

  private is_touching_ground = false;

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

    const map = this.make.tilemap({key: 'tilemap'}); // making tilemap
    const tileset = map.addTilesetImage('sheet', 'tiles'); // setting a tileset using sheet. tileset from Tiled

    const ground = map.createLayer('ground', tileset); //creating a layer within the tilemap using Tiled layer

    ground.setCollisionByProperty({collides:true}); // collides in the Tiled embbed tileset is a boolean that has been ticked for ground tiles

    this.matter.world.convertTilemapLayer(ground); // adds MatterTileBody instances for all collides tiles in the layer
    
    const objectsLayer = map.getObjectLayer('objects'); // getting the objects layer from tile map in Tiled

    objectsLayer.objects.forEach(objData => {
      const {x = 0,y = 0,name, width = 0} = objData; // looping through object data and setting defaults for each
      
      switch (name){
        case 'rat-spawn': // if object has name rat-spawn
          this.rat = this.matter.add.sprite(x! + width * 0.5,y!, 'rat'); // adding the rat
          this.rat.setFixedRotation(); // fix rotation of rat

          this.playerController = new PlayerController(this.rat, this.cursors); //create the playerController for the rat
      }

    });
    this.cameras.main.zoom = 0.5;
    this.cameras.main.startFollow(this.rat); //camera follows the rat
  }

  update(t: number, dt: number){
    if (!this.playerController){
      return;
    }
    this.playerController.update(dt);
  }
}