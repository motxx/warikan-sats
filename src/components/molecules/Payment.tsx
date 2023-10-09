import { IonLabel } from "@ionic/react";
import { Amount } from "../atoms/Amount";

type Props = {
    type: 'sent' | 'received';
    currencyUnit: 'jpy' | 'usd';
    amount: number;
}

export const Payment: React.FC<Props> = (props: Props) => {
    return (
        <IonLabel>
            {props.type === 'sent' ? '-' : '+'}{` `}
            <Amount currencyUnit={props.currencyUnit} amount={props.amount} />
        </IonLabel>
    );
}
