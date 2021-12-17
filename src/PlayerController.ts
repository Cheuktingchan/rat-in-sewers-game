import Phaser from 'phaser'
import StateMachine from './statemachine/StateMachine'; // importing state machine

export default class PlayerController{
  private sprite: Phaser.Physics.Matter.Sprite; // takes a matter sprite like the rat
  private stateMachine: StateMachine; // one state machine object for each sprite to control
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  
  touching_a_side = false;

  constructor(sprite: Phaser.Physics.Matter.Sprite, cursors: Phaser.Types.Input.Keyboard.CursorKeys){
    this.sprite = sprite;
    this.stateMachine = new StateMachine(this, 'player');
    //this.sprite.setFrictionAir(0.1);
    this.cursors = cursors;
    this.createAnimations();

    this.stateMachine.addState('idle', {
      onEnter: this.idleOnEnter,
      onUpdate: this.idleOnUpdate
    });
    this.stateMachine.addState('walk', {
      onEnter: this.walkOnEnter,
      onUpdate: this.walkOnUpdate
    });
    this.stateMachine.addState('jump', {
      onEnter: this.jumpOnEnter,
      onUpdate: this.jumpOnUpdate
    })
    this.stateMachine.addState('wall-climb', {
      onEnter: this.wallClimbOnEnter,
      onUpdate: this.wallClimbOnUpdate
    })
    this.stateMachine.setState('idle'); //starting state is idle
    
    this.sprite.setOnCollide((pair: MatterJS.ICollisionPair) => { // set state back to idle when returning to ground from a jump
      //console.log(pair);
      if (pair.collision.normal.x == 0 && pair.collision.normal.y == 1 && pair.confirmedActive){ // if hit floor
        if (this.stateMachine.isCurrentState('jump')){
          this.stateMachine.setState('idle');
        }
      } 
      if (pair.collision.normal.x != 0 && pair.collision.normal.x != -0){ //if hit sides
          this.stateMachine.setState('wall-climb');
          this.touching_a_side = true;
      }
    });
    this.sprite.setOnCollideActive((pair: MatterJS.ICollisionPair) => { // set state back to idle when returning to ground from a jump
      if (pair.collision.normal.x != 0 && pair.collision.normal.x != -0){ //if hit sides
        console.log("hello");
        this.touching_a_side = true;
      }
    });
    this.sprite.setOnCollideEnd((pair: MatterJS.ICollisionPair) => { // set state back to idle when returning to ground from a jump
      if (pair.collision.normal.x != 0 && pair.collision.normal.x != -0){ //if hit sides
        this.touching_a_side = false;
        console.log("collide ended with a side");
      }
    });
  }

  update(dt: number){
    this.stateMachine.update(dt);
    console.log(this.touching_a_side);
  }
  private idleOnEnter(){
    this.sprite.anims.play('player-idle');
  }

  private idleOnUpdate(){
    if (this.cursors.left.isDown || this.cursors.right.isDown){ // 
      if (this.touching_a_side){
        this.sprite.body.velocity.x = 0;
        this.stateMachine.setState('wall-climb');
      }else{
        this.stateMachine.setState('walk');
      }
    }

    const space_pressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (space_pressed){
      this.stateMachine.setState('jump');
    }
  }

  private walkOnEnter(){
    this.sprite.anims.play('player-walk');
  }

  private walkOnUpdate(){
    const speed = 5;

    if (this.cursors.left.isDown){ // rat walks left
      this.sprite.flipX = true;
      this.sprite.setVelocityX(-speed);
    }else if (this.cursors.right.isDown){ // rat walks right
      this.sprite.flipX = false;
      this.sprite.setVelocityX(speed);
    }else{ //rat idles
      this.sprite.setVelocityX(0);
      this.stateMachine.setState('idle');
    }

    const space_pressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (space_pressed){ // rat jumps
      this.stateMachine.setState('jump');
    }
  }

  private jumpOnEnter(){
    this.sprite.setVelocityY(-5);
    this.sprite.anims.play('player-jump');
  }

  private jumpOnUpdate(){
    const speed = 5;
    if (this.cursors.left.isDown){ // rat faces left
      this.sprite.flipX = true;
      this.sprite.setVelocityX(-speed);
    }else if (this.cursors.right.isDown){ // rat faces right
      this.sprite.flipX = false;
      this.sprite.setVelocityX(speed);
    }
  }

  private wallClimbOnEnter(){
    this.sprite.anims.play('player-walk');
    this.sprite.setIgnoreGravity(true);
    if (this.sprite.body.velocity.x > 0){
      this.sprite.angle = -90;
    }else{
      this.sprite.angle = 90;
    }
  }

  private wallClimbOnUpdate(){
    var current_dir_held = false;
    if (this.sprite.flipX && this.cursors.left.isDown){
      current_dir_held = true;
    }else if (!this.sprite.flipX && this.cursors.right.isDown){
      current_dir_held = true;
    }
    if (this.touching_a_side && current_dir_held){
      this.sprite.setVelocityY(-1);
    }else{
      this.sprite.setIgnoreGravity(false);
      this.sprite.angle = 0;
      this.stateMachine.setState('idle');
    }
  }

  private createAnimations(){ // method for creating the rat animations including walking and idle

    this.sprite.anims.create({ // walking
      key: 'player-walk',
      frameRate: 10,
      frames: this.sprite.anims.generateFrameNames('rat',{
        start:1,
        end:4, 
        prefix: 'rat_walkFrame',
        suffix: '_64.png'}),
      repeat: -1
    });

    this.sprite.anims.create({ // idle
      key: 'player-idle',
      frames: [{key: 'rat', frame: 'rat_64.png'}],
      repeat: -1
    });

    this.sprite.anims.create({ // idle
      key: 'player-jump',
      frames: [{key: 'rat', frame: 'rat_walkFrame2_64.png'}],
      repeat: -1
    });
  }
}