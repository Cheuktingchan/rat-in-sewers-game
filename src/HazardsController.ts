export default class HazardsController{
  private hazards = new Map<string, MatterJS.BodyType>();

  add (name: string, body: MatterJS.BodyType){
    const key = `${name}-${body.id}`;// this is syntax for string interpolation
    if(this.hazards.has(key)){
      throw new Error("key already added before");
    }
    this.hazards.set(key,body);
  }

  is (name: string, body: MatterJS.BodyType){
    const key = `${name}-${body.id}`;
    if (this.hazards.has(key)){
      return true;
    }
    return false;
  }
}