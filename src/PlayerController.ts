import Phaser from 'phaser'
import StateMachine from './statemachine/StateMachine'; // importing state machine

export default class PlayerController{
  private sprite: Phaser.Physics.Matter.Sprite; // takes a matter sprite like the rat
  private stateMachine: StateMachine; // one state machine object for each sprite to control

  constructor(sprite: Phaser.Physics.Matter.Sprite){
    this.sprite = sprite;
    this.stateMachine = new StateMachine(this, 'player');

    this.stateMachine.addState('idle');
    this.stateMachine.addState('walk');

    this.stateMachine.setState('idle'); //starting state is idle
  }
}