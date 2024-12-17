import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";

export const useBS = <T = any>(subject?: BehaviorSubject<T>) => {
    const [state, setState] = useState<any>(() => subject?.value);

    useEffect(() => {
        const sub = subject?.subscribe(value => setState(value))
        return () => {
            sub?.unsubscribe();
        };
    }, [subject]);

    return state as T;
};