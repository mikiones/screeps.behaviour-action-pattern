var action = new Creep.Action('upgrading');
action.targetRange = 3;
action.isAddableAction = function(creep){ return true; },
action.isAddableTarget = function(target){ return true; }, 
action.isValidAction = function(creep){
    return creep.carry.energy > 0;
};
action.isValidTarget = function(target){
    return (target != null ) && target.structureType == 'controller' && target.my;
};   
action.newTarget = function(creep){
    return ( creep.room.controller && creep.room.controller.my) ? creep.room.controller : null;
};
action.work = function(creep){
    return creep.upgradeController(creep.room.controller);
}; 
action.step = function(creep){
    if(CHATTY) creep.say(this.name, SAY_PUBLIC);
    let range = creep.pos.getRangeTo(creep.target);
    if( range <= this.targetRange ) {
        var workResult = this.work(creep);
        if( workResult != OK ) {
            if( DEBUG ) logErrorCode(creep, workResult);
            creep.data.actionName = null;
        }
    } 
    if( range > 1 )
        this.drive(creep, creep.target.pos, range);
};

module.exports = action;
