import Phaser from 'phaser'
import StateMachine from './statemachine/StateMachine'; // importing state machine

export default class PlayerController{
  private sprite: Phaser.Physics.Matter.Sprite; // takes a matter sprite like the rat
  private stateMachine: StateMachine; // one state machine object for each sprite to control
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  
  touching_side = 'none';

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
      onUpdate: this.wallClimbOnUpdate,
      onExit: this.wallClimbOnExit
    })
    this.stateMachine.setState('idle'); //starting state is idle
    
    this.sprite.setOnCollide((pair: MatterJS.ICollisionPair) => { // set state back to idle when returning to ground from a jump
      if (pair.collision.normal.x == 0 && pair.collision.normal.y == 1 && pair.confirmedActive){ // if hit floor
        if (this.stateMachine.isCurrentState('jump')){
          this.stateMachine.setState('idle');
        }
      }
      if (pair.collision.normal.x == 1){
        this.stateMachine.setState('wall-climb');
        this.touching_side = 'right';
      } 
      if (pair.collision.normal.x == -1){
        this.stateMachine.setState('wall-climb');
        this.touching_side = 'left';
      }
    });
    this.sprite.setOnCollideActive((pair: MatterJS.ICollisionPair) => { // set state back to idle when returning to ground from a jump
      if (pair.collision.normal.x == 1){
        this.touching_side = 'right';
      } 
      if (pair.collision.normal.x == -1){
        this.touching_side = 'left';
      }
    });
    this.sprite.setOnCollideEnd((pair: MatterJS.ICollisionPair) => { // set state back to idle when returning to ground from a jump
      if (pair.collision.normal.x != 0 && pair.collision.normal.x != -0){ //if hit sides
        this.touching_side = 'none';
      }
    });
  }

  update(dt: number){
    this.stateMachine.update(dt);
  }
  private idleOnEnter(){
    this.sprite.anims.play('player-idle');
  }

  private idleOnUpdate(){
    if ((this.cursors.left.isDown && this.touching_side == 'left') || (this.cursors.right.isDown && this.touching_side == 'right')){ // 
        this.sprite.body.velocity.x = 0;
        this.stateMachine.setState('wall-climb');
    }else if (this.cursors.left.isDown || this.cursors.right.isDown){
      this.stateMachine.setState('walk');
    }
    this.jumpDetection();
  }

  private walkOnEnter(){
    this.sprite.anims.play('player-walk');
  }

  private walkOnUpdate(){
    const speed = 5;

    if (this.cursors.left.isDown){ // rat walks left
      this.sprite.flipX = true;
      this.sprite.setVelocityX(-speed);
      if (this.touching_side == 'left'){
        this.sprite.body.velocity.x = 0;
        this.stateMachine.setState('wall-climb');
      }
    }else if (this.cursors.right.isDown){ // rat walks right
      this.sprite.flipX = false;
      this.sprite.setVelocityX(speed);
      if (this.touching_side == 'right'){
        this.sprite.body.velocity.x = 0;
        this.stateMachine.setState('wall-climb');
      }
    }else{ //rat idles
      this.sprite.setVelocityX(0);
      this.stateMachine.setState('idle');
    }

    this.jumpDetection();
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
    if (this.cursors.left.isDown){
      this.sprite.angle = 90;
    }else if (this.cursors.right.isDown){ // not considering case 0 here - error
      this.sprite.angle = -90;
    }
  }

  private wallClimbOnUpdate(){
    if ((this.cursors.left.isDown && this.touching_side == 'left') || (this.cursors.right.isDown && this.touching_side == 'right')){
      this.sprite.setVelocityY(-3);
    }else{
      if (this.cursors.left.isDown || this.cursors.right.isDown){
        this.stateMachine.setState('walk');
      }else{
        this.stateMachine.setState('idle');
      }
    }
    this.jumpDetection();
  }

  private wallClimbOnExit(){
    this.sprite.setIgnoreGravity(false);
    this.sprite.angle = 0;
  }

  private jumpDetection(){
    const space_pressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (space_pressed){
      this.stateMachine.setState('jump');
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