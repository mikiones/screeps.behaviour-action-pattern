var mod = {
    extend :function () {
        Object.defineProperties(ConstructionSite.prototype, {
            'priority': {
                get: function() {
                    if (_.isUndefined(this._priority)) {
                        this._priority = [
                            {s: [STRUCTURE_ROAD], p: 10},
                            {s: [STRUCTURE_STORAGE, STRUCTURE_EXTENSION], p: 1}
                        ].map(e => e.s.includes(this.structureType) ? e.p : 0).find(e => e > 0);
                        if (this._priority == undefined) this._priority = 100;
                    }
                        return this._priority;
                    }
                }
            });
    },

};
module.exports = mod;