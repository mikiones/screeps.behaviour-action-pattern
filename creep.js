var mod = {
    extend: function(){     
        Creep.Action = require('./creep.Action'),
        Creep.Setup = require('./creep.Setup'),
        Creep.action = {
            building: require('./creep.action.building'), 
            charging: require('./creep.action.charging'),
            claiming: require('./creep.action.claiming'),
            reserving: require('./creep.action.reserving'),
            defending: require('./creep.action.defending'),
            feeding: require('./creep.action.feeding'), 
            fueling: require('./creep.action.fueling'), 
            guarding: require('./creep.action.guarding'), 
            harvesting: require('./creep.action.harvesting'),
            healing: require('./creep.action.healing'),
            idle: require('./creep.action.idle'),
            invading: require('./creep.action.invading'),
            picking: require('./creep.action.picking'), 
            repairing: require('./creep.action.repairing'), 
            travelling: require('./creep.action.travelling'), 
            storing: require('./creep.action.storing'), 
            uncharging: require('./creep.action.uncharging'),
            upgrading: require('./creep.action.upgrading'), 
            withdrawing: require('./creep.action.withdrawing'),
            robbing:require('./creep.action.robbing')
        };
        Creep.behaviour = {
            claimer: require('./creep.behaviour.claimer'),
            hauler: require('./creep.behaviour.hauler'),
            healer: require('./creep.behaviour.healer'),
            melee: require('./creep.behaviour.melee'),
            miner: require('./creep.behaviour.miner'),
            pioneer: require('./creep.behaviour.pioneer'),
            privateer: require('./creep.behaviour.privateer'),
            ranger: require('./creep.behaviour.ranger'),
            upgrader: require('./creep.behaviour.upgrader'),
            worker: require('./creep.behaviour.worker')
        };
        Creep.setup = {
            claimer: require('./creep.setup.claimer'),
            hauler: require('./creep.setup.hauler'),
            healer: require('./creep.setup.healer'), 
            melee: require('./creep.setup.melee'),
            miner: require('./creep.setup.miner'),
            pioneer: require('./creep.setup.pioneer'),
            privateer: require('./creep.setup.privateer'),
            ranger: require('./creep.setup.ranger'),
            upgrader: require('./creep.setup.upgrader'),
            worker: require('./creep.setup.worker')
        };
        Creep.loop = function(){
            var run = creep => creep.run();
            _.forEach(Game.creeps, run);
        };
        Creep.prototype.run = function(behaviour){
            if( !this.spawning ){
                if(!behaviour && this.data && this.data.creepType) {
                    behaviour = Creep.behaviour[this.data.creepType];
                }
                if( behaviour ) behaviour.run(this);
                else if(!this.data){
                    let type = this.memory.setup;
                    let weight = this.memory.cost;
                    let home = this.memory.home;
                    let spawn = this.memory.mother;
                    let breeding = this.memory.breeding;
                    if( type && weight && home && spawn && breeding  ) {
                        //console.log( 'Fixing corrupt creep without population entry: ' + this.name );
                        var entry = Population.setCreep({
                            creepName: this.name, 
                            creepType: type, 
                            weight: weight, 
                            roomName: this.pos.roomName, 
                            homeRoom: home, 
                            motherSpawn: spawn, 
                            actionName: this.action ? this.action.name : null, 
                            targetId: this.target ? this.target.id || this.target.name : null,
                            spawningTime: breeding, 
                            flagName: null, 
                            body: _.countBy(this.body, 'type')
                        });
                        Population.countCreep(this.room, entry);
                    } else {
                        console.log( dye(CRAYON.error, 'Corrupt creep without population entry!! : ' + this.name ));
                        // trying to import creep
                        if( this.body.includes(WORK) && this.body.includes(CARRY))
                        {
                            let counts = _.countBy(this.body, 'type');
                            let weight = (counts[WORK]*PART_COSTS[WORK]) + (counts[CARRY]*PART_COSTS[CARRY]) + (counts[MOVE]*PART_COSTS[MOVE]); 
                            var entry = Population.setCreep({
                                creepName: this.name, 
                                creepType: 'worker', 
                                weight: weight, 
                                roomName: this.pos.roomName, 
                                homeRoom: this.pos.roomName, 
                                motherSpawn: null, 
                                actionName: null, 
                                targetId: null,
                                spawningTime: -1, 
                                flagName: null, 
                                body: _.countBy(this.body, 'type')
                            });
                            Population.countCreep(this.room, entry);
                        } else this.suicide();
                    }
                }
            }
        };
    }
}

module.exports = mod;