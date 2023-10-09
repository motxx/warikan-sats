import { IonLabel } from "@ionic/react";

export type Props = {
    label: string;
};

export const Label: React.FC<Props> = (props: Props) => {
    return (
        <IonLabel>{props.label}</IonLabel>
    );
}
