import React from 'react';
import { Amount } from '../atoms/Amount';

type Props = {
    amount: number;
    lang: 'ja' | 'en';
};

export const Balance: React.FC<Props> = (props: Props) => {
    return (
        <>
            <Amount
                currencyUnit={props.lang === 'ja' ? 'jpy' : 'usd'}
                amount={props.amount}
            />
        </>
    );
};
