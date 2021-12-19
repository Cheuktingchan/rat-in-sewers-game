import Phaser from 'phaser'
import HazardsController from '~/HazardsController';
import PlayerController from '~/PlayerController';

export default class Game extends Phaser.Scene{
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; //! because in Phaser this will work fine
  
  private rat!: Phaser.Physics.Matter.Sprite;

  private playerController?: PlayerController;

  private hazards!: HazardsController;

  constructor(){
    super('game'); //identifier for extended class from Phase.Scene
  }

  init(){
    this.cursors = this.input.keyboard.createCursorKeys();
    this.hazards = new HazardsController; // every time scene is run
    this.scene.launch('ui');
  }
  preload(){
    this.load.atlas('rat', 'assets/rat.png', 'assets/rat.json');// loading rat sprite sheet
    this.load.image('tiles','assets/sheet.png');//loading tile sheet
    this.load.tilemapTiledJSON('tilemap','assets/level.json');//loading tilemap
  }

  create(){
    const map = this.make.tilemap({key: 'tilemap'}); // making tilemap
    const tileset = map.addTilesetImage('sheet', 'tiles'); // setting a tileset using sheet. tileset from Tiled

    const ground = map.createLayer('ground', tileset); //creating a layer within the tilemap using Tiled layer

    const hazards = map.createLayer('hazards', tileset);

    ground.setCollisionByProperty({collides:true}); // collides in the Tiled embbed tileset is a boolean that has been ticked for ground tiles

    this.matter.world.convertTilemapLayer(ground); // adds MatterTileBody instances for all collides tiles in the layer
    
    const objectsLayer = map.getObjectLayer('objects'); // getting the objects layer from tile map in Tiled

    objectsLayer.objects.forEach(objData => {// looping through each object in Tiled object layer
      const {x = 0,y = 0,name, width = 0, height = 0} = objData; // assigning values for each relevant data
      
      switch (name){
        case 'rat-spawn': // if rat-spawn, add a Sprite
          this.rat = this.matter.add.sprite(x! + width * 0.5,y! + height * 0.5, 'rat'); // adding the rat
          this.rat.setFixedRotation(); // fix rotation of rat

          this.playerController = new PlayerController(
            this,
            this.rat, 
            this.cursors,
            this.hazards); //create the playerController for the rat
          break;
        case 'spikes': // if is a spike, add a Body
          const spike = this.matter.add.rectangle(x + width * 0.5,y + height * 0.5,width,height,{
            isStatic: true
          });
          this.hazards.add('spikes', spike);
          break;
        case 'goo': // if is a spike, add a Body
          const goo = this.matter.add.rectangle(x + width * 0.5,y + height * 0.5,width,height,{
            isStatic: true,
            isSensor: true
          });
          this.hazards.add('goo', goo);
          break;
        case 'cheese': // if is a spike, add a Body
          const cheese = this.matter.add.rectangle(x + width * 0.5,y + height * 0.5,width,height,{
            isStatic: true,
            isSensor: true
          });
          this.hazards.add('cheese', cheese);
          break;
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