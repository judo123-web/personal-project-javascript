class Transaction {
    constructor() {
        this.scen_index_arr = []
        this.sorted_scenario = []
        this.logs = []
        this.store = {}
        this.store2 = {}
    }
    async dispatch(scenario) {

        for (let element of scenario) {
            if (typeof element.index !== "number") {
                throw new Error("Invalid object, index is required and should be a number")
            } else if (typeof element.meta == "undefined" || typeof element.meta.title == 'undefined' || typeof element.meta.description == 'undefined') {
                throw new Error("Invalid object, Meta is required to have title and description")
            }
            else if (typeof element.call !== 'function' || typeof element.call == "undefined") {
                throw new Error("call is required and must be function")
            }
            this.scen_index_arr.push(element.index)
        }
        this.scen_index_arr.sort((a, b) => a - b);

        this.scen_index_arr.forEach((value, index, arr) => {
            for (let j of scenario) {
                if (value === j.index) this.sorted_scenario.push(j)
            }
        })

        function create_suc_obj(storebf, element, result) {
            var object_res = {
                ...{}, ...{
                    index: element.index,
                    meta: element.meta,
                    storeBefore: storebf,
                    error: {
                        Calerror: null
                    },
                    storeAfter: result,
                }
            }

            return object_res
        }

        function create_error_obj(element, err) {
            var object_res = {
                ...{}, ...{
                    index: element.index,
                    meta: element.meta,
                    error: {
                        name: err.name,
                        message: err.message,
                    }
                }

            }
            return object_res
        }


        head: for (var element of this.sorted_scenario) {
            try {
                var result = await element.call(this.store2)
                this.logs.push(create_suc_obj(this.store2, element, result))
            } catch (errs) {
                try {
                    if (typeof element.restore !== 'undefined') {
                        var result = await element.restore(this.store2)
                        var obj = create_suc_obj(this.store2, element, result)
                        obj.error = {
                            Calerror: JSON.stringify({
                                name: errs.name,
                                message: errs.message,
                            }),
                            RestoreError: null
                        }
                        this.logs.push(obj)
                        this.store = null
                    } else {
                        this.logs.push(create_error_obj(element, errs));
                        this.store = {}
                    }

                } catch (err) {
                    var obj = create_error_obj(element, err)
                    obj.error = {
                        Calerror: JSON.stringify({ name: errs.name, message: errs.message }),
                        RestoreError: JSON.stringify(obj.error)
                    }
                    this.logs.push(obj)
                    this.logs.push(create_error_obj(element, err))
                    this.store = {}
                    for (let element2 = this.sorted_scenario.indexOf(element) - 1; element2 >= 0; element2--) {
                        var element = this.sorted_scenario[element2]
                        try {
                            var result = await element.restore(this.store2)
                            var obj4 = create_suc_obj(this.store2, element, result)
                            obj4.error = {
                                RestoreError : null
                            }
                            this.logs.push(obj4)
                        } catch (err) {
                            this.logs.push(create_error_obj(element, err));
                            break head
                        }
                    } break head

                }
            }
        }


    }
}


const scenario = [{
    index: 1,
    meta: {
        title: 'Read popular customers',
        description: 'This action is responsible for reading the most popular customers'
    },
    call: async (store) => {
        return store
        throw new Error("Call Error")
    },
    restore: async (store) => {
        return "Restored";
        throw new Error("Restore Error")
    }
},
{
    index: 2,
    meta: {
        title: 'Delete customer',
        description: 'This action is responsible for deleting customer'
    },
    call: async (store) => {
        // return store
        throw new Error("Call Error")
    },
    restore: async (store) => {
        return "Restored";
        throw new Error("Restore Error")
    }
},
{
    index: 3,
    meta: {
        title: 'Delete customer',
        description: 'This action is responsible for deleting customer'
    },
    call: async (store) => {
        // return store
        throw new Error("Call Error")
    },
    restore: async (store) => {
        return "restored"
        throw new Error("Restore Error")
    }
},
{
    index: 4,
    meta: {
        title: 'Delete customer',
        description: 'This action is responsible for deleting customer'
    },
    call: async (store) => {
        return store
        throw new Error("Call Error")
    },
    restore: async (store) => {
        // return "restored"

        throw new Error("Restore Error")
    }
}
];




const transaction = new Transaction();

(async () => {
    try {
        await transaction.dispatch(scenario);
        const store = transaction.store; // {} | null
        const logs = transaction.logs; // []
        console.log(logs);
    } catch (err) {
        console.log(err.message);
        // log detailed error
    }
})();
























































