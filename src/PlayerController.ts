import Phaser from 'phaser'
import HazardsController from './HazardsController';
import StateMachine from './statemachine/StateMachine'; // importing state machine
import { sharedInstance as events } from './EventCenter';
export default class PlayerController{
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Matter.Sprite; // takes a matter sprite like the rat
  private stateMachine: StateMachine; // one state machine object for each sprite to control
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private hazards: HazardsController;

  touching_side: string = 'none';
  berserk: boolean = false;
  timer_length: number = 15;
  collided_this_frame: boolean = false;
  delta : number = 0;

  constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, cursors: Phaser.Types.Input.Keyboard.CursorKeys, hazards: HazardsController){
    this.scene = scene;
    this.sprite = sprite;
    this.stateMachine = new StateMachine(this, 'player');
    this.hazards = hazards;
    this.sprite.setFriction(0);
    this.cursors = cursors;
    this.createAnimations();
    this.scene.time.addEvent({
      delay: this.timer_length * 1000,
      callback: ()=>{
        this.stateMachine.setState('berserk');
      },
      loop: false
    });

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
    this.stateMachine.addState('hit-spike', {
      onEnter: this.hitSpikeOnEnter
    })
    this.stateMachine.addState('dead', {
      onEnter: this.deadOnEnter
    });
    this.stateMachine.addState('berserk', {
      onEnter: this.berserkOnEnter
    });
    this.stateMachine.addState('win', {
      onEnter: this.winOnEnter
    });
    this.stateMachine.setState('idle'); //starting state is idle
    
    // the following are listeners for collide start, active, end
    this.sprite.setOnCollide((pair: MatterJS.ICollisionPair) => { // set state back to idle when returning to ground from a jump
      const body = pair.bodyB as MatterJS.BodyType; // note: for some reason the rat is usually bodyB but not when the collision is with a hazard
      if (this.hazards.is('spikes', body)){
        this.stateMachine.setState('hit-spike');
        return
      }
      if (this.hazards.is('goo', body)){
        this.stateMachine.setState('hit-spike');
        return
      }
      if (this.hazards.is('cheese', body)){
        this.stateMachine.setState('win');
        return
      }
      if (pair.collision.normal.x == 0 && pair.collision.normal.y == 1 && pair.confirmedActive){ // if hit floor
        if (this.stateMachine.isCurrentState('jump')){
          this.stateMachine.setState('idle');
        }
      }
      
/*       if (pair.collision.normal.x == 1){
        this.stateMachine.setState('wall-climb');
        this.touching_side = 'right';
      } 
      if (pair.collision.normal.x == -1){
        this.stateMachine.setState('wall-climb');
        this.touching_side = 'left';
      } */
    });
    this.sprite.on('animationcomplete-player-climb', (animation, frame) => {
      this.sprite.anims.play('player-walk');
      if (this.cursors.left.isDown){
        this.sprite.angle = 90;
      }else if (this.cursors.right.isDown || this.berserk){ // not considering case 0 here - error
        this.sprite.angle = -90;
      }
    }, this);
    this.sprite.setOnCollideActive((pair: MatterJS.ICollisionPair) => { // set state back to idle when returning to ground from a jump
      const body = pair.bodyB as MatterJS.BodyType; // note: for some reason the rat is usually bodyB but not when the collision is with a hazard
      if (this.hazards.is('spikes', body)){
        return
      }
      if (this.hazards.is('goo', body)){
        this.stateMachine.setState('hit-spike');
        return
      }
      if (this.hazards.is('cheese', body)){
        this.stateMachine.setState('win');
        return
      }
      if (pair.collision.normal.x == 1){
        this.touching_side = 'right';
      } 
      if (pair.collision.normal.x == -1){
        this.touching_side = 'left';
      }
      this.collided_this_frame = true;
    });
    this.sprite.setOnCollideEnd((pair: MatterJS.ICollisionPair) => { // set state back to idle when returning to ground from a jump
      const body = pair.bodyB as MatterJS.BodyType; // note: for some reason the rat is usually bodyB but not when the collision is with a hazard
      if (this.hazards.is('spikes', body)){
        return
      }
      if (this.hazards.is('goo', body)){
        this.stateMachine.setState('hit-spike');
        return
      }
      if (this.hazards.is('cheese', body)){
        this.stateMachine.setState('win');
        return
      }
/*       if (pair.collision.normal.x != 0 && pair.collision.normal.x != -0){ //if hit sides
        this.touching_side = 'none';
      } */
    });
  }

  update(dt: number){
    this.delta = dt/10;
    if (!this.collided_this_frame){ //checks if listener was called this frame
      this.touching_side = 'none';
    }
    this.stateMachine.update(dt);
    this.collided_this_frame = false; // resets so it has to check if listener was called next frame
  }
  private idleOnEnter(){
    this.sprite.anims.play('player-idle');
  }

  private idleOnUpdate(){
    if ((this.cursors.left.isDown && this.touching_side == 'left' ) || (this.cursors.right.isDown && this.touching_side == 'right')){ // 
        this.sprite.body.velocity.x = 0;
        this.stateMachine.setState('wall-climb');
    }else if (this.cursors.left.isDown || this.cursors.right.isDown){
      this.stateMachine.setState('walk');
    }
    if (!this.berserk){
      this.jumpDetection();
    }
  }

  private walkOnEnter(){
    this.sprite.anims.play('player-walk');
  }

  private walkOnUpdate(){
    const speed = 5;

    if (this.cursors.left.isDown && !this.berserk){ // rat walks left
      this.sprite.flipX = true;
      this.sprite.setVelocityX(-speed * this.delta);
      if (this.touching_side == 'left'){
        this.sprite.body.velocity.x = 0;
        this.stateMachine.setState('wall-climb');
      }
    }else if (this.cursors.right.isDown || this.berserk){ // rat walks right
      this.sprite.flipX = false;
      this.sprite.setVelocityX(speed * this.delta);
      if (this.touching_side == 'right'){
        this.sprite.body.velocity.x = 0;
        this.stateMachine.setState('wall-climb');
      }
    }else{ //rat idles
      this.sprite.setVelocityX(0 * this.delta);
      this.stateMachine.setState('idle');
    }

    if (!this.berserk){
      this.jumpDetection();
    }
  }

  private jumpOnEnter(){
    this.sprite.setVelocityY(-5 * this.delta);
    this.sprite.anims.play('player-jump');
  }

  private jumpOnUpdate(){
    const speed = 5;
    if (this.cursors.left.isDown && !this.berserk){ // rat faces left
      this.sprite.flipX = true;
      this.sprite.setVelocityX(-speed * this.delta);
      if (this.touching_side == 'left'){
        this.sprite.body.velocity.x = 0;
        this.stateMachine.setState('wall-climb');
      }
    }else if (this.cursors.right.isDown){ // rat faces right
      this.sprite.flipX = false;
      this.sprite.setVelocityX(speed * this.delta);
      if (this.touching_side == 'right'){
        this.sprite.body.velocity.x = 0;
        this.stateMachine.setState('wall-climb');
      }
    }
  }

  private wallClimbOnEnter(){
    this.sprite.anims.play('player-climb');
    this.sprite.setIgnoreGravity(true);
  }

  private wallClimbOnUpdate(){
    if ((this.cursors.left.isDown && this.touching_side == 'left') || ((this.cursors.right.isDown || this.berserk) && this.touching_side == 'right')){
      this.sprite.setVelocityY(-3 * this.delta);
    }else{
      if (!this.berserk){
        this.jumpDetection();
      }
      if (this.cursors.left.isDown || this.cursors.right.isDown || this.berserk){
        this.stateMachine.setState('walk');
      }else{
        this.stateMachine.setState('idle');
      }
    }
  }

  private wallClimbOnExit(){
    this.sprite.setIgnoreGravity(false);
    this.sprite.angle = 0;
  }

  private hitSpikeOnEnter(){
    this.stateMachine.setState('dead');
  }

  private deadOnEnter(){
    this.sprite.setTint(Phaser.Display.Color.GetColor(255,0,0))
    this.sprite.flipY = true;
    this.sprite.anims.play('player-dead');
    this.scene.time.addEvent({
      delay: 500,
      callback: ()=>{
          this.scene.scene.start('game-over');
          events.emit('game-over');
      },
      loop: false
  })
  }

  private berserkOnEnter(){
    this.sprite.setTint(Phaser.Display.Color.GetColor(255,0,0));
    this.berserk = true;
    this.stateMachine.setState('walk');
  }

  private winOnEnter(){
    this.sprite.setTint(Phaser.Display.Color.GetColor(255,0,0))
    this.sprite.flipY = true;
    this.sprite.anims.play('player-dead');
    this.scene.scene.start('win');
    events.emit('game-over');
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

    this.sprite.anims.create({ // idle
      key: 'player-dead',
      frames: [{key: 'rat', frame: 'rat_walkFrame1_64.png'}],
      repeat: -1
    });

    this.sprite.anims.create({ // walking
      key: 'player-climb',
      frameRate: 8,
      frames: this.sprite.anims.generateFrameNames('rat-climb',{
        start:1,
        end:3, 
        prefix: 'climb-frame',
        suffix: '.png'}),
      repeat: 0
    });
  }
}