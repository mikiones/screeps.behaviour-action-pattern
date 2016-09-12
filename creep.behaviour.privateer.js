module.exports = {
    name: 'privateer',
    run: function(creep) {
        // Assign next Action
        let oldTargetId = creep.data.targetId;
        if( creep.action == null  || creep.action.name == 'idle' ) {
            this.nextAction(creep);
        }
        if( creep.data.targetId != oldTargetId ) {
            creep.data.moveMode = null;
            delete creep.data.path;
        }
        // Do some work
        if( creep.action && creep.target ) {
            creep.action.step(creep);
        } else {
            logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
        }
    },
    nextAction: function(creep){
        // at home
        if( creep.pos.roomName == creep.data.homeRoom ){ 
            // carrier filled
            if( _.sum(creep.carry) > 0 ){
                if( Creep.action.storing.assign(creep) ) return;
                if( Creep.action.charging.assign(creep) ) return;
                Creep.behaviour.worker.nextAction(creep);
                return;
            }
            // empty
            // travelling
            if( this.exploitNextRoom(creep) ) 
                return;
            else {
                // no new flag
                // behave as worker
                Creep.behaviour.worker.nextAction(creep);
                return;
            }
        }
        // not at home
        else {
            // at target room
            if( creep.flag && creep.flag.pos.roomName == creep.pos.roomName ){
                // carrier not full
                if( _.sum(creep.carry) < creep.carryCapacity ) {
                    // sources depleted
                    if( creep.room.sourceEnergyAvailable == 0 ){
                        // cloak flag
                        creep.flag.cloaking = creep.room.ticksToNextRegeneration;
                        // travelling
                        if( this.exploitNextRoom(creep) ) 
                            return;
                        else {
                            // no new flag
                            // go home
                            Population.registerCreepFlag(creep, null);
                            Creep.action.travelling.assign(creep, Game.rooms[creep.data.homeRoom].controller);
                            return;
                        }
                    }
                    // energy available
                    else {
                        // harvesting or picking
                        var actions = [
                            Creep.action.robbing,
                            Creep.action.picking,
                            Creep.action.harvesting
                        ];
                        // TODO: Add extracting (if extractor present)
                        for(var iAction = 0; iAction < actions.length; iAction++) {   
                            var action = actions[iAction];             
                            if(action.isValidAction(creep) && 
                                action.isAddableAction(creep) && 
                                action.assign(creep))
                                return;
                        }
                        // no targets in current room
                        creep.flag.cloaking = 10;
                        if( this.exploitNextRoom(creep) )
                            return;
                    }
                }
                // carrier full
                else {
                    var actions = [Creep.action.repairing, Creep.action.building];
                    for(var iAction = 0; iAction < actions.length; iAction++) {   
                        var action = actions[iAction];             
                        if(action.isValidAction(creep) && 
                            action.isAddableAction(creep) && 
                            action.assign(creep))
                            return;
                    }
                    Population.registerCreepFlag(creep, null);
                    Creep.action.travelling.assign(creep, Game.rooms[creep.data.homeRoom].controller);
                    return;
                }
            }
            // not at target room
            else {
                // travelling
                if( this.exploitNextRoom(creep) ) 
                    return;
                else {
                    // no new flag
                    // go home
                    Population.registerCreepFlag(creep, null);
                    Creep.action.travelling.assign(creep, Game.rooms[creep.data.homeRoom].controller);
                    return;
                }
            }
        }
        // fallback
        Creep.action.idle.assign(creep);
    },
    exploitNextRoom: function(creep){
        let flag = null// FlagDir.find(FLAG_COLOR.invade.exploit, creep.pos, false, FlagDir.exploitMod);

        // 1. for each flag:
        // 2. get sum of accesable Fields or 1 if room not loaded as 'spots'
        // 3. get sum of creeps taargeting of this flag as 'targets'
        // 4. subscract from spots the targers and if >0 keep as 'left'
        // 5. calculae room distance for each left flag.
        // 6. sort list by closests
        // 7. the closes flag is choosen for targer
        let isInEnemyRoom = function (room, creep) {
            let contrller = room.controller;
            return (contrller != null && contrller.my == false
            && ((contrller.reservation == null) || contrller.reservation.username != creep.owner.username));

        };

        let FlagDirs = FlagDir.filter(FLAG_COLOR.invade.exploit).map(f => Game.flags[f.name])
        .map( f =>
        { return {
            'spots':Game.rooms[f.pos.roomName] == null?1:isInEnemyRoom(Game.rooms[f.pos.roomName],creep)?0: Game.rooms[f.pos.roomName].sources.map(s => s.energy >0?s.accessibleFields:0).reduce((a,b)=> a+b, 0),
        'stealables':Game.rooms[f.pos.roomName] == null?0:Game.rooms[f.pos.roomName].stealables.length,
            'name': f.name,
            'roomName:':f.pos.roomName,
            'targets': f.targetOf == null ? 0 : f.targetOf.length,
            'distance': creep.pos.roomName == f.pos.roomName?0 : Creep.action.travelling.gatRoomPath(creep, f.pos).length
    }}).map(e => { e.left = e.spots + e.stealables - e.targets; return e;}).filter (e => e.left > 0)
        .sort((a,b) => a.distance - b.distance);


        if (FlagDirs.length >0 ) {
            flag = Game.flags[FlagDirs[0].name]
            console.log(creep.name, FlagDirs[0].name,"Spots laft", FlagDirs[0].left,"Distance", FlagDirs[0].distance);
        }


        // new flag found
        if( flag ) {
            // travelling
            if( Creep.action.travelling.assign(creep, flag) ) {
                Population.registerCreepFlag(creep, flag);
                return true;
            }
        }
        return false;
    }
}
