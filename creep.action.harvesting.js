var action = new Creep.Action('harvesting');
action.isAddableAction = function(creep){ 
    return (!creep.room.population || 
        !creep.room.population.typeCount['hauler'] || 
        creep.room.population.typeCount['hauler'] < 1); 
};
action.isAddableTarget = function(target){
    return (target.targetOf === undefined || 
        target.targetOf.length < (target.accessibleFields) || 
        !target.container );
};
action.isValidAction = function(creep){
    return ( _.sum(creep.carry) < creep.carryCapacity && 
    creep.room.sourceEnergyAvailable > 0 );
};
action.isValidTarget = function(target, creep){
    let cont = target.room.controller;
    return (target != null && target.energy != null && target.energy > 0) && !this.isInEnemyRoom(target,creep);

};

action.newTarget = function(creep){
    let target = null;
    let sourceGuests = 999;
    for( var iSource = 0; iSource < creep.room.sources.length; iSource++ ){
        let source = creep.room.sources[iSource];
        if( this.isValidTarget(source, creep) && this.isAddableTarget(source) ){
            if( source.targetOf === undefined ) {
                sourceGuests = 0;
                target = source;
                break;
            } else {
                let guests = _.countBy(source.targetOf, 'creepType');
                // has dedicated miner? go away...
                if( !guests.miner ) { 
                    let count = guests[creep.data.creepType];
                    if( !count ) {
                        sourceGuests = 0;
                        target = source;
                    } else if( count < sourceGuests ) {
                        sourceGuests = count;
                        target = source;
                    }
                }
            }
        }
    }
    return target;
};
action.work = function(creep){
    return creep.harvest(creep.target);
};
module.exports = action;
