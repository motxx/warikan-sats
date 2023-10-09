import React from 'react';
import { IonCard, IonCardContent } from '@ionic/react';
import { Balance } from '../molecules/Balance';

type Props = {
    balance: number;
    lang: 'ja' | 'en';
}

export const BalanceCard: React.FC<Props> = (props: Props) => {
    return (
        <>
            <IonCard>
                <IonCardContent>
                    <h2>Balance</h2>
                    <Balance
                      lang={props.lang}
                      amount={props.balance}
                    />
                </IonCardContent>
            </IonCard>
        </>
    );
};
