import Phaser from 'phaser'
import StateMachine from './statemachine/StateMachine'; // importing state machine

export default class PlayerController{
  private sprite: Phaser.Physics.Matter.Sprite; // takes a matter sprite like the rat
  private stateMachine: StateMachine; // one state machine object for each sprite to control
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(sprite: Phaser.Physics.Matter.Sprite, cursors: Phaser.Types.Input.Keyboard.CursorKeys){
    this.sprite = sprite;
    //this.sprite.setFrictionAir(0.1);
    this.cursors = cursors;
    this.createAnimations();
    this.stateMachine = new StateMachine(this, 'player');

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
    this.stateMachine.setState('idle'); //starting state is idle
    
    this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
      if (this.stateMachine.isCurrentState('jump')){
        this.stateMachine.setState('idle');
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
    if (this.cursors.left.isDown || this.cursors.right.isDown){ // 
      this.stateMachine.setState('walk');
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
    const speed = 10;

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
    this.sprite.setVelocityY(-10);
    this.sprite.anims.play('player-jump');
  }

  private jumpOnUpdate(){
    const speed = 10;
    if (this.cursors.left.isDown){ // rat faces left
      this.sprite.flipX = true;
      this.sprite.setVelocityX(-speed);
    }else if (this.cursors.right.isDown){ // rat faces right
      this.sprite.flipX = false;
      this.sprite.setVelocityX(speed);
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