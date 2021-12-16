import Phaser from 'phaser'

export default class Game extends Phaser.Scene{
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; //! because in Phaser this will work fine
  
  private rat!: Phaser.Physics.Matter.Sprite;

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
    this.createRatAnimations();
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
      
          this.rat.setOnCollide((data: MatterJS.ICollisionPair) => {
            this.is_touching_ground = true;
          });
      }

    })
    this.cameras.main.startFollow(this.rat);
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

    const space_pressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (space_pressed && this.is_touching_ground){
      this.rat.setVelocityY(-10);
      this.is_touching_ground = false;
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