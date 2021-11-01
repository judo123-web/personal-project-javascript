import { CallErrorWithoutRestore, FailedRestoreAfterCallError, RestoreWithErrorAfterRollback, ScenarioValidator, SuccessfullCall, SuccessRestorAfterRollback, Success_Restore_after_Call_Error } from "./HardComponents";

{
    class Transaction {
        scen_index_arr: number[]
        sorted_scenario: any[]
        logs: Array<SuccessfullCall | CallErrorWithoutRestore | Success_Restore_after_Call_Error | FailedRestoreAfterCallError | SuccessRestorAfterRollback | RestoreWithErrorAfterRollback>;
        store: Object | null
        store2: object
        constructor() {
            this.scen_index_arr = []
            this.sorted_scenario = []
            this.logs = []
            this.store = {}
            this.store2 = {}
        }
        async dispatch(scenario: ScenarioValidator[]) {

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

            function create_suc_obj(storebf: object | number | string, element: any, result: any) {
                var object_res = {
                    ...{}, ...{
                        index: element.index,
                        meta: element.meta,
                        storeBefore: storebf,
                        error: { CallError: null },
                        storeAfter: result,
                    }
                }

                return object_res
            }

            function create_error_obj(element: any, err: Error) {
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
            var obj: Success_Restore_after_Call_Error | FailedRestoreAfterCallError
            head: for (var element of this.sorted_scenario) {
                try {
                    var result = await element.call(this.store2)
                    this.logs.push(create_suc_obj(this.store2, element, result) as SuccessfullCall)
                } catch (errs) {
                    try {
                        if (typeof element.restore !== 'undefined') {
                            var result = await element.restore(this.store2)
                            obj = create_suc_obj(this.store2, element, result) as Success_Restore_after_Call_Error
                            obj.error = {
                                CallError: JSON.stringify({
                                    name: (errs as Error).name,
                                    message: (errs as Error).message,
                                }),
                                RestoreError: null
                            }
                            this.logs.push(obj)
                            this.store = null
                        } else {
                            this.logs.push(create_error_obj(element, errs as Error) as CallErrorWithoutRestore);
                            this.store = {}
                        }

                    }
                    catch (err) {
                        obj = {
                            index: element.index,
                            meta: element.meta,
                            error: {
                                CallError: JSON.stringify({ name: (errs as Error).name, message: (errs as Error).message }),
                                RestoreError: JSON.stringify({ name: (errs as Error).name, message: (errs as Error).message }),
                            }
                        } as FailedRestoreAfterCallError
                        this.logs.push(obj)

                        this.logs.push(create_error_obj(element, err as Error))
                        this.store = {}

                        for (let element2 = this.sorted_scenario.indexOf(element) - 1; element2 >= 0; element2--) {
                            var element = this.sorted_scenario[element2]
                            try {
                                var result = await element.restore(this.store2)
                                var obj4 = create_suc_obj(this.store2, element, result) as SuccessRestorAfterRollback
                                obj4.error = {
                                    RestoreError: null
                                }
                                this.logs.push(obj4)
                            } catch (err) {
                                this.logs.push(create_error_obj(element, err as Error) as RestoreWithErrorAfterRollback);
                                break head
                            }
                        } break head

                    }
                } // AQ
            }


        }
    }


    const scenario = [{
        index: 1,
        meta: {
            title: 'Read popular customers',
            description: 'This action is responsible for reading the most popular customers'
        },
        call: async (store: any) => {
            return store
            throw new Error("Call Error")
        },
        restore: async (store: any) => {
            // return "Restored";
            throw new Error("Restore Error")
        }
    },
    {
        index: 2,
        meta: {
            title: 'Delete customer',
            description: 'This action is responsible for deleting customer'
        },
        call: async (store: any) => {
            return store
            throw new Error("Call Error")
        },
        restore: async (store: any) => {
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
        call: async (store: any) => {
            // return store
            throw new Error("Call Error")
        },
        restore: async (store: any) => {
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
        call: async (store: any) => {
            // return store
            throw new Error("Call Error")
        },
        restore: async (store: any) => {
            // return "restored"

            throw new Error("Restore Error")
        }
    }
    ]





    const transaction = new Transaction();

    (async () => {
        try {
            await transaction.dispatch(scenario);
            const store = transaction.store; // {} | null
            const logs = transaction.logs; // []
            console.log(logs);
        } catch (err) {
            console.log(err);
            // log detailed error
        }
    })();

}





