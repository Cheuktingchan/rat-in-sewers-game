import Phaser from 'phaser';

export default class UI extends Phaser.Scene{
  private timer!: Phaser.GameObjects.Text;
  private time_left = 10;
  constructor(){
    super({key:'ui'});
  }

  create(){
    this.timer = this.add.text(10,10, `Berserk in: ${this.time_left}`, {
      fontSize: '32px'
    });
    this.time.addEvent({
      delay: 1000,
      callback: ()=>{
        if (this.time_left > 1){
          this.time_left --;
          this.timer.text = `Berserk in: ${this.time_left}`
        }else{
          this.time_left --;
          this.timer.text = `Berserk!`
        }
      },
      loop: true
  });
  }
}