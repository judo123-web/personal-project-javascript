
export interface SuccessfullCall extends IndexAndMeta{
    storeBefore: {};
    storeAfter: any;
    error: object;
};
export interface Success_Restore_after_Call_Error extends IndexAndMeta{
    storeBefore: object;
    error: {
        CallError?: string | null

        ;
        RestoreError?: null;
    };
    storeAfter: string;
};

export interface CallErrorWithoutRestore extends IndexAndMeta{
    error: {
        name: string;
        message: string;
    };
};
export interface FailedRestoreAfterCallError extends IndexAndMeta{
    error: {
        CallError: string;
        RestoreError: string;
    };
};
export interface SuccessRestorAfterRollback extends IndexAndMeta{
    storeBefore: string | object,
    storeAfter: string | object;
    error: { RestoreError?: null }
};

export interface RestoreWithErrorAfterRollback extends IndexAndMeta{
    error: {
        name: string;
        message: string;
    }
}


export interface ScenarioValidator extends IndexAndMeta {
    call: (store: any) => any;
    restore?: (store?: any) => any;

}
type IndexAndMeta = {
    index: number;
    meta: {
        title: string;
        description: string;
    }
}

